# UCP REST SDK - Client Sample

Client sample that consumes the UCP API using `ucp-rest-sdk/generated`.

## Getting Started

From the `ucp-rest-sdk` directory:

```bash
cd samples/client
pnpm install
pnpm dev
```

By default, the client fetches the discovery profile from `http://localhost:3000`. Use `--server_url` to point to your UCP merchant server:

```bash
pnpm dev -- --server_url=http://localhost:3001
```

### Options

- `--server_url=<url>` - Base URL of the UCP server (default: `http://localhost:3000`)

## Usage

The client imports from `ucp-rest-sdk/generated`:

- `createCheckout`, `getCheckout`, `updateCheckout`, `completeCheckout`, `cancelCheckout`
- Types: `Root`, `CreateCheckoutData`, `GetCheckoutData`, etc.

Start a merchant server (e.g. samples/express or samples/hono) before running the client.
