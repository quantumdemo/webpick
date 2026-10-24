/* Schema for WebPicks Supabase Database */

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  credits INT DEFAULT 10,
  is_pro BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  paystack_customer_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.anonymous_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint TEXT,
  ip_hash TEXT NOT NULL,
  snaps_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anon_fingerprint ON public.anonymous_usage(fingerprint);
CREATE INDEX IF NOT EXISTS idx_anon_ip_hash ON public.anonymous_usage(ip_hash);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Public anonymous usage access" ON public.anonymous_usage FOR ALL USING (true);
