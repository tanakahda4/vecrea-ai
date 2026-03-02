import type {
  SigningKey,
  UcpDiscoveryProfile,
} from '../models/discovery/profileSchema';
import {
  buildCapabilities,
  type BuildCapabilitiesParams,
} from './capabilities';
import type { BuildPaymentHandlersParams } from './payment-handlers';
import type { BuildServicesParams } from './services';
import { buildServices } from './services';
import { buildPaymentHandlers } from './payment-handlers';

/** Parameters for building a UCP discovery profile */
export interface BuildDiscoveryProfileParams {
  /** UCP version in YYYY-MM-DD format. Defaults to 2026-01-23 */
  version?: string;
  /** Capability config (checkout, fulfillment, etc.) */
  capabilities?: BuildCapabilitiesParams;
  /** Service config (shopping REST endpoint, etc.) */
  services: BuildServicesParams;
  /** Payment handler config (Google Pay, etc.) */
  paymentHandlers?: BuildPaymentHandlersParams;
  /** EC signing keys for x-detached-jwt verification. Defaults to sample key */
  signingKeys?: SigningKey[];
}

/**
 * Builds a UCP discovery profile for the profile URL.
 *
 * @returns Profile object with ucp metadata and signing_keys for JWT verification
 */
export const buildDiscoveryProfile = (
  params: BuildDiscoveryProfileParams,
): UcpDiscoveryProfile => {
  const {
    version = '2026-01-23',
    capabilities,
    services,
    paymentHandlers,
    signingKeys = [
      {
        kid: 'business_2025',
        kty: 'EC',
        crv: 'P-256',
        x: 'WbbXwVYGdJoP4Xm3qCkGvBRcRvKtEfXDbWvPzpPS8LA',
        y: 'sP4jHHxYqC89HBo8TjrtVOAGHfJDflYxw7MFMxuFMPY',
        use: 'sig',
        alg: 'ES256',
      },
    ],
  } = params;
  return {
    ucp: {
      version,
      capabilities: buildCapabilities(capabilities),
      services: buildServices(services),
      payment_handlers: buildPaymentHandlers(paymentHandlers),
    },
    signing_keys: signingKeys,
  };
};
