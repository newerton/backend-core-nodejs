import Stripe from 'stripe';

import {
  PaymentGatewayProvider,
  PriceDataInput,
  ProductDataInput,
  SubscriptionDataInput,
} from '../../../../domain/providers/payment-gateway-provider';

export class StripePaymentGatewayAdapter implements PaymentGatewayProvider {
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, { apiVersion: '2025-01-27.acacia' });
  }

  async createProduct(productData: ProductDataInput): Promise<string> {
    try {
      const product = await this.stripe.products.create({
        name: productData.name,
        description: productData.description,
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
}
