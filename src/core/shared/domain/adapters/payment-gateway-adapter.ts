export type Interval = 'day' | 'week' | 'month' | 'year';

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

export type CheckoutSubscriptionDataInput = {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
};

export interface PaymentGatewayAdapter {
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
   * Checkout a subscription in the payment gateway.
   * @param checkoutSubscriptionDataInput - Subscription checkout data to be used.
   * @returns The checkout session created in the payment gateway.
   */
  checkoutSubscription(
    checkoutSubscriptionDataInput: CheckoutSubscriptionDataInput,
  );
}
