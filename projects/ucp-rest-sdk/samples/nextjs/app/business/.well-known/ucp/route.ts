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
