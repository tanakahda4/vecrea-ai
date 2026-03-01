import { describe, expect, it } from 'vitest';
import { buildShoppingCheckoutCapability } from '../buildShoppingCheckoutCapability';

describe('buildShoppingCheckoutCapability', () => {
  it('returns Base with default values when called with no arguments', () => {
    const result = buildShoppingCheckoutCapability();

    expect(result).toEqual({
      version: '2026-01-23',
      spec: 'https://ucp.dev/specification/checkout',
      schema: 'https://ucp.dev/2026-01-23/schemas/shopping/checkout.json',
    });
  });

  it('returns Base with required fields', () => {
    const result = buildShoppingCheckoutCapability({});

    expect(result).toEqual({
      version: '2026-01-23',
      spec: 'https://ucp.dev/specification/checkout',
      schema: 'https://ucp.dev/2026-01-23/schemas/shopping/checkout.json',
    });
  });

  it('uses default version when version is not provided', () => {
    const result = buildShoppingCheckoutCapability({});

    expect(result.version).toBe('2026-01-23');
    expect(result.schema).toBe(
      'https://ucp.dev/2026-01-23/schemas/shopping/checkout.json',
    );
  });

  it('uses custom version when provided', () => {
    const result = buildShoppingCheckoutCapability({
      version: '2025-12-01',
    });

    expect(result.version).toBe('2025-12-01');
    expect(result.schema).toBe(
      'https://ucp.dev/2025-12-01/schemas/shopping/checkout.json',
    );
  });
});
