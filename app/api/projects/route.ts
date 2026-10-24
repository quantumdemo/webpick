import { NextResponse } from 'next/server';
import { getProjectsDB, deleteProjectDB } from '@/lib/db';

export async function GET() {
  try {
    const projects = await getProjectsDB();
    return NextResponse.json({ projects });
  } catch (err: any) {
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

    const success = await deleteProjectDB(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
