'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/HeaderNav';
import { Check, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleCheckout = (planName: string) => {
    toast.info(`Redirecting to Stripe Checkout for ${planName} Plan...`);
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col font-sans selection:bg-indigo-500/30">
      <Toaster position="bottom-right" theme="dark" />
      <HeaderNav activePage="pricing" />

      {/* Hero Header */}
      <section className="py-16 px-6 text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Transparent & Fair Pricing
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Pick Your Design Extraction Superpowers
        </h1>
        <p className="text-zinc-400 text-base max-w-xl mx-auto">
          Extract design tokens from any website or screenshot. Export clean Next.js + Tailwind CSS components.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="pt-6 flex items-center justify-center gap-3">
          <span className={`text-xs font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-zinc-500'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-12 h-6 bg-zinc-800 border border-white/10 rounded-full p-1 relative transition"
          >
            <div
              className={`w-4 h-4 bg-indigo-500 rounded-full transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-zinc-500'}`}>
            Yearly Billing <span className="text-indigo-400 font-bold">(Save 20%)</span>
          </span>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <div className="bg-zinc-900/60 border border-white/10 p-8 rounded-2xl flex flex-col justify-between space-y-6 hover:border-white/20 transition">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Starter</h3>
            <p className="text-xs text-zinc-400">Perfect for trying out WebPicks on small projects.</p>
            <div className="text-3xl font-extrabold">
              $0 <span className="text-xs font-normal text-zinc-500">/ forever</span>
            </div>
            <ul className="space-y-3 pt-4 border-t border-white/10 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" /> 3 Project Extractions
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" /> Standard Tailwind Exports
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" /> WCAG Color Contrast Checker
              </li>
              <li className="flex items-center gap-2 text-zinc-500">
                <Check className="w-4 h-4 text-zinc-600" /> Screenshot Vision AI (Pro)
              </li>
            </ul>
          </div>
          <Link
            href="/dashboard"
            className="w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2.5 rounded-xl text-xs transition border border-white/10"
          >
            Get Started Free
          </Link>
        </div>

        {/* Pro Plan (Featured) */}
        <div className="bg-gradient-to-b from-indigo-900/40 via-zinc-900/90 to-zinc-900/60 border-2 border-indigo-500 p-8 rounded-2xl flex flex-col justify-between space-y-6 shadow-2xl shadow-indigo-500/10 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider shadow-lg">
            Most Popular
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Pro Architect <Zap className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-zinc-300">For freelance developers, designers, and web creators.</p>
            <div className="text-4xl font-extrabold">
              {billingCycle === 'monthly' ? '$12' : '$10'}{' '}
              <span className="text-xs font-normal text-zinc-400">/ month</span>
            </div>
            <ul className="space-y-3 pt-4 border-t border-white/10 text-xs text-zinc-200">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400" /> 100 Project Extractions / mo
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400" /> Vision AI Screenshot to Code
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400" /> Next.js 15 + Tailwind Zip Export
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400" /> Cursor & Claude Code AI Prompts
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleCheckout('Pro')}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            Upgrade to Pro <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Team Plan */}
        <div className="bg-zinc-900/60 border border-white/10 p-8 rounded-2xl flex flex-col justify-between space-y-6 hover:border-white/20 transition">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Team Studio</h3>
            <p className="text-xs text-zinc-400">For agencies & design engineering teams.</p>
            <div className="text-3xl font-extrabold">
              {billingCycle === 'monthly' ? '$29' : '$24'}{' '}
              <span className="text-xs font-normal text-zinc-500">/ month</span>
            </div>
            <ul className="space-y-3 pt-4 border-t border-white/10 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" /> Unlimited Extractions
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" /> Shared Team Token Library
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" /> Priority Headless Extraction Engine
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" /> Dedicated API & Webhook Support
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleCheckout('Team')}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2.5 rounded-xl text-xs transition border border-white/10"
          >
            Upgrade to Team
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-6 text-center text-xs text-zinc-500 mt-auto">
        © 2025 WebPicks Inc. All rights reserved. Ethical Design Extraction Platform.
      </footer>
    </div>
  );
}
