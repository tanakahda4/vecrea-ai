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

import {
  DEFAULT_COUNTRY,
  DEFAULT_SHIPPING_OPTION_ID,
  getShippingCost,
  SHIPPING_OPTIONS,
  SHIPPING_COST_BY_COUNTRY,
} from './shipping';

export const merchantInfo = {
  merchantId: '12345678901234567890',
  merchantName: 'Example Merchant',
};

export const getShippingOptionParameters = (
  countryCode: string,
): google.payments.api.ShippingOptionParameters => {
  const costs = SHIPPING_COST_BY_COUNTRY[countryCode] ?? SHIPPING_COST_BY_COUNTRY[DEFAULT_COUNTRY];
  return {
    defaultSelectedOptionId: DEFAULT_SHIPPING_OPTION_ID,
    shippingOptions: [
      {
        id: SHIPPING_OPTIONS.standard.id,
        label: `$${costs.standard.toFixed(2)}: ${SHIPPING_OPTIONS.standard.label} shipping`,
        description: SHIPPING_OPTIONS.standard.description,
      },
      {
        id: SHIPPING_OPTIONS.express.id,
        label: `$${costs.express.toFixed(2)}: ${SHIPPING_OPTIONS.express.label} shipping`,
        description: SHIPPING_OPTIONS.express.description,
      },
    ],
  };
};

export const baseGooglePayRequest = {
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

export const getTransactionInfo = (
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

export interface PaymentDataChangedParams {
  subtotal: number;
  tax: number;
  currencyCode: string;
  countryCode: string;
}

export const createPaymentDataChangedHandler = (
  params: PaymentDataChangedParams,
) => {
  const {subtotal, tax, currencyCode, countryCode} = params;
  let lastKnownCountry: string | null = null;

  return (
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
      const addrCountry = shippingAddress?.countryCode;
      if (addrCountry) {
        lastKnownCountry = addrCountry;
        if (callbackTrigger === 'INITIALIZE') {
          console.log('[GooglePay] INITIALIZE: address received', {
            countryCode: addrCountry,
            shippingCost: getShippingCost(DEFAULT_SHIPPING_OPTION_ID, addrCountry),
          });
        }
      } else if (callbackTrigger === 'INITIALIZE') {
        console.log('[GooglePay] INITIALIZE: no address (user has not selected yet)');
      }
      if (shippingAddress || callbackTrigger === 'INITIALIZE') {
        const shippingCost = lastKnownCountry
          ? getShippingCost(DEFAULT_SHIPPING_OPTION_ID, lastKnownCountry)
          : 0;
        if (lastKnownCountry) {
          paymentDataRequestUpdate.newShippingOptionParameters =
            getShippingOptionParameters(lastKnownCountry);
        }
        paymentDataRequestUpdate.newTransactionInfo = getTransactionInfo(
          subtotal,
          tax,
          shippingCost,
          currencyCode,
          lastKnownCountry ?? DEFAULT_COUNTRY,
        );
      }
    } else if (callbackTrigger === 'SHIPPING_OPTION' && shippingOptionData) {
      const shippingCost = lastKnownCountry
        ? getShippingCost(shippingOptionData.id, lastKnownCountry)
        : 0;
      paymentDataRequestUpdate.newTransactionInfo = getTransactionInfo(
        subtotal,
        tax,
        shippingCost,
        currencyCode,
        lastKnownCountry ?? DEFAULT_COUNTRY,
      );
    }

    return paymentDataRequestUpdate;
  };
};

export const onPaymentAuthorized = (
  _paymentData: google.payments.api.PaymentData,
): google.payments.api.PaymentAuthorizationResult => ({
  transactionState: 'SUCCESS',
});

export const parsePaymentResponse = (
  res: google.payments.api.PaymentData,
): GooglePayPaymentData | null => {
  const token = res.paymentMethodData?.tokenizationData?.token ?? '';
  if (!token) return null;

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
  const addressCountry = res.shippingAddress?.countryCode ?? DEFAULT_COUNTRY;
  const shippingCost = shippingOptionId
    ? getShippingCost(shippingOptionId, addressCountry)
    : undefined;

  return {
    token,
    last_digits: info?.cardDetails,
    brand: info?.cardNetwork?.toLowerCase(),
    email: res.email,
    shippingAddress,
    shippingOptionId,
    shippingCost,
  };
};
