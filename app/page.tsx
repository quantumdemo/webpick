"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Layers, Code2, Palette, ShieldCheck, CheckCircle2, Zap } from "lucide-react";

export default function LandingPage() {
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/project/${data.id}`);
      } else {
        alert("Extraction error: " + (data.error || "Failed to process URL"));
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Network or extraction error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <span>WebPicks</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5"
            >
              Dashboard
            </Link>
            <a
              href="#import-section"
              className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-all shadow-md shadow-indigo-600/20"
            >
              Start Free
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="import-section" className="pt-24 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ethical Design System Engine • Zero Scraper Junk Code</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
            Import Any Website. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Pick Its Best Design.
            </span>{" "}
            Remake It Clean.
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Extract clean design tokens, color palettes, and typography scales from reference websites. Remake them into production-ready Next.js & Tailwind CSS components.
          </p>

          {/* Import Box */}
          <form onSubmit={handleExtract} className="max-w-2xl mx-auto mb-12">
            <div className="p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Paste website URL (e.g., linear.app, stripe.com)..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                required
                className="flex-1 bg-transparent px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none text-base border-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-base shadow-lg shadow-indigo-600/30"
              >
                {loading ? (
                  <>
                    <Zap className="w-5 h-5 animate-spin" />
                    <span>Extracting DNA...</span>
                  </>
                ) : (
                  <>
                    <span>Import URL</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Preset Samples */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <span>Try quick sample:</span>
            <button
              onClick={() => {
                setUrlInput("https://linear.app");
              }}
              className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
            >
              linear.app
            </button>
            <button
              onClick={() => {
                setUrlInput("https://vercel.com");
              }}
              className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
            >
              vercel.com
            </button>
            <button
              onClick={() => {
                setUrlInput("https://stripe.com");
              }}
              className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
            >
              stripe.com
            </button>
          </div>
        </div>
      </section>

      {/* 3 Step Guide */}
      <section id="how-it-works" className="py-20 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How WebPicks Works</h2>
            <p className="text-slate-400">
              Transform target website design references into structured tokens and modular Next.js components in 3 simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-lg flex items-center justify-center mb-6">
                01
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Import URL</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Paste any public web link. Our headless crawler executes computed styles and maps exact hex palettes, typography scales, and spacing scales.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 relative">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-lg flex items-center justify-center mb-6">
                02
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Remake Studio</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Inspect extracted Design DNA on an interactive canvas sandbox. Edit copy inline, customize themes, and preview responsive viewports.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 relative">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 font-bold text-lg flex items-center justify-center mb-6">
                03
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Export Clean Code</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Export pure <code className="text-indigo-300">tokens.json</code>, <code className="text-indigo-300">tailwind.config.js</code>, and Next.js React components. Zero raw HTML/CSS scrapings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Differentiator Features */}
      <section id="features" className="py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
              <ShieldCheck className="w-8 h-8 text-indigo-400 mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">100% Ethical & Legal</h4>
              <p className="text-slate-400 text-sm">
                We extract non-copyrightable design tokens and structure clean component architectures. We never copy raw HTML/CSS.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
              <Code2 className="w-8 h-8 text-purple-400 mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Pure Tailwind & Next.js</h4>
              <p className="text-slate-400 text-sm">
                Clean, production-ready TSX components styled exclusively with standard Tailwind CSS utility classes.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
              <Palette className="w-8 h-8 text-pink-400 mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Design System Engine</h4>
              <p className="text-slate-400 text-sm">
                Generates <code className="text-slate-300">DESIGN.md</code> briefs formatted for AI agents like Cursor, Claude Code, and ChatGPT.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-400">Choose the plan that fits your creation workflow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-2">Free Starter</h3>
              <p className="text-slate-400 text-xs mb-6">Perfect for trying out WebPicks.</p>
              <div className="text-3xl font-bold text-white mb-6">$0 <span className="text-slate-500 text-sm font-normal">/ month</span></div>
              <ul className="space-y-3 text-sm text-slate-300 mb-8 flex-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>3 Design System Imports / mo</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>tokens.json & tailwind.config.js</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Remake Studio Live Preview</span>
                </li>
              </ul>
              <a href="#import-section" className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-center text-sm font-medium transition-colors">
                Get Started
              </a>
            </div>

            {/* Pro */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-indigo-900/40 to-slate-900 border border-indigo-500/50 flex flex-col relative shadow-2xl">
              <div className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Popular
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Pro Builder</h3>
              <p className="text-slate-400 text-xs mb-6">For developers and active creators.</p>
              <div className="text-3xl font-bold text-white mb-6">$12 <span className="text-slate-500 text-sm font-normal">/ month</span></div>
              <ul className="space-y-3 text-sm text-slate-300 mb-8 flex-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>Unlimited URL Imports</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>Clean Next.js Component Export</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>DESIGN.md AI Agent Briefs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>Cloud Saved Workspaces</span>
                </li>
              </ul>
              <a href="#import-section" className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-center text-sm font-medium transition-colors text-white shadow-lg shadow-indigo-600/30">
                Start 7-Day Trial
              </a>
            </div>

            {/* Team */}
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-2">Team Agency</h3>
              <p className="text-slate-400 text-xs mb-6">For design agencies and dev teams.</p>
              <div className="text-3xl font-bold text-white mb-6">$29 <span className="text-slate-500 text-sm font-normal">/ month</span></div>
              <ul className="space-y-3 text-sm text-slate-300 mb-8 flex-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Everything in Pro Builder</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>5 Team Member Seats</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Shared Design System Library</span>
                </li>
              </ul>
              <a href="#import-section" className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-center text-sm font-medium transition-colors">
                Contact Team Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-10 text-center text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>WebPicks</span>
          </div>
          <p>© 2025 WebPicks. Pick the System. Remake the Web.</p>
        </div>
      </footer>
    </div>
  );
}
