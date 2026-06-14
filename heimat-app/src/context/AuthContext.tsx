"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/utils/supabase/client";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "tenant" | "landlord";
  avatar_url: string | null;
  preferred_language: string;
  created_at: string;
}

export interface SubscriptionDetails {
  plan: "1month" | "3months" | "12months";
  status: string;
  startDate: string;
  endDate: string;
  cancelAtPeriodEnd: boolean;
}

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  role: "tenant" | "landlord" | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isPremium: boolean;
  subscription: SubscriptionDetails | null;
  upgradeUser: (plan: "1month" | "3months" | "12months") => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async (userId: string) => {
    // Check localStorage first for rapid local development updates & mock mode
    const localSub = localStorage.getItem(`heimat_sub_${userId}`);
    if (localSub) {
      try {
        const parsed = JSON.parse(localSub);
        // Expiry check
        if (new Date(parsed.endDate).getTime() > Date.now()) {
          setSubscription(parsed);
          return;
        } else {
          localStorage.removeItem(`heimat_sub_${userId}`);
        }
      } catch (e) {
        console.error("Failed to parse local sub:", e);
      }
    }

    // Attempt to query Supabase if configured
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "active")
          .order("current_period_end", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          setSubscription({
            plan: "3months", // Default fallback if not detailed
            status: data.status,
            startDate: data.current_period_start,
            endDate: data.current_period_end,
            cancelAtPeriodEnd: data.cancel_at_period_end,
          });
          return;
        }
      }
    } catch (err) {
      console.warn("Could not fetch subscription from DB:", err);
    }
    setSubscription(null);
  };

  const fetchProfile = async (userId: string) => {
    try {
      await fetchSubscription(userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) {
        console.warn("Could not fetch user profile:", error.message);
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error("Error in fetchProfile:", err);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const upgradeUser = async (plan: "1month" | "3months" | "12months") => {
    if (!user) return;

    // Calculate dates
    const start = new Date();
    const end = new Date();
    if (plan === "1month") end.setMonth(end.getMonth() + 1);
    else if (plan === "3months") end.setMonth(end.getMonth() + 3);
    else if (plan === "12months") end.setFullYear(end.getFullYear() + 1);

    const subDetails: SubscriptionDetails = {
      plan,
      status: "active",
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      cancelAtPeriodEnd: false,
    };

    // 1. Cache to localStorage keyed by user ID
    localStorage.setItem(`heimat_sub_${user.id}`, JSON.stringify(subDetails));
    setSubscription(subDetails);

    // 2. Persist to database if configured
    try {
      if (isSupabaseConfigured()) {
        await supabase.from("subscriptions").insert({
          user_id: user.id,
          stripe_subscription_id: `sub_mock_${Date.now()}`,
          plan: "pro", // match subscription_plan enum from 001_schema.sql
          status: "active",
          current_period_start: start.toISOString(),
          current_period_end: end.toISOString(),
          cancel_at_period_end: false,
        });

        // If landlord, sync the role subscription_tier column
        if (profile?.role === "landlord") {
          await supabase
            .from("landlord_profiles")
            .update({ subscription_tier: "pro" })
            .eq("user_id", user.id);
        }
      }
    } catch (dbErr) {
      console.warn("DB subscription upgrade write bypassed (dev/mock environment):", dbErr);
    }
  };

  useEffect(() => {
    // Skip Supabase auth if not configured (dev mode without real env vars)
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        const currentUser = initialSession?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      } catch (err) {
        console.error("Error getting initial session:", err);
      } finally {
        setLoading(false);
      }
    };
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      const newUser = newSession?.user ?? null;
      setUser(newUser);
      
      if (newUser) {
        await fetchProfile(newUser.id);
      } else {
        setProfile(null);
        setSubscription(null);
      }
      setLoading(false);
    });

    return () => {
      authSub.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setSubscription(null);
    } catch (err) {
      console.error("Error during signout:", err);
    } finally {
      setLoading(false);
    }
  };

  const role = profile?.role ?? null;
  const isPremium = subscription !== null && subscription.status === "active";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        role,
        signOut,
        refreshProfile,
        isPremium,
        subscription,
        upgradeUser,
      }}
    >
      {loading ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#f07d00] border-t-transparent" />
            <p className="text-[14px] text-primary font-bold uppercase tracking-widest animate-pulse font-sans">Heimstadt</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
