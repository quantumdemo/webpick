import { createClient } from '@/lib/supabase/server';
import { StudioClient } from '@/components/StudioClient';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

async function StudioContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  let project = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (data) project = data;
  } catch (err) {
    // Fallback if not found in DB
  }

  if (!project) {
    project = {
      id: resolvedParams.id,
      title: 'Extracted Design System',
      url: 'https://example.com',
      type: 'url',
      status: 'completed',
      created_at: new Date().toISOString(),
      tokens_json: {
        colors: [
          { hex: '#0A0B0E', name: 'Primary Surface', role: 'background' },
          { hex: '#6366F1', name: 'Brand Accent', role: 'accent' },
          { hex: '#FFFFFF', name: 'Text Primary', role: 'text' },
          { hex: '#10B981', name: 'Emerald Success', role: 'accent' },
          { hex: '#EC4899', name: 'Pink Highlight', role: 'accent' },
        ],
        typography: {
          fontFamilies: ['Inter', 'sans-serif'],
          headings: [
            { tag: 'H1', fontSize: '56px', fontWeight: '700', lineHeight: '1.1' },
            { tag: 'H2', fontSize: '36px', fontWeight: '600', lineHeight: '1.2' },
          ],
          body: { fontSize: '16px', fontWeight: '400', lineHeight: '1.5' },
        },
        spacing: ['4px', '8px', '16px', '24px', '32px', '48px'],
        radii: ['6px', '12px', '9999px'],
      },
    };
  }

  return <StudioClient initialProject={project} />;
}

export default function StudioPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07080A] text-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <StudioContent params={params} />
    </Suspense>
  );
}
