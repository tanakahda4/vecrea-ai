import { describe, expect, it } from 'vitest';
import { buildShoppingRestService } from '../buildShoppingRestService';

describe('buildShoppingRestService', () => {
  it('returns ServiceBase with default values when called with no arguments', () => {
    const result = buildShoppingRestService();

    expect(result).toEqual({
      version: '2026-01-23',
      spec: 'https://ucp.dev/specification/overview',
      transport: 'rest',
      endpoint: 'https://business.example.com/ucp/v1',
      schema: 'https://ucp.dev/2026-01-23/services/shopping/openapi.json',
    });
  });

  it('returns ServiceBase with required fields', () => {
    const result = buildShoppingRestService({
      endpoint: 'https://business.example.com/ucp/v1',
    });

    expect(result).toEqual({
      version: '2026-01-23',
      spec: 'https://ucp.dev/specification/overview',
      transport: 'rest',
      endpoint: 'https://business.example.com/ucp/v1',
      schema: 'https://ucp.dev/2026-01-23/services/shopping/openapi.json',
    });
  });

  it('uses default version when version is not provided', () => {
    const result = buildShoppingRestService({
      endpoint: 'https://api.example.com/ucp',
    });

    expect(result.version).toBe('2026-01-23');
    expect(result.schema).toBe(
      'https://ucp.dev/2026-01-23/services/shopping/openapi.json',
    );
  });

  it('uses custom version when provided', () => {
    const result = buildShoppingRestService({
      endpoint: 'https://api.example.com/ucp',
      version: '2025-12-01',
    });

    expect(result.version).toBe('2025-12-01');
    expect(result.schema).toBe(
      'https://ucp.dev/2025-12-01/services/shopping/openapi.json',
    );
  });
});
