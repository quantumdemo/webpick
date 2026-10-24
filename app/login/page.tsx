'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers, ArrowRight, ShieldCheck, Mail, Lock, Sparkles, Globe } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'signup' && !agreed) {
      setMessage({ type: 'error', text: 'You must agree to the Terms of Service and Privacy Policy.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      if (authMode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        setMessage({ type: 'success', text: 'Logged in successfully! Redirecting...' });
        setTimeout(() => router.push('/dashboard'), 600);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;
        setMessage({
          type: 'success',
          text: 'Account created! Please check your email to confirm registration or sign in.',
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Authentication failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Google OAuth initiation failed' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col justify-between selection:bg-indigo-500/30 font-sans">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:opacity-90 transition">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span>WebPicks</span>
        </Link>
        <Link
          href="/"
          className="text-xs text-zinc-400 hover:text-white transition px-3 py-1.5 rounded-md border border-white/10 hover:border-white/20"
        >
          Back to Home
        </Link>
      </header>

      {/* Main Login Box */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md space-y-6 bg-zinc-900/60 border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              WebPicks Design Studio
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {authMode === 'signin' ? 'Welcome Back' : 'Create an Account'}
            </h1>
            <p className="text-sm text-zinc-400">
              {authMode === 'signin'
                ? 'Sign in to access your design systems and remake studio.'
                : 'Sign up to extract design tokens and build Next.js apps.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-white/10 text-xs font-semibold">
            <button
              onClick={() => { setAuthMode('signin'); setMessage(null); }}
              className={`flex-1 py-2 rounded-lg transition ${
                authMode === 'signin' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setMessage(null); }}
              className={`flex-1 py-2 rounded-lg transition ${
                authMode === 'signup' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-xs font-medium border ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700/80 text-white font-medium py-2.5 rounded-lg border border-white/10 transition text-sm disabled:opacity-50"
            >
              <Globe className="w-4 h-4 text-indigo-400" />
              Continue with Google
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#0A0B0E] px-3 text-[11px] uppercase tracking-wider text-zinc-500 font-semibold absolute">
                or email
              </span>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-zinc-950/80 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950/80 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {authMode === 'signup' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="terms" className="text-[11px] text-zinc-400">
                    I agree to the{' '}
                    <Link href="/terms" className="text-indigo-400 underline" target="_blank">
                      Terms
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-indigo-400 underline" target="_blank">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (authMode === 'signup' && !agreed)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {authMode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center text-[11px] text-zinc-400 pt-2 border-t border-white/10">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline text-zinc-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline text-zinc-300">
              Privacy Policy
            </Link>.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-4 px-6 text-center text-xs text-zinc-500 relative z-10">
        © 2025 WebPicks Inc. All rights reserved. Ethical Remake Studio.
      </footer>
    </div>
  );
}
