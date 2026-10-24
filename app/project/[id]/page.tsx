import { getProjectByIdDB } from '@/lib/db';
import { StudioClient } from '@/components/StudioClient';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

async function StudioContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const project = await getProjectByIdDB(resolvedParams.id);

  if (!project) {
    notFound();
  }

  return <StudioClient initialProject={project} />;
}

export default function StudioPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07080A] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <StudioContent params={params} />
    </Suspense>
  );
}
