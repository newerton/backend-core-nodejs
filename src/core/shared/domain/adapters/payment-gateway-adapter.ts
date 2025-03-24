import Stripe from 'stripe';

export type Interval = 'day' | 'week' | 'month' | 'year';

export enum PaymentProvider {
  stripe = 'stripe',
  paypal = 'paypal',
}

export type ConstructEventOutputTypes = {
  [PaymentProvider.stripe]: Stripe.Event;
};

export type LocaleTypes = {
  [PaymentProvider.stripe]: Stripe.Checkout.SessionCreateParams.Locale;
};

export type ProductDataInput = {
  name: string;
  description?: string | null;
  metadata: {
    [name: string]: string | number | null;
  };
};

export type PriceDataInput = {
  productId: string;
  amount: number;
  currency: string;
  interval?: Interval;
  metadata: {
    [name: string]: string | number | null;
  };
};

export type SubscriptionDataInput = {
  customerId: string;
  priceId: string;
};

export type CreateCustomerDataInput<L extends keyof LocaleTypes> = {
  name: string;
  email: string;
  locale: LocaleTypes[L];
  metadata: {
    [name: string]: string | number | null;
  } | null;
};

export type CreateCustomerDataOutput = {
  id: string;
};

export type InvoiceRetrieveDataInput = {
  id: string;
};

export type CheckoutSubscriptionDataInput<L extends keyof LocaleTypes> = {
  priceId: string;
  customerId: string;
  locale: LocaleTypes[L];
  successUrl: string;
  cancelUrl: string;
  trialEnd?: number;
  metadata: {
    [key: string]: string | number;
  };
};

export type CheckoutSubscriptionDataOutput = {
  id: string;
  url: string;
};

export type CheckoutSessionRetrieveDataInput = {
  sessionId: string;
};

export type CheckoutSessionRetrieveDataOutput = {
  id: string;
  object: string;
  mode: string;
  currency: string;
  subtotal: number;
  total: number;
  totalDetails: unknown;
  status: string;
  url: string;
  invoice?: {
    id: string;
    number: string;
    invoiceUrl: string;
    invoicePdf: string;
    items: {
      id: string;
      amount: number;
      currency: string;
      description: string;
      period: {
        start: number;
        end: number;
      };
    }[];
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    metadata: {
      [key: string]: string | number;
    };
  };
  subscription?: {
    id: string;
    periodStart: number;
    periodEnd: number;
    trialEnd: number;
    metadata: {
      [key: string]: string | number;
    };
    plan: {
      id: string;
      amount: number;
      currency: string;
      interval: Interval;
      metadata: {
        [key: string]: string | number;
      };
    };
  };
};

export type ConstructEventDataInput = {
  body: string | Buffer<ArrayBufferLike>;
  sig: string;
  secretKey: string;
};

export interface PaymentGatewayAdapter<
  P extends keyof ConstructEventOutputTypes,
> {
  /**
   * Create a product in the payment gateway.
   * @param productData - Product data to be created.
   * @returns ID of the product created in the payment gateway.
   */
  createProduct(productDataInput: ProductDataInput): Promise<string>;

  /**
   * Create a price in the payment gateway.
   * @param priceData - Price data to be created.
   * @returns ID of the price created in the payment gateway.
   */
  createPrice(priceDataInput: PriceDataInput): Promise<string>;

  /**
   * Create a subscription in the payment gateway.
   * @param subscriptionData - Subscription data to be created.
   * @returns ID of the subscription created in the payment gateway.
   */
  createSubscription(
    subscriptionDataInput: SubscriptionDataInput,
  ): Promise<string>;

  /**
   * Retrieve a subscription from the payment gateway.
   * @param id - ID of the subscription to be retrieved.
   * @returns Data of the subscription retrieved.
   */
  retrieveSubscription(id: string): Promise<unknown>;

  /**
   * Create a customer in the payment gateway.
   * @param createCustomerDataInput - Customer data to be created.
   * @returns ID of the customer created in the payment gateway.
   */
  createCustomer(
    createCustomerDataInput: CreateCustomerDataInput<P>,
  ): Promise<CreateCustomerDataOutput>;

  /**
   * Retrieve a client from the payment gateway.
   * @param id - ID of the client to be retrieved.
   * @returns Data of the client retrieved.
   */
  retrieveCustomer(id: string): Promise<unknown>;

  /**
   * Checkout a subscription in the payment gateway.
   * @param checkoutSubscriptionDataInput - Subscription checkout data to be used.
   * @returns The checkout session created in the payment gateway.
   */
  checkoutSubscription(
    checkoutSubscriptionDataInput: CheckoutSubscriptionDataInput<P>,
  ): Promise<CheckoutSubscriptionDataOutput>;

  /**
   * Retrieve a checkout session from the payment gateway.
   * @param checkoutSessionRetrieveDataInput - Input data for retrieving the checkout session.
   * @returns The checkout session retrieved from the payment gateway.
   */
  checkoutSessionRetrieve(
    checkoutSessionRetrieveDataInput: CheckoutSessionRetrieveDataInput,
  ): Promise<CheckoutSessionRetrieveDataOutput>;

  /**
   * Retrieve an invoice from the payment gateway.
   * @param invoiceRetrieveDataInput - Input data for retrieving the invoice.
   * @returns Data of the invoice retrieved.
   */
  retrieveInvoice(
    invoiceRetrieveDataInput: InvoiceRetrieveDataInput,
  ): Promise<unknown>;

  /**
   * Construct an event from the payment gateway.
   * @param constructEventDataOutput - Data required to construct the event.
   * @returns The constructed event output from the payment gateway.
   */
  constructEvent(
    constructEventDataOutput: ConstructEventDataInput,
  ): ConstructEventOutputTypes[P];
}
