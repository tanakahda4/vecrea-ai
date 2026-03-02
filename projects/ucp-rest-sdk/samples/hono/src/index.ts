import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { buildDiscoveryProfile } from 'ucp-rest-sdk/server';

const app = new Hono();
const port = Number(process.env.PORT ?? 3000);

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

app.get('/', (c) => {
  return c.html(
    '<p>UCP Hono sample. Access <a href="/.well-known/ucp">/.well-known/ucp</a> for the UCP Discovery Profile.</p>',
  );
});

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`);
  console.log(`UCP Discovery Profile: http://localhost:${info.port}/.well-known/ucp`);
});
