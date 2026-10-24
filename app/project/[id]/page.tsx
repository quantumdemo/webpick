import { createServerClient } from '@/lib/supabase/server';
import { StudioClient } from '@/components/StudioClient';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

async function StudioContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  let project = null;

  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (data) project = data;
  } catch (err) {
    // Fallback sample
  }

  if (!project) {
    project = {
      id: resolvedParams.id,
      title: 'Linear App',
      url: 'https://linear.app',
      type: 'url',
      tokens_json: {
        meta: { siteName: 'Linear App' },
        colors: [
          { hex: '#0F1015', name: 'Primary Surface', role: 'background' },
          { hex: '#5E6AD2', name: 'Brand Accent', role: 'accent' },
          { hex: '#F7F8F8', name: 'Text Primary', role: 'text' },
          { hex: '#8A8F98', name: 'Text Muted', role: 'text-muted' },
          { hex: '#191B22', name: 'Card Surface', role: 'surface' },
          { hex: '#2E303A', name: 'Border Subtle', role: 'border' },
        ],
        typography: {
          fontFamilies: ['Inter', 'sans-serif'],
          headings: [
            { tag: 'H1', fontSize: '56px', fontWeight: '600' },
            { tag: 'H2', fontSize: '36px', fontWeight: '600' },
          ],
        },
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
