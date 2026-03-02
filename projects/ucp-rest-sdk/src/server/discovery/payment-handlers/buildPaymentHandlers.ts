import { buildGpayPaymentHandler } from './gpay';
import type { BuildGpayPaymentHandlerParams } from './gpay';
import type { GpayPaymentHandler } from './gpay/gpayPaymentHandler';

/** Parameters for building payment handlers map */
export interface BuildPaymentHandlersParams {
  /** Google Pay handler config. When provided, adds com.google.pay to the result */
  gpay?: BuildGpayPaymentHandlerParams;
}

/** Response shape for payment_handlers in UCP discovery profile */
interface BuildPaymentHandlersResponse {
  'com.google.pay': GpayPaymentHandler[];
}

/**
 * Builds payment handlers object for UCP discovery profiles.
 *
 * @returns Object keyed by handler name (e.g. "com.google.pay") with array of handler declarations
 */
export const buildPaymentHandlers = (
  params: BuildPaymentHandlersParams = {},
): BuildPaymentHandlersResponse => {
  return {
    'com.google.pay': [buildGpayPaymentHandler(params.gpay)],
  };
};