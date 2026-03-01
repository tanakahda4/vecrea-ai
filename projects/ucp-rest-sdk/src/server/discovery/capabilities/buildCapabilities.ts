import {
  buildShoppingCheckoutCapability,
  type BuildShoppingCheckoutCapabilityParams,
} from './shopping/buildShoppingCheckoutCapability';
import {
  buildShoppingFulfillmentCapability,
  type BuildShoppingFulfillmentCapabilityParams,
} from './shopping/buildShoppingFulfillmentCapability';
import type { Base } from '@/generated/zod.gen';

/** Parameters for building the capabilities object */
export interface BuildCapabilitiesParams {
  shopping?: {
    checkout?: BuildShoppingCheckoutCapabilityParams;
    /**
     * Set to false when fulfillment is not supported (checkout only).
     * Omit for both checkout and fulfillment (default for most businesses).
     */
    fulfillment?: BuildShoppingFulfillmentCapabilityParams | false;
  };
}

/** Response object mapping capability identifiers to arrays of Base items */
export interface BuildCapabilitiesResponse {
  [key: string]: Base[];
}

/**
 * Builds a capabilities object for Business Profile.
 *
 * Minimizes required arguments:
 * - **Both checkout and fulfillment** (majority): Call with no args or empty object.
 * - **Checkout only** (fulfillment not supported): Pass `{ shopping: { fulfillment: false } }`.
 *
 * @example
 * // Both checkout and fulfillment (default)
 * buildCapabilities()
 *
 * @example
 * // Checkout only
 * buildCapabilities({ shopping: { fulfillment: false } })
 */
export const buildCapabilities = (
  params?: BuildCapabilitiesParams,
): BuildCapabilitiesResponse => {
  const fulfillmentDisabled = params?.shopping?.fulfillment === false;

  if (fulfillmentDisabled) {
    return {
      'dev.ucp.shopping.checkout': [
        buildShoppingCheckoutCapability(params?.shopping?.checkout),
      ],
    };
  }

  return {
    'dev.ucp.shopping.checkout': [
      buildShoppingCheckoutCapability(params?.shopping?.checkout),
    ],
    'dev.ucp.shopping.fulfillment': [
      buildShoppingFulfillmentCapability(
        params?.shopping?.fulfillment || undefined,
      ),
    ],
  };
};
