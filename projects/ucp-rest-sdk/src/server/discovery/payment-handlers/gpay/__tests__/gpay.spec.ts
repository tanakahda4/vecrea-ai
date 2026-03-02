import { describe, expect, it } from 'vitest';
import { buildGpayPaymentHandler } from '../gpay';

describe('buildGpayPaymentHandler', () => {
  it('returns handler when called with no arguments', () => {
    const result = buildGpayPaymentHandler();

    expect(result).toMatchObject({
      id: 'gpay-stripe',
      name: 'com.google.pay',
      version: '2026-01-23',
      spec: 'https://pay.google.com/gp/p/ucp/2026-01-11/',
      config_schema:
        'https://pay.google.com/gp/p/ucp/2026-01-11/schemas/config.json',
      instrument_schemas: [
        'https://pay.google.com/gp/p/ucp/2026-01-11/schemas/card_payment_instrument.json',
      ],
    });
  });

  it('uses default config when called with no arguments', () => {
    const result = buildGpayPaymentHandler();

    expect(result.config).toEqual({
      api_version: 2,
      api_version_minor: 0,
      environment: 'TEST',
      merchant_info: {
        merchant_id: 'TEST',
        merchant_name: 'Test Merchant',
      },
      allowed_payment_methods: [
        {
          type: 'CARD',
          parameters: {
            allowed_auth_methods: ['PAN_ONLY'],
            allowed_card_networks: ['VISA', 'MASTERCARD'],
          },
          tokenization_specification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'stripe',
              'stripe:version': '2018-10-31',
              'stripe:publishableKey': 'YOUR_PUBLISHABLE_KEY',
            },
          },
        },
      ],
    });
  });

  it('uses custom id when provided', () => {
    const result = buildGpayPaymentHandler({ id: 'gpay-custom' });

    expect(result.id).toBe('gpay-custom');
  });

  it('uses custom version when provided', () => {
    const result = buildGpayPaymentHandler({ version: '2026-01-11' });

    expect(result.version).toBe('2026-01-11');
  });

  it('uses custom environment when provided', () => {
    const result = buildGpayPaymentHandler({ environment: 'PRODUCTION' });

    expect(result.config?.environment).toBe('PRODUCTION');
  });

  it('uses custom merchantInfo when provided', () => {
    const result = buildGpayPaymentHandler({
      merchantInfo: {
        merchant_id: '01234567890123456789',
        merchant_name: 'Example Merchant',
        merchant_origin: 'checkout.merchant.com',
      },
    });

    expect(result.config?.merchant_info).toEqual({
      merchant_id: '01234567890123456789',
      merchant_name: 'Example Merchant',
      merchant_origin: 'checkout.merchant.com',
    });
  });

  it('uses custom allowedAuthMethods when provided', () => {
    const result = buildGpayPaymentHandler({
      allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
    });

    expect(
      result.config?.allowed_payment_methods?.[0]?.parameters
        ?.allowed_auth_methods,
    ).toEqual(['PAN_ONLY', 'CRYPTOGRAM_3DS']);
  });

  it('uses custom allowedCardNetworks when provided', () => {
    const result = buildGpayPaymentHandler({
      allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX'],
    });

    expect(
      result.config?.allowed_payment_methods?.[0]?.parameters
        ?.allowed_card_networks,
    ).toEqual(['VISA', 'MASTERCARD', 'AMEX']);
  });

  it('uses custom tokenizationParameters when provided', () => {
    const result = buildGpayPaymentHandler({
      tokenizationParameters: {
        gateway: 'example',
        gatewayMerchantId: 'exampleGatewayMerchantId',
      },
    });

    expect(
      result.config?.allowed_payment_methods?.[0]?.tokenization_specification
        ?.parameters,
    ).toEqual({
      gateway: 'example',
      gatewayMerchantId: 'exampleGatewayMerchantId',
    });
  });

  it('uses Stripe gateway params when tokenizationParameters has publishableKey', () => {
    const result = buildGpayPaymentHandler({
      tokenizationParameters: {
        gateway: 'stripe',
        'stripe:version': '2018-10-31',
        'stripe:publishableKey': 'pk_test_xxx',
      },
    });

    expect(
      result.config?.allowed_payment_methods?.[0]?.tokenization_specification
        ?.parameters,
    ).toEqual({
      gateway: 'stripe',
      'stripe:version': '2018-10-31',
      'stripe:publishableKey': 'pk_test_xxx',
    });
  });
});
