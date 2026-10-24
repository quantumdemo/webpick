import Stripe from 'stripe';
import { PaymentProvider, CheckoutSessionParams } from './index';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = new Stripe(stripeSecretKey);

export const stripeProvider: PaymentProvider = {
  name: 'stripe',
  async createCheckoutSession({ plan, userEmail, userId }: CheckoutSessionParams) {
    const priceAmount = plan === 'pro' ? 1200 : 2900;
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      client_reference_id: userId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `WebPicks ${plan.toUpperCase()} Plan`,
              description: 'Ethical Design System Extractor & Remake Studio Subscription',
            },
            unit_amount: priceAmount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?payment=cancel`,
    });

    return { checkoutUrl: session.url || '' };
  },

  verifyWebhookSignature(payload: string, signature: string) {
    try {
      stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
      );
      return true;
    } catch (err) {
      return false;
    }
  },
};
