/** Parameters for building a Google Pay Stripe gateway config */
export interface BuildGpayStripeGatewayParams {
  /** Stripe publishable key for the gateway */
  publishableKey?: string;
}

/**
 * Builds a Google Pay Stripe gateway configuration object.
 * Used in Business Profile payment_handlers config.
 */
export const buildGpayStripeGateway = (
  params: BuildGpayStripeGatewayParams = {},
) => {
  const publishableKey = params.publishableKey || 'YOUR_PUBLISHABLE_KEY';
  return {
    gateway: 'stripe',
    'stripe:version': '2018-10-31',
    'stripe:publishableKey': publishableKey,
  };
};
