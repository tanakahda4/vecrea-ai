import { describe, expect, it } from 'vitest';
import { buildServices } from '../buildServices';

describe('buildServices', () => {
  it('returns services object with dev.ucp.shopping', () => {
    const result = buildServices({
      shopping: { endpoint: 'https://business.example.com/ucp/v1' },
    });

    expect(result).toHaveProperty('dev.ucp.shopping');
    expect(result['dev.ucp.shopping']).toHaveLength(1);
    expect(result['dev.ucp.shopping'][0]).toEqual({
      version: '2026-01-23',
      spec: 'https://ucp.dev/specification/overview',
      transport: 'rest',
      endpoint: 'https://business.example.com/ucp/v1',
      schema: 'https://ucp.dev/2026-01-23/services/shopping/openapi.json',
    });
  });

  it('passes custom version to shopping service', () => {
    const result = buildServices({
      shopping: {
        endpoint: 'https://api.example.com/ucp',
        version: '2025-12-01',
      },
    });

    expect(result['dev.ucp.shopping'][0].version).toBe('2025-12-01');
    expect(result['dev.ucp.shopping'][0].schema).toBe(
      'https://ucp.dev/2025-12-01/services/shopping/openapi.json',
    );
  });
});
