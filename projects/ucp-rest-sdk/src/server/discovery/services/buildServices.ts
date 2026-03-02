import type { BuildShoppingRestServiceParams } from './shopping/buildShoppingRestService';
import { buildShoppingRestService } from './shopping/buildShoppingRestService';
import type { ServiceBase } from '@/generated/zod.gen';

/**
 * Parameters for building the services object,
 * including configuration for the shopping service.
 */
export interface BuildServicesParams {
  shopping?: BuildShoppingRestServiceParams;
}

/**
 * Response object mapping service identifiers to arrays of ServiceBase items.
 */
interface BuildServicesResponse {
  [key: string]: ServiceBase[];
}

/**
 * Builds a services object containing available REST services.
 *
 * @param params - Parameters for building each service, keyed by service type.
 * @returns An object mapping service identifiers to ServiceBase arrays.
 */
export const buildServices = (
  params: BuildServicesParams = {},
): BuildServicesResponse => {
  return {
    'dev.ucp.shopping': [buildShoppingRestService(params.shopping)],
  };
};
