'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Code2,
  Cpu,
  Palette,
  FileCode,
  Zap,
  Globe,
  UploadCloud
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function LandingPage() {
  const router = useRouter();
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;

    setLoading(true);
    toast.info('Extracting design tokens with Playwright engine...');

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to extract design tokens');
        return;
      }

      toast.success('Design tokens extracted! Opening Remake Studio...');
      if (data.project?.id) {
        router.push(`/project/${data.project.id}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error('Extraction error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col font-sans selection:bg-indigo-500/30">
      <Toaster position="bottom-right" theme="dark" />

      {/* Top Bar */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0A0B0E]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">WebPicks</span>
        </div>

        <nav className="flex items-center gap-6 text-xs font-medium">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white transition">
            Dashboard
          </Link>
          <Link href="/pricing" className="text-zinc-400 hover:text-white transition">
            Pricing
          </Link>
          <Link
            href="/login"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-indigo-600/20"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6 text-center max-w-5xl mx-auto space-y-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Ethical Design Extraction & Remake Studio
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
          Pick the System. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent">
            Remake the Web.
          </span>
        </h1>

        <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Extract computed color scales, WCAG contrast, typography, and component variants from any website or screenshot. Export clean Next.js 15 & Tailwind CSS components.
        </p>

        {/* Action URL Extractor Box */}
        <form onSubmit={handleExtract} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 pt-4">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-zinc-500 absolute left-4 top-4" />
            <input
              type="url"
              required
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste website URL (e.g. https://linear.app)"
              className="w-full bg-zinc-900/90 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Extract Design DNA <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 pt-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Zero Scraping / Junk HTML
          </span>
          <span className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-indigo-400" /> Next.js 15 + Tailwind CSS Exports
          </span>
          <span className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-purple-400" /> AI Prompts for Cursor & Claude Code
          </span>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 border-t border-white/10 bg-zinc-950/40 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Why WebPicks Beats Legacy Site Peelers</h2>
            <p className="text-xs text-zinc-400">
              Stop copying broken DOM trees and messy raw CSS classes. Remake clean components.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Design System Token Mapping</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Extracts clean computed color tokens, typography scales, border radii, and WCAG AA/AAA contrast ratios directly into structured `tokens.json`.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FileCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Interactive Remake Studio</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Preview your extracted design system with live Dark, Light, Cyberpunk, and Emerald theme modes and viewport switching before exporting.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">One-Click Next.js .Zip Exporter</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Export complete, ready-to-run Next.js 15 starter projects complete with `tailwind.config.js`, modular React components, and AI prompts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-xs text-zinc-500 mt-auto">
        © 2025 WebPicks Inc. All rights reserved. Ethical Design Extraction Platform.
      </footer>
    </div>
  );
}
