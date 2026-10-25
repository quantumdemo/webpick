import Link from 'next/link';
import { HeaderNav } from '@/components/HeaderNav';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col font-sans">
      <HeaderNav />
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-6 flex-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-xs text-zinc-400">Last updated: January 2025</p>

        <section className="space-y-4 text-xs text-zinc-300 leading-relaxed">
          <h2 className="text-base font-bold text-white">1. Service Description</h2>
          <p>
            WebPicks provides an ethical design system extraction tool and website remake studio. We parse computed styling rules (colors, typography, spacing) without raw DOM cloning or copyright-violating asset duplication.
          </p>

          <h2 className="text-base font-bold text-white">2. Acceptable Use & Anti-Abuse</h2>
          <p>
            You agree not to use WebPicks to scrape personal data or bypass technical protection measures. Unauthenticated users are granted up to 3 free design extractions tracked via browser fingerprints and SHA-256 hashed IP addresses to prevent service abuse.
          </p>

          <h2 className="text-base font-bold text-white">3. Subscriptions & Payments</h2>
          <p>
            Payments are processed securely through Stripe (USD) and Paystack (NGN). Subscription cancellations and refunds follow standard payment provider policies.
          </p>

          <h2 className="text-base font-bold text-white">4. Contact Us</h2>
          <p>
            For legal inquiries, contact us at <a href="mailto:support@webpicks.so" className="text-indigo-400 underline">support@webpicks.so</a>.
          </p>
        </section>
      </main>
      <footer className="border-t border-white/10 py-6 px-6 text-center text-xs text-zinc-500">
        © WebPicks Inc. All rights reserved.
      </footer>
    </div>
  );
}
