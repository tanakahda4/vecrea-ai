import type { Base } from '@/generated/zod.gen';

/** Parameters for building a dev.ucp.shopping.checkout capability entry */
export interface BuildShoppingCheckoutCapabilityParams {
  /** UCP version (YYYY-MM-DD). Defaults to 2026-01-23 */
  version?: string;
}

/**
 * Builds a Base capability for dev.ucp.shopping.checkout.
 * Used in Business Profile capabilities.dev.ucp.shopping.checkout array.
 */
export const buildShoppingCheckoutCapability = ({
  version = '2026-01-23',
}: BuildShoppingCheckoutCapabilityParams = {}): Base => {
  return {
    version,
    spec: 'https://ucp.dev/specification/checkout',
    schema: `https://ucp.dev/${version}/schemas/shopping/checkout.json`,
  };
};
