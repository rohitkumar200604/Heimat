"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Wait a small moment for Supabase to process the hash/session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch user profile to determine their role and redirect
          let { data: profile, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          // Self-healing: If the profiles row doesn't exist (e.g. created before DB triggers were set up),
          // we dynamically create it here from the frontend so the user is never stuck.
          if (error || !profile) {
            console.warn("Profile not found in database, dynamically creating profile from frontend...");
            const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || "";
            
            const { data: newProfile, error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: session.user.id,
                email: session.user.email,
                full_name: fullName,
                role: "tenant", // Default to tenant
              })
              .select("role")
              .single();

            if (!insertError && newProfile) {
              profile = newProfile;
              
              // Also create corresponding tenant profile
              await supabase
                .from("tenant_profiles")
                .insert({
                  user_id: session.user.id
                });
            } else {
              console.error("Failed to dynamically create profile:", insertError);
            }
          }

          if (profile) {
            if (!profile.role) {
              router.push("/auth/select-role");
            } else {
              const url = profile.role === "landlord" ? "/dashboard/landlord" : "/dashboard/tenant";
              router.push(url);
            }
            return;
          }
        }
      } catch (err) {
        console.error("Error during auth callback routing:", err);
      }
      
      // Default fallback if no profile or session is found
      router.push("/");
    };

    handleAuthCallback();
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
