import { createServerClient } from './supabase/server';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  plan: 'free' | 'pro' | 'team';
  stripe_customer_id?: string;
}

export interface ProjectRecord {
  id: string;
  user_id?: string;
  title: string;
  url?: string;
  image_url?: string;
  type: 'url' | 'image';
  tokens_json: any;
  screenshot_url?: string;
  theme?: string;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at?: string;
}

// In-memory fallback persistence store when Supabase environment variables are missing during preview/development
const memoryProjects: Map<string, ProjectRecord> = new Map();

// Initialize initial default project in memory if empty
const sampleProject: ProjectRecord = {
  id: 'proj-linear-1',
  user_id: 'user-default-1',
  title: 'Linear App',
  url: 'https://linear.app',
  type: 'url',
  screenshot_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
  theme: 'dark',
  status: 'completed',
  created_at: new Date().toISOString(),
  tokens_json: {
    meta: {
      siteName: 'Linear App',
      url: 'https://linear.app',
      extractedAt: new Date().toISOString(),
      viewport: { width: 1440, height: 900 },
    },
    colors: [
      { hex: '#0F1015', rgb: 'rgb(15, 16, 21)', name: 'Primary Surface', role: 'background' },
      { hex: '#5E6AD2', rgb: 'rgb(94, 106, 210)', name: 'Brand Accent', role: 'accent' },
      { hex: '#F7F8F8', rgb: 'rgb(247, 248, 248)', name: 'Text Primary', role: 'text' },
      { hex: '#8A8F98', rgb: 'rgb(138, 143, 152)', name: 'Text Muted', role: 'text-muted' },
      { hex: '#191B22', rgb: 'rgb(25, 27, 34)', name: 'Card Surface', role: 'surface' },
      { hex: '#2E303A', rgb: 'rgb(46, 48, 58)', name: 'Border Subtle', role: 'border' },
    ],
    typography: {
      fontFamilies: ['Inter', 'Geist', 'sans-serif'],
      headings: [
        { tag: 'H1', fontSize: '56px', fontWeight: '600', lineHeight: '1.1' },
        { tag: 'H2', fontSize: '36px', fontWeight: '600', lineHeight: '1.2' },
        { tag: 'H3', fontSize: '24px', fontWeight: '500', lineHeight: '1.3' },
      ],
      body: { fontSize: '16px', fontWeight: '400', lineHeight: '1.5' },
    },
    spacing: ['4px', '8px', '12px', '16px', '24px', '32px', '48px', '64px'],
    radii: ['6px', '12px', '9999px'],
    components: {
      buttons: [
        { variant: 'primary', bg: '#5E6AD2', color: '#FFFFFF', radius: '6px', padding: '10px 20px' },
        { variant: 'secondary', bg: '#191B22', color: '#F7F8F8', radius: '6px', padding: '10px 20px' },
      ],
      cards: [
        { bg: '#191B22', border: '#2E303A', radius: '12px', padding: '24px' }
      ]
    }
  }
};

memoryProjects.set(sampleProject.id, sampleProject);

export async function getProjectsDB(userId?: string): Promise<ProjectRecord[]> {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      const supabase = createServerClient();
      let query = supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as ProjectRecord[];
    }
  } catch (err) {
    console.warn('Supabase DB fetch failed, falling back to in-memory DB store', err);
  }

  return Array.from(memoryProjects.values());
}

export async function getProjectByIdDB(id: string): Promise<ProjectRecord | null> {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      const supabase = createServerClient();
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
      if (!error && data) return data as ProjectRecord;
    }
  } catch (err) {
    console.warn('Supabase DB fetch by ID failed, using fallback memory', err);
  }

  return memoryProjects.get(id) || null;
}

export async function saveProjectDB(project: Partial<ProjectRecord> & { title: string; type: 'url' | 'image'; tokens_json: any }): Promise<ProjectRecord> {
  const newProject: ProjectRecord = {
    id: project.id || `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: project.user_id || 'user-default-1',
    title: project.title,
    url: project.url,
    image_url: project.image_url,
    type: project.type,
    tokens_json: project.tokens_json,
    screenshot_url: project.screenshot_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
    theme: project.theme || 'dark',
    status: project.status || 'completed',
    created_at: project.created_at || new Date().toISOString(),
  };

  memoryProjects.set(newProject.id, newProject);

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      const supabase = createServerClient();
      const { data, error } = await supabase.from('projects').upsert([newProject]).select().single();
      if (!error && data) return data as ProjectRecord;
    }
  } catch (err) {
    console.warn('Failed to save to Supabase DB, stored in memory', err);
  }

  return newProject;
}

export async function deleteProjectDB(id: string): Promise<boolean> {
  memoryProjects.delete(id);

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      const supabase = createServerClient();
      const { error } = await supabase.from('projects').delete().eq('id', id);
      return !error;
    }
  } catch (err) {
    console.warn('Failed to delete from Supabase DB', err);
  }

  return true;
}
