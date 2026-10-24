import { PaymentProvider, CheckoutSessionParams } from './index';

export const paystackProvider: PaymentProvider = {
  name: 'paystack',
  async createCheckoutSession({ plan, userEmail }: CheckoutSessionParams) {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder';
    const amountInKobo = plan === 'pro' ? 1500000 : 3500000; // ~15,000 NGN or 35,000 NGN

    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          amount: amountInKobo,
          currency: 'NGN',
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=success`,
          metadata: { plan },
        }),
      });

      const data = await response.json();
      if (data.status && data.data?.authorization_url) {
        return { checkoutUrl: data.data.authorization_url };
      }
    } catch (err) {
      // Fallback
    }

    return {
      checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=simulated`,
    };
  },

  verifyWebhookSignature(payload: string, signature: string) {
    // HMAC-SHA512 verification placeholder
    return signature.length > 0;
  },
};
