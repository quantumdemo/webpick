import { NextResponse } from 'next/server';
import { stripeProvider } from '@/lib/payments/stripe';
import { paystackProvider } from '@/lib/payments/paystack';

export async function POST(req: Request) {
  try {
    const { plan, provider = 'stripe', userEmail = 'alex@company.com', userId = 'user-1' } = await req.json();

    if (!plan || !['pro', 'team'].includes(plan)) {
      return NextResponse.json({ error: 'Valid plan (pro or team) is required' }, { status: 400 });
    }

    let checkoutUrl = '';

    if (provider === 'paystack') {
      const res = await paystackProvider.createCheckoutSession({
        plan,
        userEmail,
        userId,
        currency: 'NGN',
      });
      checkoutUrl = res.checkoutUrl;
    } else {
      const res = await stripeProvider.createCheckoutSession({
        plan,
        userEmail,
        userId,
        currency: 'USD',
      });
      checkoutUrl = res.checkoutUrl;
    }

    return NextResponse.json({ checkoutUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Checkout initiation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
