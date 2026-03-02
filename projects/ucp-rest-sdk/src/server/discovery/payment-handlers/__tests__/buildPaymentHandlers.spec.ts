import { describe, expect, it } from 'vitest';
import { buildPaymentHandlers } from '../buildPaymentHandlers';

describe('buildPaymentHandlers', () => {
  it('returns object with com.google.pay when called with no arguments', () => {
    const result = buildPaymentHandlers();

    expect(result).toHaveProperty('com.google.pay');
    expect(result['com.google.pay']).toHaveLength(1);
  });

  it('returns object with com.google.pay when called with empty object', () => {
    const result = buildPaymentHandlers({});

    expect(result).toHaveProperty('com.google.pay');
    expect(result['com.google.pay']).toHaveLength(1);
  });

  it('returns default Google Pay handler when gpay is not provided', () => {
    const result = buildPaymentHandlers();

    expect(result['com.google.pay'][0]).toMatchObject({
      id: 'gpay-stripe',
      name: 'com.google.pay',
      version: '2026-01-23',
    });
  });

  it('passes gpay params to handler when provided', () => {
    const result = buildPaymentHandlers({
      gpay: {
        id: 'gpay-custom',
        version: '2026-01-11',
        environment: 'PRODUCTION',
      },
    });

    expect(result['com.google.pay'][0].id).toBe('gpay-custom');
    expect(result['com.google.pay'][0].version).toBe('2026-01-11');
    expect(result['com.google.pay'][0].config?.environment).toBe('PRODUCTION');
  });

  it('passes merchantInfo to handler when provided', () => {
    const result = buildPaymentHandlers({
      gpay: {
        merchantInfo: {
          merchant_id: '01234567890123456789',
          merchant_name: 'Example Merchant',
          merchant_origin: 'checkout.example.com',
        },
      },
    });

    expect(result['com.google.pay'][0].config?.merchant_info).toEqual({
      merchant_id: '01234567890123456789',
      merchant_name: 'Example Merchant',
      merchant_origin: 'checkout.example.com',
    });
  });

  it('passes tokenizationParameters to handler when provided', () => {
    const result = buildPaymentHandlers({
      gpay: {
        tokenizationParameters: {
          gateway: 'example',
          gatewayMerchantId: 'exampleId',
        },
      },
    });

    expect(
      result['com.google.pay'][0].config?.allowed_payment_methods?.[0]
        ?.tokenization_specification?.parameters,
    ).toEqual({
      gateway: 'example',
      gatewayMerchantId: 'exampleId',
    });
  });
});
