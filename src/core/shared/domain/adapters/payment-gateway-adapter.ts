import Stripe from 'stripe';

export type Interval = 'day' | 'week' | 'month' | 'year';

export type ConstructEventOutputTypes = {
  stripe: Stripe.Event;
};

export type ProductDataInput = {
  name: string;
  description?: string | null;
  metadata?: {
    [name: string]: string | number | null;
  };
};

export type PriceDataInput = {
  productId: string;
  amount: number;
  currency: string;
  interval?: Interval;
  metadata?: {
    [name: string]: string | number | null;
  };
};

export type SubscriptionDataInput = {
  customerId: string;
  priceId: string;
};

export type CreateCustomerDataInput = {
  name: string;
  email: string;
  metadata: {
    [name: string]: string | number | null;
  } | null;
};

export type CreateCustomerDataOutput = {
  id: string;
};

export type CheckoutSubscriptionDataInput = {
  priceId: string;
  customerId: string;
  successUrl: string;
  cancelUrl: string;
  startDate?: Date;
  trialPeriodDays?: number;
  metadata: {
    [key: string]: string | number;
  };
};

export type CheckoutSubscriptionDataOutput = {
  id: string;
  url: string;
};

export type ConstructEventDataInput = {
  body: string | Buffer<ArrayBufferLike>;
  sig: string;
  secretKey: string;
};

export interface PaymentGatewayAdapter<
  T extends keyof ConstructEventOutputTypes,
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
   * Create a customer in the payment gateway.
   * @param createCustomerDataInput - Customer data to be created.
   * @returns ID of the customer created in the payment gateway.
   */
  createCustomer(
    createCustomerDataInput: CreateCustomerDataInput,
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
    checkoutSubscriptionDataInput: CheckoutSubscriptionDataInput,
  ): Promise<CheckoutSubscriptionDataOutput>;

  constructEvent(
    constructEventDataOutput: ConstructEventDataInput,
  ): ConstructEventOutputTypes[T];
}
