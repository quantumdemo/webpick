import { createClient } from '@/lib/supabase/server';
import { HeaderNav } from '@/components/HeaderNav';
import { ProfileClient } from './ProfileClient';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { connection } from 'next/server';

async function ProfileContent() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const userProfile = {
    id: user.id,
    email: user.email || 'user@example.com',
    fullName: user.user_metadata?.full_name || profile?.full_name || user.email?.split('@')[0],
    avatarUrl: user.user_metadata?.avatar_url || profile?.avatar_url || null,
    createdAt: user.created_at || new Date().toISOString(),
    plan: (profile?.plan || 'free') as 'free' | 'pro' | 'team',
    isPro: profile?.is_pro || profile?.plan === 'pro' || profile?.plan === 'team',
    credits: profile?.credits ?? (profile?.plan === 'pro' ? 50 : 10),
  };

  const currentYear = new Date().getFullYear();

  return (
    <>
      <ProfileClient initialProfile={userProfile} />
      <footer className="border-t border-white/10 py-6 px-6 text-center text-xs text-zinc-500 mt-auto">
        © {currentYear} WebPicks Inc. All rights reserved. Ethical Remake Studio.
      </footer>
    </>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col font-sans selection:bg-indigo-500/30">
      <HeaderNav activePage="profile" />
      <main className="max-w-4xl mx-auto px-6 py-10 flex-1 w-full space-y-8 flex flex-col">
        <Suspense fallback={
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <ProfileContent />
        </Suspense>
      </main>
    </div>
  );
}
