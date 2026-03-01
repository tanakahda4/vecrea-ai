import { describe, expect, it } from 'vitest';
import { buildCapabilities } from '../buildCapabilities';

describe('buildCapabilities', () => {
  it('returns both checkout and fulfillment when called with no arguments', () => {
    const result = buildCapabilities();

    expect(result).toHaveProperty('dev.ucp.shopping.checkout');
    expect(result).toHaveProperty('dev.ucp.shopping.fulfillment');
    expect(result['dev.ucp.shopping.checkout']).toHaveLength(1);
    expect(result['dev.ucp.shopping.fulfillment']).toHaveLength(1);
    expect(result['dev.ucp.shopping.checkout'][0]).toEqual({
      version: '2026-01-23',
      spec: 'https://ucp.dev/specification/checkout',
      schema: 'https://ucp.dev/2026-01-23/schemas/shopping/checkout.json',
    });
    expect(result['dev.ucp.shopping.fulfillment'][0]).toEqual({
      version: '2026-01-23',
      spec: 'https://ucp.dev/specification/fulfillment',
      schema: 'https://ucp.dev/2026-01-23/schemas/shopping/fulfillment.json',
      extends: 'dev.ucp.shopping.checkout',
    });
  });

  it('returns both checkout and fulfillment when called with empty object', () => {
    const result = buildCapabilities({});

    expect(result).toHaveProperty('dev.ucp.shopping.checkout');
    expect(result).toHaveProperty('dev.ucp.shopping.fulfillment');
  });

  it('returns checkout only when fulfillment is false', () => {
    const result = buildCapabilities({ shopping: { fulfillment: false } });

    expect(result).toHaveProperty('dev.ucp.shopping.checkout');
    expect(result).not.toHaveProperty('dev.ucp.shopping.fulfillment');
    expect(result['dev.ucp.shopping.checkout']).toHaveLength(1);
  });

  it('passes custom version to capabilities when provided', () => {
    const result = buildCapabilities({
      shopping: {
        checkout: { version: '2025-12-01' },
        fulfillment: { version: '2025-12-01' },
      },
    });

    expect(result['dev.ucp.shopping.checkout'][0].version).toBe('2025-12-01');
    expect(result['dev.ucp.shopping.fulfillment'][0].version).toBe('2025-12-01');
  });
});
