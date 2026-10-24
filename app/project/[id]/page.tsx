"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockDb } from "@/lib/mockDb";
import { ProjectRecord } from "@/lib/supabase";
import { getContrastRatio } from "@/lib/utils";
import JSZip from "jszip";
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
  Sun,
  Moon,
  Sliders,
  AlertCircle,
  Image as ImageIcon,
  Bot,
} from "lucide-react";

function StudioContent() {
  const params = useParams();
  const id = (params?.id as string) || "demo-linear";

  const [project, setProject] = useState<ProjectRecord | null>(() => {
    return mockDb.getProject(id) || mockDb.getProject("demo-linear") || null;
  });

  const [activeTab, setActiveTab] = useState<"tokens" | "tailwind" | "designmd" | "prompt">("tokens");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Remake Studio Theme Switcher State
  const [activeTheme, setActiveTheme] = useState<"dark" | "light" | "cyberpunk" | "emerald">("dark");

  // Remake Studio Editable Text State
  const [heroHeading, setHeroHeading] = useState("Re-Architect Web Apps Faster");
  const [heroSubtext, setHeroSubtext] = useState(
    "Build clean Next.js & Tailwind CSS interfaces directly from extracted design systems."
  );

  useEffect(() => {
    const loaded = mockDb.getProject(id) || mockDb.getProject("demo-linear");
    if (loaded) {
      setProject(loaded);
    }
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-10 h-10 text-amber-500" />
        <h2 className="text-xl font-bold">Project Not Found</h2>
        <p className="text-sm text-slate-400">Unable to load the requested design system reference.</p>
        <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { tokens_json } = project;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const copyToClipboard = (text: string, key: string, label: string = "Copied!") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Theme Preset Overrides
  const getThemeBg = () => {
    if (activeTheme === "light") return "#F8FAFC";
    if (activeTheme === "cyberpunk") return "#09090B";
    if (activeTheme === "emerald") return "#022C22";
    return tokens_json.colors[0]?.hex || "#0F172A";
  };

  const getThemeText = () => {
    if (activeTheme === "light") return "#0F172A";
    return "#F8FAFC";
  };

  const getThemeAccent = () => {
    if (activeTheme === "cyberpunk") return "#F43F5E";
    if (activeTheme === "emerald") return "#10B981";
    return tokens_json.colors[1]?.hex || "#6366F1";
  };

  // Export to Zip Helper
  const exportToNextJsZip = async () => {
    const zip = new JSZip();

    // 1. tailwind.config.js
    zip.file("tailwind.config.js", tailwindConfigCode);

    // 2. DESIGN.md
    zip.file("DESIGN.md", designMdCode);

    // 3. tokens.json
    zip.file("tokens.json", JSON.stringify(tokens_json, null, 2));

    // 4. Clean Next.js Hero Component
    const heroComponentCode = `import React from 'react';

export default function HeroComponent() {
  return (
    <section className="py-20 px-6 text-center max-w-4xl mx-auto space-y-6">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold">
        Design DNA Reference: ${project.name}
      </div>
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
        ${heroHeading}
      </h1>
      <p className="text-slate-400 text-lg max-w-2xl mx-auto">
        ${heroSubtext}
      </p>
      <div className="flex items-center justify-center gap-4 pt-4">
        <button className="px-6 py-3 rounded-xl bg-[${getThemeAccent()}] text-white font-medium shadow-lg hover:opacity-90">
          Get Started Free
        </button>
        <button className="px-6 py-3 rounded-xl bg-slate-800 text-slate-200 font-medium hover:bg-slate-700">
          Documentation
        </button>
      </div>
    </section>
  );
}`;

    zip.file("components/Hero.tsx", heroComponentCode);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webpicks-${project.name.toLowerCase().replace(/\s+/g, "-")}-nextjs.zip`;
    a.click();
    URL.revokeObjectURL(url);

    showToast("Downloaded Next.js Component Zip!");
  };

  // Ready-to-paste tailwind.config.js
  const tailwindConfigCode = `// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          surface: '${tokens_json.colors[0]?.hex || "#0F172A"}',
          accent: '${tokens_json.colors[1]?.hex || "#6366F1"}',
          text: '${tokens_json.colors[2]?.hex || "#F8FAFC"}',
          muted: '${tokens_json.colors[3]?.hex || "#94A3B8"}',
        }
      },
      fontFamily: {
        sans: ['${tokens_json.typography.fontFamilies[0] || "Inter"}', 'sans-serif'],
      },
      borderRadius: {
        brand: '${tokens_json.spacing.radii[0] || "8px"}',
      }
    },
  },
  plugins: [],
};`;

  // Ready-to-paste DESIGN.md
  const designMdCode = `# DESIGN.md · ${project.name}
# Clean Design System Specification for AI Agents (Cursor / Claude Code / ChatGPT)

colors:
  primary_surface: "${tokens_json.colors[0]?.hex || "#0F172A"}"
  brand_accent: "${tokens_json.colors[1]?.hex || "#6366F1"}"
  text_primary: "${tokens_json.colors[2]?.hex || "#F8FAFC"}"
  text_muted: "${tokens_json.colors[3]?.hex || "#94A3B8"}"

typography:
  font_family: "${tokens_json.typography.fontFamilies[0] || "Inter"}"
  h1: { size: "${tokens_json.typography.headings[0]?.fontSize || "48px"}", weight: "${tokens_json.typography.headings[0]?.fontWeight || "700"}" }
  body: { size: "${tokens_json.typography.body.fontSize}", weight: "${tokens_json.typography.body.fontWeight}" }

spacing_and_radii:
  padding_scale: [${tokens_json.spacing.paddings.map((p) => `"${p}"`).join(", ")}]
  border_radius: "${tokens_json.spacing.radii[0] || "8px"}"

rules:
  - Apply standard Tailwind CSS utilities matching these exact color and typography scale tokens.
  - Do NOT write raw CSS files or inline style tags.
  - Construct clean, modular React TSX components.`;

  // AI Prompt
  const aiPromptCode = `Act as a senior Next.js 15 & Tailwind CSS engineer.
Rebuild a web app landing page in the style of ${project.name} (${project.url}) using these exact design tokens:

- Primary Surface: ${tokens_json.colors[0]?.hex || "#0F172A"}
- Accent Color: ${tokens_json.colors[1]?.hex || "#6366F1"}
- Primary Font: ${tokens_json.typography.fontFamilies[0] || "Inter"}
- Border Radius: ${tokens_json.spacing.radii[0] || "8px"}

Requirements:
1. Write clean, modular Next.js functional TSX components.
2. Use standard Tailwind CSS utility classes exclusively (no raw CSS).
3. Build an original, clean layout using these tokens.`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans h-screen overflow-hidden relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="absolute top-16 right-6 z-50 bg-indigo-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

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
            {project.is_image_import ? (
              <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-mono flex items-center gap-1">
                <Bot className="w-3 h-3" /> AI Reconstructed from Image
              </span>
            ) : (
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <span>{project.url.replace("https://", "")}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
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

        {/* Top Bar Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={exportToNextJsZip}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all shadow-md shadow-indigo-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to Next.js (.zip)</span>
          </button>
        </div>
      </header>

      {/* 3-Panel Studio Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: VISUAL STYLE GUIDE WITH CONTRAST RATIOS */}
        <aside className="w-80 border-r border-slate-800 bg-slate-950 p-5 overflow-y-auto shrink-0 flex flex-col gap-6">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-400" />
                <span>Extracted Palette</span>
              </div>
              <span className="text-[10px] text-slate-500 font-normal">WCAG Contrast</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {tokens_json.colors.map((color, i) => {
                const contrast = getContrastRatio(color.hex, "#0F172A");
                return (
                  <div
                    key={i}
                    onClick={() => copyToClipboard(color.hex, `color-${i}`, `Copied ${color.hex}`)}
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

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                          contrast.rating === "AAA"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : contrast.rating === "AA"
                            ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                        title={`Contrast ratio against background: ${contrast.ratio}:1`}
                      >
                        {contrast.rating} ({contrast.ratio}:1)
                      </span>

                      <div className="text-slate-500 group-hover:text-indigo-400 text-xs">
                        {copiedKey === `color-${i}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
                  <span className="text-slate-300 font-mono">
                    {h.fontSize} / {h.fontWeight}
                  </span>
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
                    <span
                      key={i}
                      className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MIDDLE PANEL: LIVE PREVIEW CANVAS WITH THEME SWITCHER & INLINE EDITING */}
        <main className="flex-1 bg-slate-900/50 p-6 overflow-y-auto flex flex-col items-center justify-start relative">
          {/* Theme Switcher Bar */}
          <div className="mb-4 bg-slate-950 border border-slate-800 p-1.5 rounded-xl flex items-center gap-2 text-xs shadow-lg">
            <span className="text-slate-500 font-medium px-2 text-[11px] uppercase tracking-wider flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Theme:
            </span>
            <button
              onClick={() => setActiveTheme("dark")}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTheme === "dark" ? "bg-indigo-600 text-white font-medium" : "text-slate-400 hover:text-white"
              }`}
            >
              <Moon className="w-3 h-3" /> Dark
            </button>
            <button
              onClick={() => setActiveTheme("light")}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTheme === "light" ? "bg-slate-200 text-slate-900 font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Sun className="w-3 h-3" /> Light
            </button>
            <button
              onClick={() => setActiveTheme("cyberpunk")}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTheme === "cyberpunk"
                  ? "bg-rose-600 text-white font-medium"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Cyberpunk
            </button>
            <button
              onClick={() => setActiveTheme("emerald")}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTheme === "emerald"
                  ? "bg-emerald-600 text-white font-medium"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Emerald
            </button>
          </div>

          {/* Canvas Viewport Frame */}
          <div
            className={`transition-all duration-300 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto ${
              viewport === "desktop" ? "w-full max-w-4xl" : viewport === "tablet" ? "w-[640px]" : "w-[375px]"
            }`}
            style={{ backgroundColor: getThemeBg() }}
          >
            {/* Frame Top Header */}
            <div className="h-9 bg-slate-950/80 border-b border-slate-800/80 px-4 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="font-mono text-[11px] text-slate-400">Remake Studio Interactive Canvas</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>

            {/* Editable Web Page Component Sandbox */}
            <div className="p-8 sm:p-12 space-y-12">
              {/* Hero Component */}
              <div className="space-y-6 text-center max-w-xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
                  {project.is_image_import ? (
                    <span className="flex items-center gap-1 text-purple-300">
                      <Bot className="w-3.5 h-3.5" /> AI Reconstructed from Screenshot
                    </span>
                  ) : (
                    <span>Reference: {project.name}</span>
                  )}
                </div>

                {/* Inline Editable Heading */}
                <div className="group relative">
                  <h1
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setHeroHeading(e.currentTarget.textContent || heroHeading)}
                    className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-1 transition-all"
                    style={{
                      fontFamily: tokens_json.typography.fontFamilies[0] || "Inter",
                      color: getThemeText(),
                    }}
                  >
                    {heroHeading}
                  </h1>
                  <Edit3 className="w-4 h-4 text-slate-500 absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>

                {/* Inline Editable Subtext */}
                <div className="group relative">
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setHeroSubtext(e.currentTarget.textContent || heroSubtext)}
                    className="text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-1 opacity-80"
                    style={{ color: getThemeText() }}
                  >
                    {heroSubtext}
                  </p>
                </div>

                {/* Extracted Styled Buttons */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    className="text-sm font-medium transition-transform hover:scale-105 shadow-lg"
                    style={{
                      backgroundColor: getThemeAccent(),
                      color: "#FFFFFF",
                      borderRadius: tokens_json.components.primaryButton.borderRadius || "8px",
                      padding: tokens_json.components.primaryButton.padding || "10px 20px",
                    }}
                  >
                    Get Started Free
                  </button>
                  <button
                    className="text-sm font-medium transition-transform hover:scale-105 border border-slate-700"
                    style={{
                      backgroundColor: activeTheme === "light" ? "#E2E8F0" : "#1E293B",
                      color: getThemeText(),
                      borderRadius: tokens_json.components.secondaryButton.borderRadius || "8px",
                      padding: tokens_json.components.secondaryButton.padding || "10px 20px",
                    }}
                  >
                    Documentation
                  </button>
                </div>
              </div>

              {/* Component Cards Grid */}
              <div className="grid sm:grid-cols-2 gap-4 pt-6">
                <div
                  className="p-5 space-y-2 transition-all hover:border-slate-600"
                  style={{
                    backgroundColor: activeTheme === "light" ? "#FFFFFF" : "#1E293B",
                    borderRadius: tokens_json.components.card.borderRadius || "12px",
                    border: tokens_json.components.card.border || "1px solid #334155",
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <h4 className="font-semibold text-sm" style={{ color: getThemeText() }}>
                    Clean React Components
                  </h4>
                  <p className="text-xs opacity-70" style={{ color: getThemeText() }}>
                    Generated without raw HTML junk CSS. Styled purely with standard Tailwind utility classes.
                  </p>
                </div>

                <div
                  className="p-5 space-y-2 transition-all hover:border-slate-600"
                  style={{
                    backgroundColor: activeTheme === "light" ? "#FFFFFF" : "#1E293B",
                    borderRadius: tokens_json.components.card.borderRadius || "12px",
                    border: tokens_json.components.card.border || "1px solid #334155",
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <h4 className="font-semibold text-sm" style={{ color: getThemeText() }}>
                    AI Agent Ready
                  </h4>
                  <p className="text-xs opacity-70" style={{ color: getThemeText() }}>
                    Copy pre-formatted DESIGN.md briefs for Cursor, Claude Code, or ChatGPT to build from scratch.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL: EXPORT PANEL WITH FULL SYNTAX CODE */}
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
                copyToClipboard(content, `tab-${activeTab}`, `Copied ${activeTab.toUpperCase()}!`);
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
