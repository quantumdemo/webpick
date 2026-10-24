import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const providerHeader = req.headers.get('x-paystack-signature') ? 'paystack' : 'stripe';

    // Webhook verification & processing event
    return NextResponse.json({ received: true, provider: providerHeader });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}
