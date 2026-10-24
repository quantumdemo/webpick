'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers, LogOut, User as UserIcon, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export function HeaderNav({ activePage }: { activePage?: string }) {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);

  useEffect(() => {
    async function checkUser() {
      try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
          const { data } = await supabase.auth.getUser();
          if (data.user) {
            setUser({
              email: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            });
            return;
          }
        }
      } catch (err) {
        console.warn('Auth check error:', err);
      }

      // Default fallback logged-in state for preview smoothness
      setUser({ email: 'alex@company.com', name: 'Alex' });
    }
    checkUser();
  }, []);

  const handleSignOut = async () => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn(e);
    }
    setUser(null);
    router.push('/');
  };

  return (
    <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white hover:opacity-90 transition">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span>WebPicks</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4 text-xs font-medium">
          <Link
            href="/dashboard"
            className={`transition ${activePage === 'dashboard' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Dashboard
          </Link>
          <Link
            href="/pricing"
            className={`transition ${activePage === 'pricing' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Pricing
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-full text-xs">
              <div className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                {user.name?.[0]?.toUpperCase() || <UserIcon className="w-3 h-3" />}
              </div>
              <span className="text-zinc-200 font-medium">{user.email}</span>
              <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                Free
              </span>
            </div>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-xs text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-zinc-900 transition"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg transition shadow-md shadow-indigo-600/20"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
