import { buildGpayPaymentHandler } from './gpay';
import type { BuildGpayPaymentHandlerParams } from './gpay';
import type { PaymentHandlerBase } from '@/generated/zod.gen';

/** Parameters for building payment handlers map */
export interface BuildPaymentHandlersParams {
  /** Google Pay handler config. When provided, adds com.google.pay to the result */
  gpay?: BuildGpayPaymentHandlerParams;
}

/** Response shape for payment_handlers in UCP discovery profile */
interface BuildPaymentHandlersResponse {
  [key: string]: PaymentHandlerBase[];
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
    'com.google.pay': [
      buildGpayPaymentHandler(params.gpay) as unknown as PaymentHandlerBase,
    ],
  };
};
