import type { Base } from '@/generated/zod.gen';

/** Parameters for building a dev.ucp.shopping.fulfillment capability entry */
export interface BuildShoppingFulfillmentCapabilityParams {
  /** UCP version (YYYY-MM-DD). Defaults to 2026-01-23 */
  version?: string;
}

/**
 * Builds a Base capability for dev.ucp.shopping.fulfillment.
 * Used in Business Profile capabilities.dev.ucp.shopping.fulfillment array.
 */
export const buildShoppingFulfillmentCapability = ({
  version = '2026-01-23',
}: BuildShoppingFulfillmentCapabilityParams = {}): Base => {
  return {
    version,
    spec: 'https://ucp.dev/specification/fulfillment',
    schema: `https://ucp.dev/${version}/schemas/shopping/fulfillment.json`,
    extends: 'dev.ucp.shopping.checkout',
  };
};
