"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockDb } from "@/lib/mockDb";
import { useUserStore } from "@/lib/store";
import { Layers, Plus, ExternalLink, Calendar, Zap, ArrowRight, Sparkles, FolderKanban } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, importsRemaining } = useUserStore();
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);

  const projects = mockDb.listProjects();

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
        alert("Extraction failed: " + (data.error || "Unknown error"));
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Extraction request error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Layers className="w-5 h-5" />
            </div>
            <span>WebPicks</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{importsRemaining} Free Imports Left</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-900/60 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
              {user?.name?.[0] || "D"}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full">
        {/* Welcome Banner */}
        <div className="mb-10 p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name || "Creator"}
            </h1>
            <p className="text-slate-400 text-sm mb-6">
              Import a new website reference to extract design tokens or continue working on your saved Remake Studio projects.
            </p>

            {/* Quick URL Import Box */}
            <form onSubmit={handleExtract} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Enter URL (e.g. stripe.com)..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                required
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-indigo-600/20"
              >
                {loading ? <Zap className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Import Design</span>
              </button>
            </form>
          </div>
        </div>

        {/* Project Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <FolderKanban className="w-5 h-5 text-indigo-400" />
            <h2>Your Remake Projects</h2>
          </div>
          <span className="text-xs text-slate-500">{projects.length} Saved Projects</span>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
            <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300 mb-1">No Projects Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Paste a website URL above to extract your first Design DNA project.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col overflow-hidden shadow-lg hover:shadow-indigo-500/5"
              >
                {/* Mock Thumbnail Banner */}
                <div className="h-36 bg-gradient-to-br from-slate-950 to-indigo-950/30 border-b border-slate-800/80 p-4 flex flex-col justify-between relative">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-indigo-300">
                      {project.url.replace("https://", "").replace("http://", "")}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                  </div>

                  {/* Palette Swatches */}
                  <div className="flex items-center gap-1.5">
                    {project.tokens_json.colors.slice(0, 5).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-5 h-5 rounded-full border border-slate-700 shadow-sm"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors text-base mb-1">
                      {project.name}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-4">
                      {project.tokens_json.meta?.title || project.url}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(project.created_at).toLocaleDateString()}</span>
                    </div>

                    <Link
                      href={`/project/${project.id}`}
                      className="flex items-center gap-1 font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <span>Open Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
