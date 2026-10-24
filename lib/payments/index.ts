export interface CheckoutSessionParams {
  plan: 'pro' | 'team';
  userEmail: string;
  userId: string;
  currency: 'USD' | 'NGN';
}

export interface PaymentProvider {
  name: 'stripe' | 'paystack';
  createCheckoutSession(params: CheckoutSessionParams): Promise<{ checkoutUrl: string }>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
}
