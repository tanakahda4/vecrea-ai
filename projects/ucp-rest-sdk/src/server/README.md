# UCP REST SDK - Server

Server-side utilities for UCP (Universal Commerce Protocol).

## `/.well-known/ucp` Endpoint

The UCP discovery profile is served at `/.well-known/ucp`. AI agents fetch this JSON to discover a merchant's capabilities, services, and payment handlers.

### Express

```typescript
import express from 'express';
import { buildDiscoveryProfile } from 'ucp-rest-sdk/server';

const app = express();

app.get('/.well-known/ucp', (_req, res) => {
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

  res.set({
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=3600',
  });
  res.json(profile);
});
```

### Hono

```typescript
import { Hono } from 'hono';
import { buildDiscoveryProfile } from 'ucp-rest-sdk/server';

const app = new Hono();

app.get('/.well-known/ucp', (c) => {
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

  return c.json(profile, 200, {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=3600',
  });
});
```

### Next.js App Router

Create `app/business/.well-known/ucp/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { buildDiscoveryProfile } from 'ucp-rest-sdk/server';

export const dynamic = 'force-static';
export const revalidate = 3600;

export const GET = () => {
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

  return NextResponse.json(profile, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
```

For dynamic config (e.g. `process.env`), omit `force-static` and `revalidate`.

### Notes

- Serve over **HTTPS** only (in production)
- Set `Content-Type: application/json`
- Consider `Cache-Control` (e.g. `max-age=3600`) since the profile changes infrequently
- Configure CORS if agents fetch from different origins
