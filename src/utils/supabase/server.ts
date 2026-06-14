import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock-project.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "mock-service-key";

export const getSupabaseServer = () => {
  return createClient(supabaseUrl, supabaseServiceKey);
};
