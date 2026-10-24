import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = new Stripe(stripeSecretKey);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = await createClient();

  if (event.type === 'invoice.paid' || event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    const customerEmail = session.customer_email || session.customer_details?.email;

    let targetUserId = userId;

    if (!targetUserId && customerEmail) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .maybeSingle();
      if (profile) targetUserId = profile.id;
    }

    if (targetUserId) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await supabase
        .from('profiles')
        .update({
          is_pro: true,
          plan: 'pro',
          credits: 500,
          pro_expires_at: expiresAt.toISOString(),
          stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetUserId);

      await supabase.from('subscriptions').insert({
        user_id: targetUserId,
        provider: 'stripe',
        status: 'active',
        current_period_end: expiresAt.toISOString(),
      });
    }
  }

  return NextResponse.json({ received: true });
}
