import { zUcpDiscoveryProfile, type UcpDiscoveryProfile } from 'ucp-rest-sdk/common';

export const runDiscovery = async (serverUrl: string): Promise<UcpDiscoveryProfile> => {
  console.log('UCP Client - fetching discovery...');

  let discoveryRes: Response;
  try {
    discoveryRes = await fetch(`${serverUrl}/.well-known/ucp`);
  } catch (err) {
    console.error('Discovery failed: no server at', serverUrl);
    console.error('Start a merchant server first (e.g. samples/express or samples/hono)');
    process.exit(1);
  }
  if (!discoveryRes.ok) {
    console.error('Discovery failed:', discoveryRes.status, await discoveryRes.text());
    process.exit(1);
  }

  const raw = await discoveryRes.json();
  const parseResult = zUcpDiscoveryProfile.safeParse(raw);
  if (!parseResult.success) {
    console.error('Discovery failed: invalid profile', parseResult.error.format());
    process.exit(1);
  }
  const discovery = parseResult.data;
  console.log('Discovery OK. UCP version:', discovery.ucp.version);
  console.log('\nDiscovery profile:\n', JSON.stringify(discovery, null, 2));
  return discovery;
};
