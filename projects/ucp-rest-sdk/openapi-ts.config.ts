import { defineConfig } from '@hey-api/openapi-ts';

export const OPENAPI_URL =
  'https://raw.githubusercontent.com/Universal-Commerce-Protocol/ucp/release/2026-01-23/source/services/shopping/openapi.json';

/**
 * Generates TypeScript types, Zod schemas, client, and SDK from the UCP OpenAPI spec.
 * Output: src/generated (types.gen.ts, zod.gen.ts, client.gen.ts, sdk.gen.ts)
 */
export default defineConfig({
  input: OPENAPI_URL,
  output: {
    path: 'src/generated',
    clean: false,
  },
  plugins: [
    '@hey-api/typescript',
    {
      name: 'zod',
      requests: true,
      responses: true,
    },
    '@hey-api/client-fetch',
    '@hey-api/sdk',
  ],
});
