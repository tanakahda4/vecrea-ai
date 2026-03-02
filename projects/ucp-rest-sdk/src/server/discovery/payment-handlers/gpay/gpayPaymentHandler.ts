import type { GpayConfig } from './gpayConfig';

/**
 * Google Pay Payment Handler entity definition for UCP discovery/config.
 */
export interface GpayPaymentHandler {
  /** Unique identifier for this handler instance */
  id: string;
  /** Optional human-friendly handler name */
  name?: string;
  /** Version of the payment handler in YYYY-MM-DD format */
  version: string;
  /** URL to discovery spec describing this handler */
  spec: string;
  /** URL to the config schema for validating handler config */
  config_schema: string;
  /** URLs to instrument schema(s) for supported payment instruments */
  instrument_schemas: string[];
  /** Fully expanded and resolved configuration for the payment handler */
  config: GpayConfig;
}
