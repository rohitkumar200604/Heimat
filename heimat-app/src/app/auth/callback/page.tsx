"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const handleRedirect = async (user: any) => {
      try {
        // Fetch user profile to determine their role and redirect
        let { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // Self-healing: If the profiles row doesn't exist (e.g. created before DB triggers were set up),
        // we dynamically create it here from the frontend so the user is never stuck.
        if (error || !profile) {
          console.warn("Profile not found in database, dynamically creating profile from frontend...");
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";
          
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email,
              full_name: fullName,
              role: null, // role is null initially so they can choose it on select-role!
            })
            .select("role")
            .single();

          if (!insertError && newProfile) {
            profile = newProfile;
          } else {
            console.error("Failed to dynamically create profile:", insertError);
          }
        }

        if (profile && mounted) {
          if (!profile.role) {
            router.push("/auth/select-role");
          } else {
            const url = profile.role === "landlord" ? "/dashboard/landlord" : "/dashboard/tenant";
            router.push(url);
          }
          return;
        }
      } catch (err) {
        console.error("Error during auth callback routing:", err);
        if (mounted) router.push("/");
      }
    };

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        await handleRedirect(session.user);
      }
    };

    // Listen for auth state changes (crucial for Google OAuth hashes)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || session) && mounted) {
        if (session?.user) {
          await handleRedirect(session.user);
        }
      }
    });

    checkSession();

    // Safety timeout: fallback to home after 5 seconds to avoid freezing on loading screen
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        console.warn("OAuth callback timeout. Redirecting to home page.");
        router.push("/");
      }
    }, 5000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mx-auto" />
        <p className="text-on-surface-variant font-medium text-body-md">
          Anmeldung wird abgeschlossen...
        </p>
      </div>
    </div>
  );
}
