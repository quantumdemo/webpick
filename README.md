# WebPicks - Pick the System. Remake the Web.

WebPicks is an ethical design system extraction platform and website remake studio that transforms live website URLs and screenshots into clean, accessible Next.js 15 & Tailwind CSS components, design tokens (`tokens.json`), and pre-formatted AI build briefs for Cursor, Claude Code, and ChatGPT.

---

## 📂 File Structure

```
.
├── app/
│   ├── api/
│   │   ├── extract/              # Playwright headless browser extraction
│   │   ├── extract-image/        # Vision AI screenshot analysis
│   │   ├── payments/
│   │   │   ├── checkout/         # Stripe & Paystack checkout router
│   │   │   └── webhook/          # Payment status webhook listener
│   │   └── projects/             # Project database CRUD operations
│   ├── dashboard/                # Project dashboard with URL & Image import
│   ├── login/                    # Passwordless & Google OAuth login
│   ├── pricing/                  # Pricing page with Stripe/Paystack toggle
│   ├── project/[id]/             # 3-panel Remake Studio workspace
│   ├── error.tsx                 # Global error boundary
│   ├── loading.tsx               # Global loading skeleton
│   └── page.tsx                  # Marketing landing page
├── components/
│   ├── HeaderNav.tsx             # Global header with auth state
│   └── StudioClient.tsx          # Responsive 3-pane Remake Studio
├── lib/
│   ├── payments/
│   │   ├── index.ts              # Unified PaymentProvider interface
│   │   ├── paystack.ts           # Paystack (NGN) implementation
│   │   └── stripe.ts             # Stripe (USD) implementation
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server-side Supabase client
│   └── utils.ts                  # WCAG calculation & zip generators
├── public/
├── schema.sql                    # PostgreSQL database schema & RLS rules
├── .env.example                  # Environment variable reference
├── README.md
└── vercel.json                   # Vercel deployment config
```

---

## ✨ Features

- **Ethical Design System Extractor:** Parses live URLs with headless Playwright without raw DOM or CSS code cloning.
- **Vision AI Screenshot Reconstructor:** Transforms Dribbble shots, Figma designs, or screenshots into structured design tokens.
- **3-Panel Remake Studio:**
  - *Left:* Palette swatches with automated WCAG AA/AAA accessibility checks, font scale, and radii tokens.
  - *Center:* Live interactive preview canvas with Dark, Light, Cyberpunk, and Emerald theme modes, inline `contentEditable` text, and viewport switching (Desktop, Tablet, Mobile).
  - *Right:* Real copyable code panels for `tokens.json`, `tailwind.config.js`, `DESIGN.md`, and AI build prompts.
- **Next.js 15 Starter Package Exporter:** Generates ready-to-run `.zip` packages via JSZip containing `tailwind.config.js`, `app/globals.css`, `lib/tokens.json`, `components/Hero.tsx`, and `README.md`.
- **Multi-Gateway Payments:** Supports **Stripe (USD)** and **Paystack (NGN 🇳🇬)** with automatic pricing toggles.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 App Router (TypeScript, Turbopack)
- **Styling:** Tailwind CSS, Lucide Icons, Sonner Toasts
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Auth)
- **Extraction Engine:** Playwright Headless Browser & Vision AI Token Mapper
- **Payments:** Stripe SDK & Paystack REST API
- **Zip Packaging:** JSZip

---

## 🚀 Setup & Installation

1. **Clone & Install Dependencies:**
   ```bash
   git clone https://github.com/your-org/webpicks.git
   cd webpicks
   npm install
   npx playwright install chromium
   ```

2. **Environment Configuration:**
   Copy `.env.example` to `.env.local` and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Database Setup (`schema.sql`)

Execute `schema.sql` inside your Supabase SQL Editor to initialize tables and Row Level Security:

```sql
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  image_url TEXT,
  type TEXT NOT NULL CHECK (type IN ('url', 'image')),
  tokens_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  screenshot_url TEXT,
  theme TEXT DEFAULT 'dark',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
```

---

## 💳 Payment Gateway Toggle (Stripe vs. Paystack)

WebPicks features dual payment provider support:
- **Stripe:** Handles USD billing for global users via Stripe Checkout sessions.
- **Paystack:** Handles NGN (Nigerian Naira) transactions using Paystack's transaction initialization API. Users can select their preferred gateway directly on the `/pricing` page.

---

## 🌐 Deployment (Vercel)

The repository includes `vercel.json` configured for Next.js 15. Set all environment variables specified in `.env.example` inside your Vercel Project Settings before deploying.
