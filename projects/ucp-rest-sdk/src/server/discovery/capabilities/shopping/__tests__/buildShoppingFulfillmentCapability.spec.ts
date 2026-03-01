import { describe, expect, it } from 'vitest';
import { buildShoppingFulfillmentCapability } from '../buildShoppingFulfillmentCapability';

describe('buildShoppingFulfillmentCapability', () => {
  it('returns Base with default values when called with no arguments', () => {
    const result = buildShoppingFulfillmentCapability();

    expect(result).toEqual({
      version: '2026-01-23',
      spec: 'https://ucp.dev/specification/fulfillment',
      schema: 'https://ucp.dev/2026-01-23/schemas/shopping/fulfillment.json',
      extends: 'dev.ucp.shopping.checkout',
    });
  });

  it('returns Base with required fields including extends', () => {
    const result = buildShoppingFulfillmentCapability({});

    expect(result).toEqual({
      version: '2026-01-23',
      spec: 'https://ucp.dev/specification/fulfillment',
      schema: 'https://ucp.dev/2026-01-23/schemas/shopping/fulfillment.json',
      extends: 'dev.ucp.shopping.checkout',
    });
  });

  it('uses default version when version is not provided', () => {
    const result = buildShoppingFulfillmentCapability({});

    expect(result.version).toBe('2026-01-23');
    expect(result.schema).toBe(
      'https://ucp.dev/2026-01-23/schemas/shopping/fulfillment.json',
    );
  });

  it('uses custom version when provided', () => {
    const result = buildShoppingFulfillmentCapability({
      version: '2025-12-01',
    });

    expect(result.version).toBe('2025-12-01');
    expect(result.schema).toBe(
      'https://ucp.dev/2025-12-01/schemas/shopping/fulfillment.json',
    );
  });
});
