import { defineConfig } from '@hey-api/openapi-ts';

export const OPENAPI_URL =
  'https://raw.githubusercontent.com/Universal-Commerce-Protocol/ucp/release/2026-01-23/source/services/shopping/openapi.json';

/**
 * Generates TypeScript types, Zod schemas, client, and SDK from the UCP OpenAPI spec.
 * Output: src/generated (zod.gen.ts, client.gen.ts, sdk.gen.ts).
 * types.gen.ts is replaced by post-process with minimal re-exports from zod.gen.
 */
export default defineConfig({
  input: OPENAPI_URL,
  output: {
    path: 'src/generated',
    postProcess: [{ command: 'node', args: ['scripts/replace-types-with-zod.mjs'] }],
  },
  plugins: [
    {
      name: 'zod',
      requests: {
        types: { infer: { name: '{{name}}Data' } },
      },
      responses: {
        types: { infer: { name: '{{name}}Response' } },
      },
      definitions: {
        types: {
          infer: { name: '{{name}}' },
        },
      },
    },
    '@hey-api/client-fetch',
    '@hey-api/sdk',
  ],
});
