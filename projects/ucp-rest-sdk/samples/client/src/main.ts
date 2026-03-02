import { createCheckout, getCheckout } from 'ucp-rest-sdk/generated';
import { parseArgs } from './helpers/parseArgs.js';
import { runDiscovery } from './steps/discovery.js';

const main = async () => {
  const { serverUrl } = parseArgs();
  await runDiscovery(serverUrl);
};

main().catch(console.error);
