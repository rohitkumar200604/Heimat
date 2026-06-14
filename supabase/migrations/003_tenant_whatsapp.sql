-- supabase/migrations/003_tenant_whatsapp.sql
-- Add whatsapp_enabled toggle to tenant_profiles (mirrors landlord_profiles)

ALTER TABLE public.tenant_profiles
  ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT FALSE NOT NULL;
