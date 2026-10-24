import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature') || '';
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder';

    const hash = crypto.createHmac('sha512', paystackSecretKey).update(body).digest('hex');

    if (hash !== signature && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Invalid Paystack signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event === 'charge.success' || event.event === 'subscription.create') {
      const customerEmail = event.data?.customer?.email;
      const customerCode = event.data?.customer?.customer_code;

      if (customerEmail) {
        const supabase = await createClient();
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .maybeSingle();

        if (profile) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);

          await supabase
            .from('profiles')
            .update({
              is_pro: true,
              plan: 'pro',
              credits: 500,
              pro_expires_at: expiresAt.toISOString(),
              paystack_customer_code: customerCode || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);

          await supabase.from('subscriptions').insert({
            user_id: profile.id,
            provider: 'paystack',
            status: 'active',
            current_period_end: expiresAt.toISOString(),
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Paystack webhook error' }, { status: 400 });
  }
}
