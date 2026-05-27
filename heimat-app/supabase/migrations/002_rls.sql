-- supabase/migrations/002_rls.sql
-- Row Level Security (RLS) policies for Heimat

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landlord_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tenant_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Landlord Profiles Policies
CREATE POLICY "Landlords can view their own landlord profile" ON public.landlord_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Landlords can update their own landlord profile" ON public.landlord_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Landlords can insert their own landlord profile" ON public.landlord_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Tenant Profiles Policies
CREATE POLICY "Tenants can view their own tenant profile" ON public.tenant_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Tenants can update their own tenant profile" ON public.tenant_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Tenants can insert their own tenant profile" ON public.tenant_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Properties Policies
CREATE POLICY "Properties are viewable by everyone" ON public.properties
    FOR SELECT USING (status = 'active');

CREATE POLICY "Landlords can manage their own properties" ON public.properties
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.landlord_profiles
            WHERE landlord_profiles.id = properties.landlord_id
            AND landlord_profiles.user_id = auth.uid()
        )
    );

-- 5. Property Photos Policies
CREATE POLICY "Property photos are viewable by everyone" ON public.property_photos
    FOR SELECT USING (true);

CREATE POLICY "Landlords can manage photos of their own properties" ON public.property_photos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.properties p
            JOIN public.landlord_profiles lp ON lp.id = p.landlord_id
            WHERE p.id = property_photos.property_id
            AND lp.user_id = auth.uid()
        )
    );

-- 6. Verification Documents Policies
CREATE POLICY "Users can view and upload their own documents" ON public.verification_documents
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Landlords can view documents of tenants who booked their properties" ON public.verification_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.tenant_id = verification_documents.user_id
            AND b.landlord_id = auth.uid()
        )
    );

-- 7. Subscriptions Policies
CREATE POLICY "Users can view their own subscription status" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- 8. Bookings Policies
CREATE POLICY "Tenants can view and create bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Tenants can insert bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Landlords can view bookings of their own properties" ON public.bookings
    FOR SELECT USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords and Tenants can update bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = landlord_id OR auth.uid() = tenant_id);

-- 9. AI Tenant Scores Policies
CREATE POLICY "Tenants can view their own AI scores" ON public.ai_tenant_scores
    FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Landlords can view AI scores of bookings for their properties" ON public.ai_tenant_scores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = ai_tenant_scores.booking_id
            AND b.landlord_id = auth.uid()
        )
    );

-- 10. Messages Policies
CREATE POLICY "Users can view messages sent to or by them" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);
