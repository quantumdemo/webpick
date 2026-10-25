'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function HeaderNav({ activePage }: { activePage?: string }) {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);

  useEffect(() => {
    async function checkUser() {
      try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
          const supabase = createClient();
          const { data } = await supabase.auth.getUser();
          if (data?.user) {
            setUser({
              email: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            });
            return;
          }
        }
      } catch (err) {
        // Safe catch
      }
      setUser(null);
    }
    checkUser();
  }, []);

  const handleSignOut = async () => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
    } catch (e) {
      // Safe catch
    }
    setUser(null);
    router.push('/login');
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
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 px-3 py-1.5 rounded-full text-xs transition"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                {user.name?.[0]?.toUpperCase() || <UserIcon className="w-3 h-3" />}
              </div>
              <span className="text-zinc-200 font-medium">{user.email}</span>
              <Settings className="w-3.5 h-3.5 text-zinc-400" />
            </Link>

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
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-indigo-600/20"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
