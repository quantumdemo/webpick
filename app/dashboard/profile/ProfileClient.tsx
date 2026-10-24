'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, CreditCard, ShieldAlert, Zap, LogOut, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast, Toaster } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface ProfileData {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  createdAt: string;
  plan: 'free' | 'pro' | 'team';
  isPro: boolean;
  credits: number;
}

export function ProfileClient({ initialProfile }: { initialProfile: ProfileData }) {
  const router = useRouter();
  const supabase = createClient();
  const [profile] = useState(initialProfile);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const maxCredits = profile.plan === 'team' ? 'Unlimited' : profile.plan === 'pro' ? 50 : 10;
  const creditsUsed = profile.plan === 'team' ? 0 : Math.max(0, (typeof maxCredits === 'number' ? maxCredits : 10) - profile.credits);

  const handlePortal = async () => {
    toast.info('Opening subscription management portal...');
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        router.push('/pricing');
      }
    } catch (err) {
      toast.error('Failed to open billing portal');
    }
  };

  const handleCheckout = async (plan: 'pro' | 'team', provider: 'stripe' | 'paystack') => {
    toast.info(`Redirecting to ${provider === 'paystack' ? 'Paystack (NGN)' : 'Stripe (USD)'} Checkout...`);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          provider,
          userEmail: profile.email,
          userId: profile.id,
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      toast.error('Checkout failed');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out');
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await supabase.from('profiles').delete().eq('id', profile.id);
      await supabase.auth.signOut();
      toast.success('Account deleted');
      router.push('/');
    } catch (err) {
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <Toaster position="bottom-right" theme="dark" />

      {/* Header Overview Card */}
      <Card className="bg-zinc-900/80 border-white/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-2xl text-indigo-400">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              profile.fullName?.[0]?.toUpperCase() || <User className="w-8 h-8" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">{profile.fullName}</h1>
            <p className="text-xs text-zinc-400">{profile.email}</p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            {profile.plan.toUpperCase()} PLAN
          </span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-3.5 h-3.5 mr-1" /> Sign Out
          </Button>
        </div>
      </Card>

      {/* Credits & Usage Card */}
      <Card className="bg-zinc-900/60 border-white/10">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Usage & Extraction Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Monthly Extraction Limit:</span>
            <span className="font-bold text-white">
              {profile.credits} / {maxCredits} Credits Remaining
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{
                width: profile.plan === 'team' ? '100%' : `${Math.min(100, (profile.credits / (typeof maxCredits === 'number' ? maxCredits : 10)) * 100)}%`,
              }}
            />
          </div>

          <p className="text-xs text-zinc-500">
            {profile.plan === 'free'
              ? 'Free Starter tier provides 10 lifetime design system extraction credits.'
              : profile.plan === 'pro'
              ? 'Pro Architect tier provides 50 monthly extractions + Vision AI analysis.'
              : 'Team Studio tier provides unlimited design extractions and shared libraries.'}
          </p>
        </CardContent>
      </Card>

      {/* Subscription & Billing Card */}
      <Card className="bg-zinc-900/60 border-white/10">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-400" /> Subscription & Billing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile.isPro ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
                <span>Active Subscription: <strong>{profile.plan.toUpperCase()} Plan</strong></span>
                <span className="font-semibold">RENWAL ACTIVE</span>
              </div>
              <Button onClick={handlePortal} size="sm">
                Manage Invoices & Billing Portal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Upgrade to Pro Architect for 50 monthly extractions, Vision AI screenshot analysis, and complete Next.js + Tailwind CSS project downloads.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button onClick={() => handleCheckout('pro', 'stripe')} className="w-full">
                  Pay via Stripe ($12/mo) <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
                <Button onClick={() => handleCheckout('pro', 'paystack')} variant="secondary" className="w-full">
                  Pay via Paystack (₦15,000/mo) <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-red-950/20 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-base text-red-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-zinc-400">
            Deleting your account will permanently remove all extracted design tokens, project history, and active subscriptions.
          </p>
          {deleteConfirm ? (
            <div className="flex items-center gap-3">
              <Button variant="danger" size="sm" onClick={handleDeleteAccount} disabled={loading}>
                {loading ? 'Deleting...' : 'Confirm Delete Account'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(true)}>
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Account
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
