import { describe, expect, it } from 'vitest';
import { buildDiscoveryProfile } from '../buildDiscoveryProfile';

describe('buildDiscoveryProfile', () => {
  it('returns profile with ucp and signing_keys when called with minimal params', () => {
    const result = buildDiscoveryProfile({ services: {} });

    expect(result).toHaveProperty('ucp');
    expect(result).toHaveProperty('signing_keys');
    expect(result.ucp).toHaveProperty('version');
    expect(result.ucp).toHaveProperty('capabilities');
    expect(result.ucp).toHaveProperty('services');
    expect(result.ucp).toHaveProperty('payment_handlers');
    expect(result.signing_keys).toHaveLength(1);
  });

  it('uses default version when not provided', () => {
    const result = buildDiscoveryProfile({ services: {} });

    expect(result.ucp.version).toBe('2026-01-23');
  });

  it('uses custom version when provided', () => {
    const result = buildDiscoveryProfile({
      services: {},
      version: '2025-12-01',
    });

    expect(result.ucp.version).toBe('2025-12-01');
  });

  it('uses default signing keys when not provided', () => {
    const result = buildDiscoveryProfile({ services: {} });

    expect(result.signing_keys[0]).toMatchObject({
      kid: 'business_2025',
      kty: 'EC',
      crv: 'P-256',
      alg: 'ES256',
    });
  });

  it('uses custom signingKeys when provided', () => {
    const customKeys = [
      {
        kid: 'custom_2025',
        kty: 'EC' as const,
        crv: 'P-256',
        x: 'custom_x',
        y: 'custom_y',
        alg: 'ES256' as const,
      },
    ];
    const result = buildDiscoveryProfile({
      services: {},
      signingKeys: customKeys,
    });

    expect(result.signing_keys).toEqual(customKeys);
  });

  it('passes services config to services', () => {
    const result = buildDiscoveryProfile({
      services: {
        shopping: { endpoint: 'https://api.example.com/ucp/v1' },
      },
    });

    expect(result.ucp.services!['dev.ucp.shopping'][0].endpoint).toBe(
      'https://api.example.com/ucp/v1',
    );
  });

  it('passes capabilities config', () => {
    const result = buildDiscoveryProfile({
      services: {},
      capabilities: { shopping: { fulfillment: false } },
    });

    expect(result.ucp.capabilities).toHaveProperty('dev.ucp.shopping.checkout');
    expect(result.ucp.capabilities).not.toHaveProperty(
      'dev.ucp.shopping.fulfillment',
    );
  });

  it('passes paymentHandlers config', () => {
    const result = buildDiscoveryProfile({
      services: {},
      paymentHandlers: {
        gpay: { id: 'gpay-custom' },
      },
    });

    expect(result.ucp.payment_handlers!['com.google.pay'][0].id).toBe(
      'gpay-custom',
    );
  });
});
