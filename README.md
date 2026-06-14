# 🇩🇪 Heimstadt — Premium Student & Expat Housing Platform

Heimstadt (formerly Heimat) is a state-of-the-art, high-performance web platform designed to solve the rental search challenges for international students and expats relocating to Germany. The platform caters to both landlords looking to list premium properties and tenants seeking reliable, high-quality housing.

---

## 🏗️ Architecture & Technology Stack

Heimstadt is built with a modern, full-stack architecture focusing on speed, responsiveness, and premium aesthetics:

- **Frontend & App Framework**: [Next.js 16 (Turbopack compiler)](https://nextjs.org/) utilizing the App Router, React 19, and Tailwind CSS.
- **Backend & Database**: [Supabase](https://supabase.com/) serving as the Postgres database, Realtime listener, and Row Level Security (RLS) managed authorization.
- **Authentication**: Supabase Auth supporting standard email/password credentials with verification workflows and Google OAuth integration.
- **Payments & Payouts**: [Stripe](https://stripe.com/) powering Checkout subscriptions for premium tiers and Stripe Connect for routing security deposits and rent directly to landlords.
- **Notifications**: [Twilio API](https://www.twilio.com/) sending automated WhatsApp booking notifications to users.
- **Maps & Location Services**: [Google Maps Platform](https://developers.google.com/maps) integrating dynamic maps, auto-completing search address fields, and proximity filtering.

---

## 🌟 Key Features

### 🏢 Premium Landlord Portal
- **Stripe Connect Integration**: Securely onboarding landlords and saving dynamic IBAN accounts for automated payouts.
- **Easy Listing Tool**: Auto-geocodes street addresses and structures room configuration, utilities, size (sqm), and rules.
- **Application Management**: Review bookings with real-time AI suitability scores.
- **WhatsApp Sync**: Toggles automatic instant mobile notifications for inbound tenant inquiries.

### 🎓 Tenant Verification & Dashboard
- **Document Manager**: Uploads and manages passport, student enrollment certificates, proof of income, and visa files directly into secure storage.
- **Suitability Pre-Screening**: Calculate overall match likelihood score based on verified documents, income brackets, and requirements.
- **Smart Bookings Tracker**: Transparent status tracking (Discovery ➔ Intent ➔ Documents ➔ Approval ➔ Deposit ➔ Move-in).

### 🏷️ Premium Tier Membership
- **Gold Verified Badge**: Displays a premium checkmark badge next to user profile cards.
- **AI Match Suitability Score**: Analyzes and certifies tenant applications to stand out to landlords.
- **WhatsApp Priority Alerts**: Direct line communication updates on rental statuses.

### 🌐 Localization & Design
- **Responsive Layout**: Designed for seamless usage across all screen sizes (mobile, tablet, and desktop).
- **Dual-Language support**: Complete toggleable language system support in English and German.
- **Premium Loading States**: Custom double-ring spinner with animated navy `#002046` and gold/orange `#f07d00` accents.

---

## 📂 Project Directory Structure

```
Heimant/
├── src/                             # Next.js App Source
│   ├── app/                         # Page components & API routes
│   │   ├── api/                     # Stripe, Twilio & AI score endpoints
│   │   ├── auth/                    # Login, Register, Verify, Callback, Role setup
│   │   ├── dashboard/               # Landlord and Tenant user dashboards
│   │   ├── suche/               # Map-based property search page
│   │   ├── inserieren/              # Property listing submission page
│   │   ├── objekt/                  # Property details page
│   │   ├── layout.tsx               # Global HTML structure
│   │   └── page.tsx                 # Homepage / Landing page component
│   ├── components/                  # Shared layouts, footers, and navigations
│   ├── context/                     # AuthContext and LanguageContext states
│   └── utils/                       # Supabase clients & utility helpers
├── supabase/                        # DB Migrations and RLS schemas
├── public/                          # Static assets & icons
├── .env.example                     # Environment variables template
└── package.json                     # Node dependencies
```

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
Ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn

### 2. Configure Environment Variables
Copy `.env.example` to a new `.env` file:
```bash
cp .env.example .env
```

Ensure the configuration variables are supplied:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

STRIPE_SECRET_KEY=your-stripe-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```
*Note: A resilient mock mode is activated automatically if Supabase configuration values are missing.*

### 3. Setup Database Schema
Execute the schema definitions inside `supabase/migrations` on your PostgreSQL database instance:
- `001_schema.sql`: Core tables (`profiles`, `properties`, `bookings`, `subscriptions`, etc.)
- `002_rls.sql`: Row level security policies ensuring user privacy.

### 4. Install Dependencies
Install dependencies from the root directory:
```bash
npm install
```

### 5. Run the Local Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ⚡ Performance Optimizations & Self-Healing

Heimstadt incorporates several custom optimizations to ensure high availability:
1. **Focus/Refocus background loads**: Subscriptions and dashboard data are refetched in the background without triggering full-screen loading spinners.
2. **Database Query Timeout**: A custom `promiseTimeout` helper drops slow database queries after 3 seconds, enabling smooth fallbacks to cached or mock data rather than freezing the UI.
3. **Decoupled Search Autocomplete**: The search page Google Maps frame is decoupled from reactive input keypresses to prevent map rerendering lag.
4. **OAuth Redirect Locks**: The auth callback page incorporates single-execution redirect checks, automated retry fallbacks, and hash cleansers to prevent Google login parameter loops.