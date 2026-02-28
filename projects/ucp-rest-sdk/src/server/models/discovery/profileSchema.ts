/**
 * Zod schemas for UCP discovery profile.
 * Used to validate profile responses (e.g. /.well-known/ucp.json).
 */
import { z } from 'zod';
import { zUcpBase } from '@/generated/zod.gen';

/** JWK "use" parameter: encryption or signature */
export const zUse = z.enum(['enc', 'sig']);

/**
 * EC signing key (JWK) for verifying x-detached-jwt in responses.
 * UCP supports ES256, ES384, ES512.
 */
export const zSigningKey = z.object({
  /** Algorithm: ES256, ES384, or ES512 */
  alg: z.enum(['ES256', 'ES384', 'ES512']),
  /** Curve name (e.g. P-256 for ES256) */
  crv: z.string().optional(),
  /** RSA exponent (unused for EC) */
  e: z.string().optional(),
  /** Key ID for JWT kid header */
  kid: z.string(),
  /** Key type: EC for elliptic curve */
  kty: z.literal('EC'),
  /** RSA modulus (unused for EC) */
  n: z.string().optional(),
  /** JWK use: enc or sig */
  use: zUse.optional(),
  /** EC public key x coordinate (base64url) */
  x: z.string(),
  /** EC public key y coordinate (base64url) */
  y: z.string(),
});

/**
 * UCP discovery profile schema.
 * Returned at profile URL (e.g. from UCP-Agent header).
 * signing_keys are required to verify x-detached-jwt in API responses.
 */
export const UcpDiscoveryProfile = z.object({
  /** UCP metadata: version, services, capabilities, payment handlers */
  ucp: zUcpBase,
  /** EC public keys for verifying x-detached-jwt. At least one required. */
  signing_keys: z.array(zSigningKey),
});
