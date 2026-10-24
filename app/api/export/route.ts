import { NextResponse } from 'next/server';
import { checkCanSnap } from '@/lib/usage';

export async function POST(req: Request) {
  try {
    const snapCheck = await checkCanSnap();
    if (!snapCheck.allowed) {
      return NextResponse.json(
        {
          error: 'LIMIT_REACHED',
          message: snapCheck.needsAuth
            ? "You've used 3 free snaps. Sign up to get more exports!"
            : 'You have exhausted your project credits. Upgrade to Pro for unlimited exports!',
          needsAuth: snapCheck.needsAuth,
        },
        { status: 403 }
      );
    }

    const { project } = await req.json();
    return NextResponse.json({ success: true, project });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Export verification failed' }, { status: 500 });
  }
}
