import type { ServiceBase } from '@/generated/zod.gen';

/** Parameters for building a dev.ucp.shopping REST service entry */
export interface BuildShoppingRestServiceParams {
  /** REST API base URL (e.g. https://business.example.com/ucp/v1) */
  endpoint: string;
  /** UCP version (YYYY-MM-DD). Defaults to 2026-01-23 */
  version?: string;
}

/**
 * Builds a ServiceBase for dev.ucp.shopping with REST transport.
 * Used in Business Profile services.dev.ucp.shopping array.
 */
export const buildShoppingRestService = ({
  endpoint,
  version = '2026-01-23',
}: BuildShoppingRestServiceParams): ServiceBase => {
  return {
    version,
    spec: 'https://ucp.dev/specification/overview',
    transport: 'rest',
    endpoint,
    schema: `https://ucp.dev/${version}/services/shopping/openapi.json`,
  };
};
