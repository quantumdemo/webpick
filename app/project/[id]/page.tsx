"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { mockDb } from "@/lib/mockDb";
import { ProjectRecord } from "@/lib/supabase";
import {
  Layers,
  Palette,
  Type,
  Maximize2,
  Copy,
  Check,
  Download,
  Code,
  FileText,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Edit3,
  RefreshCw,
} from "lucide-react";

function StudioContent() {
  const params = useParams();
  const id = params?.id as string;

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"tokens" | "tailwind" | "designmd" | "prompt">("tokens");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Remake Studio Editable Text State
  const [heroHeading, setHeroHeading] = useState("Re-Architect Web Apps Faster");
  const [heroSubtext, setHeroSubtext] = useState(
    "Build clean Next.js & Tailwind CSS interfaces directly from extracted design systems."
  );

  useEffect(() => {
    if (id) {
      const p = mockDb.getProject(id);
      if (p) {
        setProject(p);
      } else {
        const defaultProj = mockDb.getProject("demo-linear");
        if (defaultProj) setProject(defaultProj);
      }
    }
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  const { tokens_json } = project;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const tailwindConfigCode = `// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '${tokens_json.colors[0]?.hex || "#0F172A"}',
          accent: '${tokens_json.colors[1]?.hex || "#6366F1"}',
          text: '${tokens_json.colors[2]?.hex || "#F8FAFC"}',
        }
      },
      fontFamily: {
        sans: ['${tokens_json.typography.fontFamilies[0] || "Inter"}', 'sans-serif'],
      },
      borderRadius: {
        custom: '${tokens_json.spacing.radii[0] || "8px"}',
      }
    },
  },
  plugins: [],
};`;

  const designMdCode = `# DESIGN.md · ${project.name}
# Design System Spec for AI Agents (Cursor / Claude Code / ChatGPT)

colors:
  primary_surface: "${tokens_json.colors[0]?.hex || "#0F172A"}"
  brand_accent: "${tokens_json.colors[1]?.hex || "#6366F1"}"
  text_primary: "${tokens_json.colors[2]?.hex || "#F8FAFC"}"

typography:
  font_family: "${tokens_json.typography.fontFamilies[0] || "Inter"}"
  h1: { size: "${tokens_json.typography.headings[0]?.fontSize || "48px"}", weight: "${tokens_json.typography.headings[0]?.fontWeight || "700"}" }
  body: { size: "${tokens_json.typography.body.fontSize}", weight: "${tokens_json.typography.body.fontWeight}" }

spacing & radii:
  padding_scale: [${tokens_json.spacing.paddings.join(", ")}]
  border_radius: "${tokens_json.spacing.radii[0] || "8px"}"

rules:
  - Use Tailwind CSS utilities matching these tokens.
  - Do NOT write inline styles or raw CSS files.
  - Keep components modular and accessible.`;

  const aiPromptCode = `Act as an expert Next.js 15 & Tailwind CSS developer.
Rebuild a landing page in the style of ${project.name} (${project.url}) using these exact design system tokens:

- Primary Background: ${tokens_json.colors[0]?.hex || "#0F172A"}
- Accent Color: ${tokens_json.colors[1]?.hex || "#6366F1"}
- Primary Font: ${tokens_json.typography.fontFamilies[0] || "Inter"}
- Border Radius: ${tokens_json.spacing.radii[0] || "8px"}

Requirements:
1. Write clean, modular React TSX components.
2. Use standard Tailwind CSS utility classes exclusively (no raw CSS).
3. Do NOT copy raw HTML/CSS. Build an original clean layout using these tokens.`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans h-screen overflow-hidden">
      {/* Studio Header Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-950 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-white">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <span>WebPicks</span>
          </Link>

          <div className="h-4 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-200">{project.name}</span>
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 hover:text-slate-300 flex items-center gap-1"
            >
              <span>{project.url.replace("https://", "")}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Viewport Controls */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setViewport("desktop")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              viewport === "desktop" ? "bg-indigo-600 text-white font-medium" : "text-slate-400 hover:text-white"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setViewport("tablet")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              viewport === "tablet" ? "bg-indigo-600 text-white font-medium" : "text-slate-400 hover:text-white"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              viewport === "mobile" ? "bg-indigo-600 text-white font-medium" : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => copyToClipboard(JSON.stringify(tokens_json, null, 2), "all-tokens")}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            {copiedKey === "all-tokens" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy All Tokens</span>
          </button>
        </div>
      </header>

      {/* 3-Panel Studio Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: VISUAL STYLE GUIDE */}
        <aside className="w-80 border-r border-slate-800 bg-slate-950 p-5 overflow-y-auto shrink-0 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              <Palette className="w-4 h-4 text-indigo-400" />
              <span>Extracted Palette</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {tokens_json.colors.map((color, i) => (
                <div
                  key={i}
                  onClick={() => copyToClipboard(color.hex, `color-${i}`)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 rounded-md border border-slate-700 shadow-sm shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{color.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{color.hex}</div>
                    </div>
                  </div>
                  <div className="text-slate-500 group-hover:text-indigo-400 text-xs">
                    {copiedKey === `color-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              <Type className="w-4 h-4 text-purple-400" />
              <span>Typography Scale</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-3">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-mono block">Font Family</span>
                <span className="font-semibold text-slate-200 text-sm">
                  {tokens_json.typography.fontFamilies[0] || "Inter"}
                </span>
              </div>

              {tokens_json.typography.headings.map((h, i) => (
                <div key={i} className="flex items-center justify-between border-t border-slate-800 pt-2">
                  <span className="font-mono text-indigo-400 font-bold">{h.tag}</span>
                  <span className="text-slate-300 font-mono">{h.fontSize} / {h.fontWeight}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              <Maximize2 className="w-4 h-4 text-pink-400" />
              <span>Radii & Spacing Scale</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-3">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-mono block mb-1">Border Radii</span>
                <div className="flex flex-wrap gap-1.5">
                  {tokens_json.spacing.radii.map((r, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MIDDLE PANEL: LIVE PREVIEW CANVAS */}
        <main className="flex-1 bg-slate-900/50 p-6 overflow-y-auto flex flex-col items-center justify-start">
          <div
            className={`transition-all duration-300 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto ${
              viewport === "desktop" ? "w-full max-w-4xl" : viewport === "tablet" ? "w-[640px]" : "w-[375px]"
            }`}
          >
            <div className="h-9 bg-slate-900 border-b border-slate-800/80 px-4 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="font-mono text-[11px] text-slate-400">Remake Studio Live Preview Sandbox</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>

            <div className="p-8 sm:p-12 space-y-12" style={{ backgroundColor: tokens_json.colors[0]?.hex || "#0F172A" }}>
              <div className="space-y-6 text-center max-w-xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
                  <span>Design DNA Extracted from {project.name}</span>
                </div>

                <div className="group relative">
                  <h1
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setHeroHeading(e.currentTarget.textContent || heroHeading)}
                    className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-1"
                    style={{ fontFamily: tokens_json.typography.fontFamilies[0] || "Inter" }}
                  >
                    {heroHeading}
                  </h1>
                  <Edit3 className="w-3.5 h-3.5 text-slate-500 absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="group relative">
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setHeroSubtext(e.currentTarget.textContent || heroSubtext)}
                    className="text-slate-400 text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-1"
                  >
                    {heroSubtext}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    className="text-sm font-medium transition-transform hover:scale-105 shadow-lg"
                    style={{
                      backgroundColor: tokens_json.components.primaryButton.bg || tokens_json.colors[1]?.hex || "#6366F1",
                      color: tokens_json.components.primaryButton.color || "#FFFFFF",
                      borderRadius: tokens_json.components.primaryButton.borderRadius || "8px",
                      padding: tokens_json.components.primaryButton.padding || "10px 20px",
                    }}
                  >
                    Get Started Free
                  </button>
                  <button
                    className="text-sm font-medium transition-transform hover:scale-105"
                    style={{
                      backgroundColor: tokens_json.components.secondaryButton.bg || "#1E293B",
                      color: tokens_json.components.secondaryButton.color || "#F8FAFC",
                      borderRadius: tokens_json.components.secondaryButton.borderRadius || "8px",
                      padding: tokens_json.components.secondaryButton.padding || "10px 20px",
                    }}
                  >
                    Documentation
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-6">
                <div
                  className="p-5 space-y-2 transition-all hover:border-slate-600"
                  style={{
                    backgroundColor: tokens_json.components.card.bg || "#1E293B",
                    borderRadius: tokens_json.components.card.borderRadius || "12px",
                    border: tokens_json.components.card.border || "1px solid #334155",
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <h4 className="font-semibold text-white text-sm">Clean React Components</h4>
                  <p className="text-slate-400 text-xs">
                    Generated without raw HTML junk CSS. Styled purely with standard Tailwind utility classes.
                  </p>
                </div>

                <div
                  className="p-5 space-y-2 transition-all hover:border-slate-600"
                  style={{
                    backgroundColor: tokens_json.components.card.bg || "#1E293B",
                    borderRadius: tokens_json.components.card.borderRadius || "12px",
                    border: tokens_json.components.card.border || "1px solid #334155",
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <h4 className="font-semibold text-white text-sm">AI Agent Ready</h4>
                  <p className="text-slate-400 text-xs">
                    Copy pre-formatted DESIGN.md briefs for Cursor, Claude Code, or ChatGPT to build from scratch.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL: EXPORT PANEL */}
        <aside className="w-96 border-l border-slate-800 bg-slate-950 flex flex-col shrink-0">
          <div className="flex border-b border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab("tokens")}
              className={`flex-1 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === "tokens"
                  ? "border-indigo-500 text-indigo-400 bg-slate-900/50"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              tokens.json
            </button>
            <button
              onClick={() => setActiveTab("tailwind")}
              className={`flex-1 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === "tailwind"
                  ? "border-indigo-500 text-indigo-400 bg-slate-900/50"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              tailwind.config
            </button>
            <button
              onClick={() => setActiveTab("designmd")}
              className={`flex-1 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === "designmd"
                  ? "border-indigo-500 text-indigo-400 bg-slate-900/50"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              DESIGN.md
            </button>
            <button
              onClick={() => setActiveTab("prompt")}
              className={`flex-1 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === "prompt"
                  ? "border-indigo-500 text-indigo-400 bg-slate-900/50"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              AI Prompt
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-300 bg-slate-950">
            {activeTab === "tokens" && (
              <pre className="whitespace-pre-wrap break-all text-[11px] text-slate-300">
                {JSON.stringify(tokens_json, null, 2)}
              </pre>
            )}
            {activeTab === "tailwind" && (
              <pre className="whitespace-pre-wrap break-all text-[11px] text-indigo-300">
                {tailwindConfigCode}
              </pre>
            )}
            {activeTab === "designmd" && (
              <pre className="whitespace-pre-wrap break-all text-[11px] text-emerald-300">
                {designMdCode}
              </pre>
            )}
            {activeTab === "prompt" && (
              <pre className="whitespace-pre-wrap break-all text-[11px] text-pink-300 leading-relaxed">
                {aiPromptCode}
              </pre>
            )}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                const content =
                  activeTab === "tokens"
                    ? JSON.stringify(tokens_json, null, 2)
                    : activeTab === "tailwind"
                    ? tailwindConfigCode
                    : activeTab === "designmd"
                    ? designMdCode
                    : aiPromptCode;
                copyToClipboard(content, `tab-${activeTab}`);
              }}
              className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
            >
              {copiedKey === `tab-${activeTab}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy {activeTab.toUpperCase()}</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function ProjectStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      }
    >
      <StudioContent />
    </Suspense>
  );
}
