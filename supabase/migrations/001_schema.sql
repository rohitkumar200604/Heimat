-- supabase/migrations/001_schema.sql
-- Core Schema for Heimat Marketplace

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Roles/Tiers enum
CREATE TYPE user_role AS ENUM ('tenant', 'landlord');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE booking_status AS ENUM ('pending', 'docs_review', 'approved', 'deposit_paid', 'confirmed', 'cancelled', 'expired');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'early_access');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');
CREATE TYPE document_type AS ENUM ('passport', 'visa', 'enrollment', 'income');

-- 1. Create profiles linked to auth.users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    role user_role DEFAULT 'tenant'::user_role,
    avatar_url TEXT,
    preferred_language TEXT DEFAULT 'de',
    gdpr_consented_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Landlord Profiles
CREATE TABLE public.landlord_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_account_id TEXT,
    iban_last4 VARCHAR(4),
    subscription_tier TEXT DEFAULT 'free',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    whatsapp_enabled BOOLEAN DEFAULT FALSE NOT NULL
);

-- 3. Create Tenant Profiles
CREATE TABLE public.tenant_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nationality TEXT,
    university TEXT,
    enrollment_date DATE,
    graduation_date DATE,
    employment_status TEXT,
    monthly_income NUMERIC(10, 2),
    ai_score INT CHECK (ai_score >= 0 AND ai_score <= 100),
    verified_at TIMESTAMP WITH TIME ZONE,
    early_access BOOLEAN DEFAULT FALSE NOT NULL,
    stripe_customer_id TEXT
);

-- 4. Create Properties
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id UUID NOT NULL REFERENCES public.landlord_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    street TEXT,
    city TEXT NOT NULL,
    zip TEXT,
    lat NUMERIC(10, 7),
    lng NUMERIC(10, 7),
    property_type TEXT DEFAULT 'apartment',
    size_sqm NUMERIC(6, 2) NOT NULL,
    rooms NUMERIC(3, 1) NOT NULL,
    floor INT,
    rent_cold NUMERIC(10, 2) NOT NULL,
    rent_utilities NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    rent_heating NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    deposit_months INT DEFAULT 3 NOT NULL,
    available_from DATE DEFAULT CURRENT_DATE NOT NULL,
    min_stay_months INT DEFAULT 1,
    max_stay_months INT,
    furnished BOOLEAN DEFAULT FALSE NOT NULL,
    pets_allowed BOOLEAN DEFAULT FALSE NOT NULL,
    students_only BOOLEAN DEFAULT FALSE NOT NULL,
    amenities JSONB DEFAULT '[]'::jsonb NOT NULL,
    energy_class VARCHAR(2),
    year_built INT,
    status TEXT DEFAULT 'active',
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    view_count INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Property Photos
CREATE TABLE public.property_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    s3_key TEXT NOT NULL,
    cdn_url TEXT NOT NULL,
    order_index INT DEFAULT 0 NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE NOT NULL,
    alt_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Verification Documents
CREATE TABLE public.verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doc_type document_type NOT NULL,
    s3_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    status verification_status DEFAULT 'pending'::verification_status NOT NULL,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    ai_extracted_data JSONB DEFAULT '{}'::jsonb NOT NULL,
    expires_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Subscriptions
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    plan subscription_plan NOT NULL,
    status subscription_status NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create Bookings
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE RESTRICT,
    tenant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    landlord_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    status booking_status DEFAULT 'pending'::booking_status NOT NULL,
    move_in_date DATE NOT NULL,
    move_out_date DATE NOT NULL,
    rent_total NUMERIC(10, 2) NOT NULL,
    service_fee_pct NUMERIC(4, 2) DEFAULT 8.00 NOT NULL,
    stripe_payment_intent_id TEXT,
    stripe_transfer_id TEXT,
    cancellation_reason TEXT,
    landlord_note TEXT,
    tenant_note TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Create AI Tenant Scores
CREATE TABLE public.ai_tenant_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    overall_score INT NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    employment_score INT CHECK (employment_score >= 0 AND overall_score <= 100),
    doc_score INT CHECK (doc_score >= 0 AND overall_score <= 100),
    stay_length_score INT CHECK (stay_length_score >= 0 AND overall_score <= 100),
    income_score INT CHECK (income_score >= 0 AND overall_score <= 100),
    reasoning TEXT,
    flags JSONB DEFAULT '[]'::jsonb NOT NULL,
    model_version TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Create Messages / Notifications
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    channel TEXT DEFAULT 'in_app',
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    whatsapp_sid TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
