import dayjs from 'dayjs';
import Stripe from 'stripe';

import { PaymentGatewayAdapter } from '../../../../domain/adapters';
import {
  CheckoutSubscriptionDataInput,
  CheckoutSubscriptionDataOutput,
  ConstructEventDataInput,
  ConstructEventOutputTypes,
  CreateCustomerDataInput,
  CreateCustomerDataOutput,
  PaymentProvider,
  PriceDataInput,
  ProductDataInput,
  SubscriptionDataInput,
} from '../../../../domain/adapters/payment-gateway-adapter';
export class StripePaymentGatewayAdapter
  implements PaymentGatewayAdapter<PaymentProvider.stripe>
{
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, { apiVersion: '2025-02-24.acacia' });
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
    } catch (err) {
      console.log(err);
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
    } catch (err) {
      console.log(err);
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
    } catch (err) {
      console.log(err);
      throw new Error('Error creating subscription');
    }
  }

  async createCustomer(
    createCustomerDataInput: CreateCustomerDataInput,
  ): Promise<CreateCustomerDataOutput> {
    try {
      const customer = await this.stripe.customers.create({
        name: createCustomerDataInput.name,
        email: createCustomerDataInput.email,
        metadata: createCustomerDataInput.metadata,
      });
      return {
        id: customer.id,
      };
    } catch (err) {
      console.log(err);
      throw new Error('Error creating customer');
    }
  }

  async retrieveCustomer(id: string): Promise<unknown> {
    try {
      const customer = await this.stripe.customers.retrieve(id);
      return customer;
    } catch (err) {
      console.log(err);
      throw new Error('Error retrieving customer');
    }
  }

  async checkoutSubscription(
    checkoutSubscriptionDataInput: CheckoutSubscriptionDataInput<PaymentProvider.stripe>,
  ): Promise<CheckoutSubscriptionDataOutput> {
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      locale: checkoutSubscriptionDataInput.locale,
      customer: checkoutSubscriptionDataInput.customerId,
      success_url: `${checkoutSubscriptionDataInput.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: checkoutSubscriptionDataInput.cancelUrl,
      line_items: [
        { price: checkoutSubscriptionDataInput.priceId, quantity: 1 },
      ],
    };

    if (
      checkoutSubscriptionDataInput.startDate ||
      checkoutSubscriptionDataInput.metadata
    ) {
      params['subscription_data'] = {
        ...(checkoutSubscriptionDataInput.startDate
          ? {
              billing_cycle_anchor: dayjs(
                checkoutSubscriptionDataInput.startDate,
              ).unix(),
              proration_behavior: 'none',
            }
          : {}),
        ...(checkoutSubscriptionDataInput.metadata
          ? { metadata: checkoutSubscriptionDataInput.metadata }
          : {}),
      };
    }

    try {
      const session = await this.stripe.checkout.sessions.create(params);
      return {
        id: session.id,
        url: session.url,
      };
    } catch (err) {
      console.log(err);
      throw new Error('Error creating checkout session');
    }
  }

  constructEvent(
    constructEventDataOutput: ConstructEventDataInput,
  ): ConstructEventOutputTypes['stripe'] {
    const event = this.stripe.webhooks.constructEvent(
      constructEventDataOutput.body,
      constructEventDataOutput.sig,
      constructEventDataOutput.secretKey,
    );

    return event;
  }
}
