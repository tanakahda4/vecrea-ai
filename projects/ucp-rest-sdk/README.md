# UCP REST SDK

Server and client utilities for UCP (Universal Commerce Protocol).

## Getting Started

vecrea-ai is a monorepo. Clone the repository and navigate to this project:

```bash
git clone https://github.com/dentsusoken/vecrea-ai
cd vecrea-ai/projects/ucp-rest-sdk
```

## Installation

To use ucp-rest-sdk as a dependency in another project:

```bash
pnpm add ucp-rest-sdk
# or
npm install ucp-rest-sdk
```

## Package Exports

| Export | Description |
|--------|--------------|
| `ucp-rest-sdk/common` | Shared constants (e.g. SDK name, version) used by server and client |
| `ucp-rest-sdk/server` | Server-side discovery profile builder |
| `ucp-rest-sdk/client` | Client utilities |
| `ucp-rest-sdk/generated` | OpenAPI-generated types and client |

## Generating src/generated

The `src/generated` directory contains TypeScript types, Zod schemas, and client code generated from the UCP OpenAPI spec. To regenerate:

```bash
npx @hey-api/openapi-ts
# or
pnpm generate
```

Configuration is in [openapi-ts.config.ts](openapi-ts.config.ts).

### Contents of src/generated

| File / Directory | Description |
|------------------|-------------|
| `zod.gen.ts` | Zod schemas and TypeScript types inferred from them |
| `types.gen.ts` | Re-exports from zod.gen plus URL-specific request/response types (e.g. `CreateCheckoutData`, `GetCheckoutResponse`) |
| `sdk.gen.ts` | High-level SDK functions: `createCheckout`, `getCheckout`, `updateCheckout`, `completeCheckout`, `cancelCheckout` |
| `client/` | HTTP client layer: `createClient()` and fetch-based request handling |
| `core/` | Low-level utilities for the client (auth, serialization, path building, etc.) |

## Quick Start

### Server: Discovery Profile

Serve the UCP discovery profile at `/.well-known/ucp` so AI agents can discover your merchant's capabilities, services, and payment handlers.

```typescript
import { buildDiscoveryProfile } from 'ucp-rest-sdk/server';

const profile = buildDiscoveryProfile({
  services: {
    shopping: {
      endpoint: 'https://business.example.com/ucp/v1',
    },
  },
  paymentHandlers: {
    gpay: {},
  },
});
```

See [src/server/README.md](src/server/README.md) for Express, Hono, and Next.js setup examples.

### Client: UCP Shopping API

Use the generated SDK to call UCP shopping endpoints (create checkout, get checkout, etc.). The base URL typically comes from the merchant's discovery profile.

```typescript
import { createCheckout, getCheckout } from 'ucp-rest-sdk/generated';

// Create checkout - baseUrl comes from the merchant's discovery profile
const { data } = await createCheckout({
  baseUrl: 'https://business.example.com/ucp/v1',
  body: { /* Root (checkout) payload */ },
  headers: {
    'Request-Signature': '...',
    'Idempotency-Key': crypto.randomUUID(),
    'Request-Id': crypto.randomUUID(),
  },
});

// Get checkout - pass path params for endpoints with {id}
const { data: checkout } = await getCheckout({
  baseUrl: 'https://business.example.com/ucp/v1',
  path: { id: 'checkout-session-id' },
  headers: {
    'Request-Signature': '...',
    'Request-Id': crypto.randomUUID(),
  },
});
```

To reuse config (e.g. baseUrl) across requests, create a client with `createClient()` and pass it via the `client` option. The `createClient` is available from the generated client module.

Available SDK functions: `createCheckout`, `getCheckout`, `updateCheckout`, `completeCheckout`, `cancelCheckout`. Request/response types are exported from `ucp-rest-sdk/generated`.

## Samples

The [samples/nextjs](samples/nextjs) directory contains a Next.js App Router sample. From the `ucp-rest-sdk` directory:

```bash
cd samples/nextjs
pnpm install
pnpm dev
```

After starting the dev server, access [http://localhost:3000/business/.well-known/ucp](http://localhost:3000/business/.well-known/ucp) to retrieve the UCP Discovery Profile.

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Build the library |
| `pnpm test` | Run tests |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm generate` | Regenerate OpenAPI types |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format with Prettier |
