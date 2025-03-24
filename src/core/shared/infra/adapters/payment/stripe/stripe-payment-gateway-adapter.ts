import Stripe from 'stripe';

import { PaymentGatewayAdapter } from '../../../../domain/adapters';
import {
  CheckoutSessionRetrieveDataInput,
  CheckoutSessionRetrieveDataOutput,
  CheckoutSubscriptionDataInput,
  CheckoutSubscriptionDataOutput,
  ConstructEventDataInput,
  ConstructEventOutputTypes,
  CreateCustomerDataInput,
  CreateCustomerDataOutput,
  InvoiceRetrieveDataInput,
  PaymentProvider,
  PriceDataInput,
  ProductDataInput,
  SubscriptionDataInput,
} from '../../../../domain/adapters/payment-gateway-adapter';
import { ApiServerConfig } from '../../../configs/env/api';
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

  async retrieveSubscription(id: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(id);
      return subscription;
    } catch (err) {
      console.log(err);
      throw new Error('Error retrieving subscription');
    }
  }

  async createCustomer(
    createCustomerDataInput: CreateCustomerDataInput<PaymentProvider.stripe>,
  ): Promise<CreateCustomerDataOutput> {
    try {
      const customer = await this.stripe.customers.create({
        name: createCustomerDataInput.name,
        email: createCustomerDataInput.email,
        metadata: createCustomerDataInput.metadata,
        preferred_locales: [createCustomerDataInput.locale],
      });
      return {
        id: customer.id,
      };
    } catch (err) {
      console.log(err);
      throw new Error('Error creating customer');
    }
  }

  async retrieveCustomer(
    id: string,
  ): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
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
    const successUrl = checkoutSubscriptionDataInput.successUrl.includes('?')
      ? `${checkoutSubscriptionDataInput.successUrl}&session_id={CHECKOUT_SESSION_ID}`
      : `${checkoutSubscriptionDataInput.successUrl}?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = checkoutSubscriptionDataInput.cancelUrl.includes('?')
      ? `${checkoutSubscriptionDataInput.cancelUrl}&session_id={CHECKOUT_SESSION_ID}`
      : `${checkoutSubscriptionDataInput.cancelUrl}?session_id={CHECKOUT_SESSION_ID}`;

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      locale: checkoutSubscriptionDataInput.locale,
      customer: checkoutSubscriptionDataInput.customerId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        { price: checkoutSubscriptionDataInput.priceId, quantity: 1 },
      ],
    };

    if (
      checkoutSubscriptionDataInput.trialEnd ||
      checkoutSubscriptionDataInput.metadata
    ) {
      params['subscription_data'] = {
        ...(checkoutSubscriptionDataInput.trialEnd
          ? {
              trial_end: checkoutSubscriptionDataInput.trialEnd,
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

  async checkoutSessionRetrieve(
    checkoutSessionRetrieveDataInput: CheckoutSessionRetrieveDataInput,
  ): Promise<CheckoutSessionRetrieveDataOutput> {
    const debug = {
      session: null,
      invoice: null,
      customer: null,
      subscription: null,
    };

    try {
      const session = await this.stripe.checkout.sessions.retrieve(
        checkoutSessionRetrieveDataInput.sessionId,
      );
      debug.session = session;

      const output: CheckoutSessionRetrieveDataOutput = {
        id: session.id,
        object: session.object,
        mode: session.mode,
        subtotal: session.amount_subtotal,
        total: session.amount_total,
        currency: session.currency,
        totalDetails: session.total_details,
        status: session.status,
        url: session.url,
        invoice: null,
        customer: null,
        subscription: null,
      };

      if (session.invoice) {
        const invoice = await this.retrieveInvoice({
          id: session.invoice as string,
        });
        debug.invoice = invoice;

        const items = invoice.lines.data.map((item) => ({
          id: item.id,
          amount: item.amount,
          currency: item.currency,
          description: item.description,
          period: {
            start: item.period.start,
            end: item.period.end,
          },
        }));

        output.invoice = {
          id: invoice.id,
          number: invoice.number,
          invoiceUrl: invoice.hosted_invoice_url,
          invoicePdf: invoice.invoice_pdf,
          items,
        };
      }

      if (session.customer) {
        const customer = (await this.retrieveCustomer(
          session.customer as string,
        )) as Stripe.Customer;
        debug.customer = customer;
        output.customer = {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          metadata: customer.metadata,
        };
      }

      if (session.subscription) {
        const subscription = await this.retrieveSubscription(
          session.subscription as string,
        );
        debug.subscription = subscription;

        if (subscription.items) {
          const hasSubscriptionItem = subscription.items.data.find(
            (item) => item.object === 'subscription_item',
          );

          if (hasSubscriptionItem) {
            output.subscription = {
              id: subscription.id,
              periodStart: subscription.current_period_start,
              periodEnd: subscription.current_period_end,
              metadata: subscription.metadata,
              trialEnd: subscription.trial_end,
              plan: {
                id: hasSubscriptionItem.plan.id,
                amount: hasSubscriptionItem.plan.amount,
                currency: hasSubscriptionItem.plan.currency,
                interval: hasSubscriptionItem.plan.interval,
                metadata: hasSubscriptionItem.plan.metadata,
              },
            };
          }
        }
      }

      if (!ApiServerConfig.ENV.startsWith('prod')) {
        console.dir(debug, { depth: 10 });
        console.dir(output, { depth: 10 });
      }

      return output;
    } catch (err) {
      console.log(err);
      throw new Error('Error retrieving checkout session');
    }
  }

  async retrieveInvoice(
    invoiceRetrieveDataInput: InvoiceRetrieveDataInput,
  ): Promise<Stripe.Invoice> {
    try {
      const invoice = await this.stripe.invoices.retrieve(
        invoiceRetrieveDataInput.id,
      );
      return invoice;
    } catch (err) {
      console.log(err);
      throw new Error('Error retrieving invoice');
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

    if (!ApiServerConfig.ENV.startsWith('prod')) {
      console.dir(event, { depth: 10 });
    }

    return event;
  }
}
