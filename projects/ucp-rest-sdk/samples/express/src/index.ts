import express from 'express';
import { buildDiscoveryProfile } from 'ucp-rest-sdk/server';

const app = express();
const port = process.env.PORT ?? 3000;

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

app.get('/', (_req, res) => {
  res.send(
    '<p>UCP Express sample. Access <a href="/.well-known/ucp">/.well-known/ucp</a> for the UCP Discovery Profile.</p>',
  );
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`UCP Discovery Profile: http://localhost:${port}/.well-known/ucp`);
});
