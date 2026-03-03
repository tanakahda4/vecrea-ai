/// <reference types="node" />
import { defineConfig } from '@hey-api/openapi-ts';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OPENAPI_SPEC = join(__dirname, 'openapi-spec', 'source', 'services', 'shopping', 'openapi.json');

/**
 * Generates TypeScript types, Zod schemas, client, and SDK from the UCP OpenAPI spec.
 * Run `pnpm fetch-openapi-spec` before `pnpm generate` to download openapi.json, add fulfillment schema, and extend checkout.
 * Output: src/generated (zod.gen.ts, client.gen.ts, sdk.gen.ts).
 */
export default defineConfig({
  input: OPENAPI_SPEC,
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
