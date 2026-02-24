/*
 * Copyright 2026 UCP Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/// <reference types="googlepay" />

import React, {useEffect, useRef, useState} from 'react';

const merchantInfo = {
  merchantId: '12345678901234567890',
  merchantName: 'Example Merchant',
};

const SHIPPING_OPTIONS = {
  standard: {id: 'shipping-standard', cost: 5.0, label: 'Standard', description: 'Delivered in 5-7 business days.'},
  express: {id: 'shipping-express', cost: 10.0, label: 'Express', description: 'Delivered in 1-2 business days.'},
} as const;

const DEFAULT_SHIPPING_OPTION_ID = SHIPPING_OPTIONS.standard.id;

const getShippingCost = (optionId: string): number => {
  const option = Object.values(SHIPPING_OPTIONS).find((o) => o.id === optionId);
  return option?.cost ?? SHIPPING_OPTIONS.standard.cost;
};

const baseGooglePayRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: [
    {
      type: 'CARD' as const,
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: [
          'AMEX',
          'DISCOVER',
          'INTERAC',
          'JCB',
          'MASTERCARD',
          'VISA',
        ],
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY' as const,
        parameters: {
          gateway: 'stripe',
          'stripe:version': '2018-10-31',
          'stripe:publishableKey':
            'pk_test_51SwuqqLhRrbfZ6adrxNQ6xgZgphJGmf0hlEiiTYbn9V1cnbi7q8yS49NaBvjz6F9uM8ItOfvEurtq211Pzgh3k7V00l2rh6dHB',
        },
      },
    },
  ],
  merchantInfo,
};

const getTransactionInfo = (
  subtotal: number,
  taxAmount: number,
  shippingCost: number,
  currencyCode: string,
  countryCode: string,
): google.payments.api.TransactionInfo => {
  const total = subtotal + taxAmount + shippingCost;
  const displayItems: google.payments.api.DisplayItem[] = [
    {label: 'Subtotal', type: 'SUBTOTAL' as const, price: subtotal.toFixed(2)},
  ];
  if (taxAmount > 0) {
    displayItems.push({
      label: 'Tax',
      type: 'TAX' as const,
      price: taxAmount.toFixed(2),
    });
  }
  if (shippingCost > 0) {
    displayItems.push({
      label: 'Shipping',
      type: 'SHIPPING_OPTION' as const,
      price: shippingCost.toFixed(2),
    });
  }
  return {
    countryCode,
    currencyCode,
    totalPriceStatus: 'FINAL' as const,
    totalPrice: total.toFixed(2),
    totalPriceLabel: 'Total',
    checkoutOption: 'CONTINUE_TO_REVIEW' as const,
    displayItems,
  };
};

const getShippingOptionParameters = (): google.payments.api.ShippingOptionParameters => ({
  defaultSelectedOptionId: DEFAULT_SHIPPING_OPTION_ID,
  shippingOptions: [
    {
      id: SHIPPING_OPTIONS.standard.id,
      label: `$${SHIPPING_OPTIONS.standard.cost.toFixed(2)}: ${SHIPPING_OPTIONS.standard.label} shipping`,
      description: SHIPPING_OPTIONS.standard.description,
    },
    {
      id: SHIPPING_OPTIONS.express.id,
      label: `$${SHIPPING_OPTIONS.express.cost.toFixed(2)}: ${SHIPPING_OPTIONS.express.label} shipping`,
      description: SHIPPING_OPTIONS.express.description,
    },
  ],
});

export interface GooglePayAddress {
  name?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  locality?: string;
  administrativeArea?: string;
  postalCode?: string;
  countryCode?: string;
}

export interface GooglePayPaymentData {
  token: string;
  last_digits?: string;
  brand?: string;
  email?: string;
  shippingAddress?: GooglePayAddress;
  shippingOptionId?: string;
  shippingCost?: number;
}

interface GooglePayButtonProps {
  onToken: (data: GooglePayPaymentData) => void;
  onError?: (error: Error) => void;
  onReady?: () => void;
  totalAmount?: string;
  taxAmount?: string;
  currencyCode?: string;
  countryCode?: string;
}

const GooglePayButton: React.FC<GooglePayButtonProps> = ({
  onToken,
  onError,
  onReady,
  totalAmount = '100',
  taxAmount = '0',
  currencyCode = 'USD',
  countryCode = 'US',
}) => {
  const [isReady, setIsReady] = useState(false);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    const init = () => {
      if (typeof google === 'undefined' || !google.payments?.api?.PaymentsClient) {
        return;
      }

      const client = new google.payments.api.PaymentsClient({
        environment: 'TEST',
        merchantInfo,
      });

      const req = {
        ...baseGooglePayRequest,
      } as unknown as google.payments.api.IsReadyToPayRequest;

      client
        .isReadyToPay(req)
        .then((res) => {
          const ready = !!res.result;
          setIsReady(ready);
          if (ready) onReady?.();
        })
        .catch((err) => {
          onError?.(err as Error);
        });
    };

    if (typeof google !== 'undefined' && google.payments?.api?.PaymentsClient) {
      init();
    } else {
      const checkInterval = setInterval(() => {
        if (typeof google !== 'undefined' && google.payments?.api?.PaymentsClient) {
          clearInterval(checkInterval);
          init();
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, [onError]);

  const handleClick = async () => {
    if (!isReady || isLoadingRef.current || typeof google === 'undefined')
      return;
    isLoadingRef.current = true;

    const subtotal = parseFloat(totalAmount) || 0;
    const tax =
      parseFloat(taxAmount) ||
      (subtotal > 0 ? Math.round(subtotal * 100 * 0.1) / 100 : 0);

    const onPaymentDataChanged = (
      intermediatePaymentData: google.payments.api.IntermediatePaymentData,
    ): google.payments.api.PaymentDataRequestUpdate => {
      const {callbackTrigger, shippingAddress, shippingOptionData} =
        intermediatePaymentData;
      const paymentDataRequestUpdate: google.payments.api.PaymentDataRequestUpdate =
        {};

      if (
        callbackTrigger === 'INITIALIZE' ||
        callbackTrigger === 'SHIPPING_ADDRESS'
      ) {
        if (shippingAddress) {
          paymentDataRequestUpdate.newShippingOptionParameters =
            getShippingOptionParameters();
          const shippingCost = getShippingCost(DEFAULT_SHIPPING_OPTION_ID);
          paymentDataRequestUpdate.newTransactionInfo = getTransactionInfo(
            subtotal,
            tax,
            shippingCost,
            currencyCode,
            countryCode,
          );
        }
      } else if (callbackTrigger === 'SHIPPING_OPTION' && shippingOptionData) {
        const shippingCost = getShippingCost(shippingOptionData.id);
        paymentDataRequestUpdate.newTransactionInfo = getTransactionInfo(
          subtotal,
          tax,
          shippingCost,
          currencyCode,
          countryCode,
        );
      }

      return paymentDataRequestUpdate;
    };

    const onPaymentAuthorized = (
      _paymentData: google.payments.api.PaymentData,
    ): google.payments.api.PaymentAuthorizationResult => ({
      transactionState: 'SUCCESS',
    });

    try {
      const client = new google.payments.api.PaymentsClient({
        environment: 'TEST',
        merchantInfo,
        paymentDataCallbacks: {
          onPaymentDataChanged,
          onPaymentAuthorized,
        },
      });

      const req = {
        ...baseGooglePayRequest,
        transactionInfo: getTransactionInfo(
          subtotal,
          tax,
          0,
          currencyCode,
          countryCode,
        ),
        callbackIntents: [
          'SHIPPING_ADDRESS',
          'SHIPPING_OPTION',
          'PAYMENT_AUTHORIZATION',
        ],
        emailRequired: true,
        shippingAddressRequired: true,
        shippingAddressParameters: {
          allowedCountryCodes: [countryCode],
        },
        shippingOptionRequired: true,
      } as unknown as google.payments.api.PaymentDataRequest;

      const res = await client.loadPaymentData(req);
      const token = res.paymentMethodData?.tokenizationData?.token ?? '';
      const info = res.paymentMethodData?.info;
      const shippingAddress = res.shippingAddress
        ? {
            name: res.shippingAddress.name,
            address1: res.shippingAddress.address1,
            address2: res.shippingAddress.address2,
            address3: res.shippingAddress.address3,
            locality: res.shippingAddress.locality,
            administrativeArea: res.shippingAddress.administrativeArea,
            postalCode: res.shippingAddress.postalCode,
            countryCode: res.shippingAddress.countryCode,
          }
        : undefined;
      const shippingOptionId = res.shippingOptionData?.id;
      const shippingCost = shippingOptionId
        ? getShippingCost(shippingOptionId)
        : undefined;

      if (token) {
        onToken({
          token,
          last_digits: info?.cardDetails,
          brand: info?.cardNetwork?.toLowerCase(),
          email: res.email,
          shippingAddress,
          shippingOptionId,
          shippingCost,
        });
      }
    } catch (err) {
      onError?.(err as Error);
    } finally {
      isLoadingRef.current = false;
    }
  };

  if (!isReady) {
    return <div className="h-12 w-full" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="gpay-custom-button flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-black px-4 py-3 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      <span>Pay with Google Pay</span>
    </button>
  );
};

export default GooglePayButton;
