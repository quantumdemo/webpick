'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Globe,
  UploadCloud,
  Sparkles,
  ArrowRight,
  Trash2,
  Search,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { HeaderNav } from '@/components/HeaderNav';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'url' | 'image'>('url');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (e) {
      console.warn('Failed to fetch projects', e);
    }
  };

  const handleUrlExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    if (projects.length >= 3) {
      toast.error('Free tier quota reached (3/3 projects). Upgrade to Pro for unlimited extractions!');
      return;
    }

    setLoading(true);
    toast.info('Extracting design system with Playwright...');

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Extraction failed');
        return;
      }

      toast.success('Design system extracted successfully!');
      setUrl('');
      if (data.project?.id) {
        router.push(`/project/${data.project.id}`);
      } else {
        fetchProjects();
      }
    } catch (err: any) {
      toast.error(err.message || 'Error running extraction');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (projects.length >= 3) {
      toast.error('Free tier quota reached (3/3 projects). Upgrade to Pro for unlimited extractions!');
      return;
    }

    setLoading(true);
    toast.info('Processing screenshot with Vision AI...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/extract-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to analyze screenshot');
        return;
      }

      toast.success('Design tokens reconstructed from image!');
      if (data.project?.id) {
        router.push(`/project/${data.project.id}`);
      } else {
        fetchProjects();
      }
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Project deleted');
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      toast.error('Failed to delete project');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col font-sans selection:bg-indigo-500/30">
      <Toaster position="bottom-right" theme="dark" />
      <HeaderNav activePage="dashboard" />

      {/* Hero Header & Import Studio Bar */}
      <section className="border-b border-white/10 bg-gradient-to-b from-indigo-950/20 to-transparent py-10 px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Design Remake Dashboard</h1>
              <p className="text-xs text-zinc-400 mt-1">
                Extract design tokens from any URL or screenshot. Rebuild with Next.js 15 & Tailwind.
              </p>
            </div>

            {/* Quota Indicator */}
            <div className="flex items-center gap-3 bg-zinc-900 border border-white/10 px-4 py-2 rounded-xl text-xs">
              <div>
                <div className="text-zinc-400 text-[10px] uppercase font-bold">Free Plan Quota</div>
                <div className="font-bold text-white">{projects.length} / 3 Projects Used</div>
              </div>
              <Link
                href="/pricing"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg transition"
              >
                Upgrade
              </Link>
            </div>
          </div>

          {/* Import Modes Switcher & Action Area */}
          <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4 text-xs">
              <button
                onClick={() => setActiveTab('url')}
                className={`flex items-center gap-2 font-semibold px-4 py-2 rounded-lg transition ${
                  activeTab === 'url' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Globe className="w-4 h-4" /> Extract from Website URL
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`flex items-center gap-2 font-semibold px-4 py-2 rounded-lg transition ${
                  activeTab === 'image' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <UploadCloud className="w-4 h-4" /> Reconstruct from Screenshot
              </button>
            </div>

            {/* URL Input Form */}
            {activeTab === 'url' && (
              <form onSubmit={handleUrlExtract} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Globe className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://linear.app or https://vercel.com"
                    className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Extract Design DNA
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Image Upload Dropzone */}
            {activeTab === 'image' && (
              <label className="border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-zinc-950/40 hover:bg-zinc-950/80 text-center space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
                <UploadCloud className="w-8 h-8 text-indigo-400" />
                <div className="text-sm font-semibold text-zinc-200">
                  Drop website screenshot or Figma/Dribbble shot here
                </div>
                <p className="text-xs text-zinc-500">Supports PNG, JPG, WebP up to 10MB</p>
              </label>
            )}
          </div>
        </div>
      </section>

      {/* Projects Grid Section */}
      <main className="max-w-5xl mx-auto px-6 py-10 flex-1 w-full space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" /> Extracted Projects ({projects.length})
          </h2>
        </div>

        {projects.length === 0 ? (
          <div className="border border-white/10 rounded-2xl p-12 text-center bg-zinc-900/30 space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-200">No projects extracted yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Paste a URL above or upload a UI screenshot to extract design tokens and build clean code.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-zinc-900/60 border border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-xl transition group relative"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {proj.type === 'url' ? 'URL Extraction' : 'Vision AI Image'}
                    </span>
                    <button
                      onClick={() => setDeleteId(proj.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-base text-zinc-100 group-hover:text-indigo-400 transition">
                    {proj.title}
                  </h3>

                  {/* Color Swatches */}
                  <div className="flex gap-1.5 pt-1">
                    {proj.tokens_json?.colors?.slice(0, 5).map((c: any, idx: number) => (
                      <div
                        key={idx}
                        className="w-5 h-5 rounded-full border border-white/10"
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 text-[11px]">
                    {new Date(proj.created_at).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/project/${proj.id}`}
                    className="bg-zinc-800 hover:bg-indigo-600 text-white font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1 text-xs"
                  >
                    Open Studio <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl max-w-sm w-full space-y-4 text-center">
            <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Delete Project?</h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-2 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(deleteId)}
                className="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded-xl text-xs font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
