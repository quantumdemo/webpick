import Link from 'next/link';
import { HeaderNav } from '@/components/HeaderNav';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col font-sans">
      <HeaderNav />
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-6 flex-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-zinc-400">Last updated: January 2025</p>

        <section className="space-y-4 text-xs text-zinc-300 leading-relaxed">
          <h2 className="text-base font-bold text-white">1. Data Collection & Usage</h2>
          <p>
            We collect account emails via Supabase Auth, browser fingerprints, and SHA-256 hashed IP addresses (`ip_hash`) to enforce anonymous freemium extraction limits and prevent rate abuse in compliance with GDPR and NDPA regulations.
          </p>

          <h2 className="text-base font-bold text-white">2. Payment Processing</h2>
          <p>
            Payment transactions are processed externally by Stripe and Paystack. We do not store full credit card numbers on WebPicks servers.
          </p>

          <h2 className="text-base font-bold text-white">3. Cookies</h2>
          <p>
            We use functional cookies (`webpick_fingerprint`) and authentication session cookies to deliver service features.
          </p>

          <h2 className="text-base font-bold text-white">4. Contact Information</h2>
          <p>
            For data protection inquiries, email <a href="mailto:privacy@webpicks.so" className="text-indigo-400 underline">privacy@webpicks.so</a>.
          </p>
        </section>
      </main>
      <footer className="border-t border-white/10 py-6 px-6 text-center text-xs text-zinc-500">
        © 2025 WebPicks Inc. All rights reserved.
      </footer>
    </div>
  );
}
