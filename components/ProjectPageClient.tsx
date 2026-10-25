'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { StudioClient } from '@/components/StudioClient';
import { saveHandoff } from '@/lib/handoff';

export function ProjectPageClient({ initialProject, projectId }: { initialProject: any; projectId: string }) {
  useEffect(() => {
    // If project was retrieved from initial DB or payload, save to handoff
    if (initialProject && initialProject.tokens_json) {
      saveHandoff({
        id: initialProject.id || projectId,
        url: initialProject.url || 'https://example.com',
        title: initialProject.title || 'Extracted Design System',
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
