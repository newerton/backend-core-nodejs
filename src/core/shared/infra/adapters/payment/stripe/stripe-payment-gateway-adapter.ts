import Stripe from 'stripe';

import { PaymentGatewayAdapter } from '../../../../domain/adapters';
import {
  CheckoutSubscriptionDataInput,
  PriceDataInput,
  ProductDataInput,
  SubscriptionDataInput,
} from '../../../../domain/adapters/payment-gateway-adapter';

export class StripePaymentGatewayAdapter implements PaymentGatewayAdapter {
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, { apiVersion: '2025-01-27.acacia' });
  }

  async createProduct(productData: ProductDataInput): Promise<string> {
    try {
      const product = await this.stripe.products.create({
        name: productData.name,
        description: productData.description,
        ...(productData.metadata
          ? { metadata: productData.metadata }
          : undefined),
      });
      return product.id;
    } catch {
      throw new Error('Error creating product');
    }
  }

  async createPrice(priceData: PriceDataInput): Promise<string> {
    try {
      const price = await this.stripe.prices.create({
        product: priceData.productId,
        unit_amount: priceData.amount,
        currency: priceData.currency,
        recurring: priceData.interval
          ? { interval: priceData.interval }
          : undefined,
        ...(priceData.metadata ? { metadata: priceData.metadata } : undefined),
      });
      return price.id;
    } catch {
      throw new Error('Error creating price');
    }
  }

  async createSubscription(
    subscriptionData: SubscriptionDataInput,
  ): Promise<string> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: subscriptionData.customerId,
        items: [{ price: subscriptionData.priceId }],
      });
      return subscription.id;
    } catch {
      throw new Error('Error creating subscription');
    }
  }

  async checkoutSubscription(
    checkoutSubscriptionDataInput: CheckoutSubscriptionDataInput,
  ) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        success_url: checkoutSubscriptionDataInput.successUrl,
        cancel_url: checkoutSubscriptionDataInput.cancelUrl,
        line_items: [
          { price: checkoutSubscriptionDataInput.priceId, quantity: 1 },
        ],
      });
      return session;
    } catch {
      throw new Error('Error creating checkout session');
    }
  }
}
