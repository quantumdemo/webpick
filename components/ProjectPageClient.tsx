'use client';

import { useEffect } from 'react';
import { StudioClient } from '@/components/StudioClient';
import { saveHandoff } from '@/lib/handoff';

export function ProjectPageClient({ initialProject, projectId }: { initialProject: any; projectId: string }) {
  useEffect(() => {
    // If project was retrieved from initial DB, save to handoff
    if (initialProject && initialProject.tokens_json) {
      saveHandoff({
        id: initialProject.id || projectId,
        url: initialProject.url,
        title: initialProject.title,
        extractedAt: initialProject.created_at || new Date().toISOString(),
        designMd: initialProject.designMd || '',
        tokens: initialProject.tokens_json,
        components: initialProject.components || {},
        prompts: initialProject.prompts || {},
        assets: initialProject.assets || {},
        wcagReport: initialProject.wcagReport || null,
        techStack: initialProject.techStack || {},
        slopReport: initialProject.slopReport || null,
        needVision: initialProject.needVision || null,
      });
    }
  }, [initialProject, projectId]);

  return <StudioClient initialProject={initialProject} projectId={projectId} />;
}
