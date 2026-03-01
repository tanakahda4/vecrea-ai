import type {
  GpayEnvironment,
  GpayMerchantInfo,
  GpayAllowedAuthMethods,
  GpayAllowedCardNetworks,
} from './gpayConfigSchema';

export interface BuildGpayPaymentHandlerParams {
  id?: string;
  version?: number;
  consfig?: {
    environment?: GpayEnvironment;
    merchantInfo?: GpayMerchantInfo;
    allowedPaymentMethods?: {
      type?: 'CARD';
      parameters?: {
        allowedAuthMethods?: GpayAllowedAuthMethods[];
        allowedCardNetworks?: GpayAllowedCardNetworks[];
      };
      tokenizationSpecification?: {
        type?: 'PAYMENT_GATEWAY';
        parameters?: {
          gateway?: 'stripe';
          'stripe:version'?: '2018-10-31';
          'stripe:publishableKey'?: string;
        };
      };
    }[];
  };
}
