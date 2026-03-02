import { buildGpayStripeGateway } from './gateways';
import type {
  GpayEnvironment,
  GpayMerchantInfo,
  GpayAllowedAuthMethods,
  GpayAllowedCardNetworks,
  GpayTokenizationParameters,
} from './gpayConfig';
import type { GpayPaymentHandler } from './gpayPaymentHandler';

/** Parameters for building a Google Pay payment handler declaration */
export interface BuildGpayPaymentHandlerParams {
  /** Handler instance ID (unique within the business discovery profile) */
  id?: string;
  /** Handler version in YYYY-MM-DD format */
  version?: string;
  /** Google Pay environment (TEST or PRODUCTION) */
  environment?: GpayEnvironment;
  /** Merchant identity for the payment sheet */
  merchantInfo?: GpayMerchantInfo;
  /** Allowed authentication methods for CARD payments */
  allowedAuthMethods?: GpayAllowedAuthMethods[];
  /** Allowed card networks for CARD payments */
  allowedCardNetworks?: GpayAllowedCardNetworks[];
  /** Tokenization gateway parameters (e.g. from buildGpayStripeGateway) */
  tokenizationParameters?: GpayTokenizationParameters;
}

/**
 * Builds a Google Pay payment handler declaration for UCP discovery profiles.
 *
 * @returns A single handler object. Wrap in array for payment_handlers["com.google.pay"].
 */
export const buildGpayPaymentHandler = (
  params: BuildGpayPaymentHandlerParams = {},
): GpayPaymentHandler => {
  const {
    id,
    version,
    environment,
    merchantInfo,
    allowedAuthMethods,
    allowedCardNetworks,
    tokenizationParameters,
  } = params;

  return {
    id: id || 'gpay-stripe',
    name: 'com.google.pay',
    version: version || '2026-01-23',
    spec: 'https://pay.google.com/gp/p/ucp/2026-01-11/',
    config_schema:
      'https://pay.google.com/gp/p/ucp/2026-01-11/schemas/config.json',
    instrument_schemas: [
      'https://pay.google.com/gp/p/ucp/2026-01-11/schemas/card_payment_instrument.json',
    ],
    config: {
      api_version: 2,
      api_version_minor: 0,
      environment: environment || 'TEST',
      merchant_info: merchantInfo || {
        merchant_id: 'TEST',
        merchant_name: 'Test Merchant',
      },
      allowed_payment_methods: [
        {
          type: 'CARD',
          parameters: {
            allowed_auth_methods: allowedAuthMethods || ['PAN_ONLY'],
            allowed_card_networks: allowedCardNetworks || [
              'VISA',
              'MASTERCARD',
            ],
          },
          tokenization_specification: {
            type: 'PAYMENT_GATEWAY',
            parameters: tokenizationParameters || buildGpayStripeGateway(),
          },
        },
      ],
    },
  };
}
