import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !projects || projects.length === 0) {
      // Fallback sample data if database table is empty/unreachable
      return NextResponse.json({
        projects: [
          {
            id: 'proj-linear-1',
            title: 'Linear App',
            url: 'https://linear.app',
            type: 'url',
            status: 'completed',
            created_at: new Date().toISOString(),
            tokens_json: {
              colors: [
                { hex: '#0F1015', name: 'Primary Surface' },
                { hex: '#5E6AD2', name: 'Brand Accent' },
                { hex: '#F7F8F8', name: 'Text Primary' },
              ],
            },
          },
        ],
      });
    }

    return NextResponse.json({ projects });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
