# WebPicks - Pick the System. Remake the Web.

WebPicks is an ethical design system extraction platform and website remake studio that transforms live website URLs and UI screenshots into clean, accessible Next.js 15 & Tailwind CSS components, design tokens (`tokens.json`), and pre-formatted AI build briefs for Cursor, Claude Code, and ChatGPT.

---

## 📂 Repository File Structure

```
.
├── AGENTS.md
├── PRD.md
├── README.md
├── RESEARCH.md
├── app/
│   ├── api/
│   │   ├── extract/              # Playwright headless browser extraction
│   │   ├── extract-image/        # Vision AI screenshot analysis
│   │   ├── payments/             # Stripe & Paystack checkout/webhooks
│   │   └── projects/             # Supabase project DB CRUD routes
│   ├── dashboard/                # Main user dashboard
│   ├── login/                    # Supabase Auth & Google OAuth page
│   ├── pricing/                  # Stripe vs Paystack pricing page
│   ├── project/[id]/             # Remake Studio workspace
│   ├── error.tsx                 # Next.js error boundary
│   ├── loading.tsx               # Next.js skeleton loading page
│   └── page.tsx                  # Marketing landing page
├── components/
│   ├── HeaderNav.tsx             # Global header with auth state
│   ├── StudioClient.tsx          # Responsive Remake Studio UI
│   └── ui/                       # Shadcn UI primitives (button, card, input, tabs)
├── lib/
│   ├── payments/
│   │   ├── index.ts              # Unified PaymentProvider interface
│   │   ├── paystack.ts           # Paystack (NGN) payment provider
│   │   └── stripe.ts             # Stripe (USD) payment provider
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server-side Supabase client
│   └── utils.ts                  # WCAG calculation & zip generators
├── public/                       # Static public assets
├── schema.sql                    # PostgreSQL schema & RLS security rules
├── .env.example                  # Environment variable blueprint
└── vercel.json                   # Vercel deployment configuration
```

---

## 💳 Payment Gateway Toggle (Stripe vs. Paystack)

WebPicks features multi-provider global payment handling:
- **Paystack (NGN 🇳🇬):** Automatically recommended or selectable for users in Nigeria/Africa paying in Nigerian Naira (`NGN`).
- **Stripe (USD 🌐):** Default international gateway processing USD credit card subscriptions worldwide via Stripe Checkout.

---

## 📱 Responsive Mobile Remake Studio

The Remake Studio workspace (`components/StudioClient.tsx`) adapts to all viewports:
- **Mobile (< 768px):** Displays a compact header and renders as a 3-trigger tabbed workspace (`Style Guide`, `Preview Canvas`, `Export Code`) ensuring a clean single-column interface without horizontal scrolling.
- **Desktop (≥ 768px):** Expands into an interactive 3-column studio with left palette tokens, central interactive canvas, and right live code tabs.

---

## 🚀 Setup & Installation

1. **Clone Repository & Install Dependencies:**
   ```bash
   git clone https://github.com/your-org/webpicks.git
   cd webpicks
   npm install
   npx playwright install chromium
   ```

2. **Environment Configuration:**
   Copy `.env.example` to `.env.local` and enter your Supabase, Stripe, and Paystack API keys:
   ```bash
   cp .env.example .env.local
   ```

3. **Database Initialization (`schema.sql`):**
   Run `schema.sql` inside your Supabase PostgreSQL Editor to create the `projects` table and enable Row Level Security:
   ```sql
   CREATE TABLE IF NOT EXISTS public.projects (
     id TEXT PRIMARY KEY,
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
   CREATE POLICY "Users can manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).
