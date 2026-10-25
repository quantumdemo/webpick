import { createClient } from '@/lib/supabase/server';
import { ProjectPageClient } from '@/components/ProjectPageClient';
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
    // Fallback if DB not configured or record missing
  }

  return <ProjectPageClient initialProject={project} projectId={resolvedParams.id} />;
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
