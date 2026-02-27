#!/usr/bin/env node
/**
 * Post-process: Replace types.gen.ts with minimal re-exports from zod.gen.
 * Removes the bulky types.gen and unifies to zod.gen.ts.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const generatedDir = join(process.cwd(), 'src/generated');
const typesPath = join(generatedDir, 'types.gen.ts');

const content = `// Re-exports from zod.gen - replaces generated types.gen.ts

import type {
  Root,
  OrderRoot,
  CreateCheckoutData as CreateCheckoutDataBase,
  GetCheckoutData as GetCheckoutDataBase,
  UpdateCheckoutData as UpdateCheckoutDataBase,
  CompleteCheckoutData as CompleteCheckoutDataBase,
  CancelCheckoutData as CancelCheckoutDataBase,
} from './zod.gen';

export * from './zod.gen';

export type ClientOptions = {
  baseUrl: \`\${string}://{endpoint}\` | (string & {});
};

export type CreateCheckoutData = CreateCheckoutDataBase & { url: '/checkout-sessions' };
export type GetCheckoutData = GetCheckoutDataBase & { url: '/checkout-sessions/{id}' };
export type UpdateCheckoutData = UpdateCheckoutDataBase & { url: '/checkout-sessions/{id}' };
export type CompleteCheckoutData = CompleteCheckoutDataBase & { url: '/checkout-sessions/{id}/complete' };
export type CancelCheckoutData = CancelCheckoutDataBase & { url: '/checkout-sessions/{id}/cancel' };

export type CreateCheckoutResponses = { 201: Root };
export type CreateCheckoutResponse = CreateCheckoutResponses[keyof CreateCheckoutResponses];

export type GetCheckoutResponses = { 200: Root };
export type GetCheckoutResponse = GetCheckoutResponses[keyof GetCheckoutResponses];

export type UpdateCheckoutResponses = { 200: Root };
export type UpdateCheckoutResponse = UpdateCheckoutResponses[keyof UpdateCheckoutResponses];

export type CompleteCheckoutResponses = { 200: Root };
export type CompleteCheckoutResponse = CompleteCheckoutResponses[keyof CompleteCheckoutResponses];

export type CancelCheckoutResponses = { 200: Root };
export type CancelCheckoutResponse = CancelCheckoutResponses[keyof CancelCheckoutResponses];

export type OrderEventWebhookWebhookPayload = OrderRoot & { event_id: string; created_time: string };
export type OrderEventWebhookWebhookRequest = {
  body: OrderEventWebhookWebhookPayload;
  key: 'orderEvent';
  path?: never;
  query?: never;
};

export type Webhooks = OrderEventWebhookWebhookRequest;
`;

writeFileSync(typesPath, content);
