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
import React, {useState} from 'react';

import {Checkout, PaymentInstrument} from '../types';

interface CheckoutProps {
  checkout: Checkout;
  onCheckout?: () => void;
  onCompletePayment?: (checkout: Checkout) => void;
  paymentInstrument?: PaymentInstrument | null;
  onConfirmPayment?: (paymentInstrument: PaymentInstrument) => void;
  showCartSummary?: boolean;
}

type AddressLike = Record<
  string,
  string | undefined
> & {
  street_address?: string;
  streetAddress?: string;
  address_locality?: string;
  addressLocality?: string;
  address_region?: string;
  addressRegion?: string;
  postal_code?: string;
  postalCode?: string;
  address_country?: string;
  addressCountry?: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
};

const getStr = (obj: AddressLike | undefined, ...keys: string[]): string =>
  keys.reduce<string | undefined>(
    (v, k) => v ?? (obj?.[k] as string | undefined),
    undefined as string | undefined,
  ) ?? '';

const getAddressFrom = (obj: AddressLike | undefined): string | null => {
  if (!obj) return null;
  const parts = [
    getStr(obj, 'street_address', 'streetAddress'),
    getStr(obj, 'address_locality', 'addressLocality'),
    getStr(obj, 'address_region', 'addressRegion'),
    getStr(obj, 'postal_code', 'postalCode'),
    getStr(obj, 'address_country', 'addressCountry'),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
};

const getNameFrom = (obj: AddressLike | undefined): string | null => {
  if (!obj) return null;
  const first = getStr(obj, 'first_name', 'firstName');
  const last = getStr(obj, 'last_name', 'lastName');
  const name = [first, last].filter(Boolean).join(' ');
  return name || null;
};

const findAddressInObj = (obj: unknown): AddressLike | undefined => {
  if (!obj || typeof obj !== 'object') return undefined;
  const o = obj as Record<string, unknown>;
  if (
    'street_address' in o ||
    'streetAddress' in o ||
    'address_locality' in o
  ) {
    return o as AddressLike;
  }
  if (o.root && typeof o.root === 'object') {
    return findAddressInObj(o.root);
  }
  if (Array.isArray(o.methods) && o.methods[0]) {
    const method = o.methods[0] as Record<string, unknown>;
    if (Array.isArray(method.destinations) && method.destinations[0]) {
      return findAddressInObj(method.destinations[0]);
    }
  }
  if (Array.isArray(o.destinations) && o.destinations[0]) {
    return findAddressInObj(o.destinations[0]);
  }
  return undefined;
};

const getCustomerDetailsDisplay = (checkout: Checkout): string | null => {
  const email =
    checkout.buyer?.email ?? checkout.buyer?.root?.email ?? null;

  const destAddress = findAddressInObj(checkout.fulfillment);
  const addressParts = getAddressFrom(destAddress);
  const name = getNameFrom(destAddress);

  if (email || addressParts) {
    const parts = [email, name, addressParts].filter(Boolean);
    return parts.join(', ');
  }
  return null;
};

const CheckoutComponent: React.FC<CheckoutProps> = ({
  checkout,
  onCheckout,
  onCompletePayment,
  paymentInstrument,
  onConfirmPayment,
  showCartSummary = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const itemsToShow = isExpanded
    ? checkout.line_items
    : checkout.line_items.slice(0, 5);

  const customerDetails = getCustomerDetailsDisplay(checkout);

  const formatCurrency = (amount: number, currency: string) => {
    const currencySymbol = currency === 'EUR' ? '€' : '$';
    return `${currencySymbol}${(amount / 100).toFixed(2)}`;
  };

  const getTotal = (type: string) => {
    return checkout.totals.find((t) => t.type === type);
  };

  const getItemTotal = (lineItem: any) => {
    return lineItem.totals.find((t) => t.type === 'total');
  };

  const grandTotal = getTotal('total');
  const isCompleted = checkout.status === 'completed';
  const orderId = checkout.order?.id ?? checkout.order_id;
  const paymentFromCheckout = checkout.payment?.instruments?.find(
    (inst: any) =>
      inst.root?.id === checkout.payment?.selected_instrument_id ||
      inst.id === checkout.payment?.selected_instrument_id,
  ) ?? checkout.payment?.instruments?.[0];
  const paymentDisplay =
    paymentInstrument ??
    (paymentFromCheckout && {
      brand: paymentFromCheckout.brand ?? paymentFromCheckout.root?.brand ?? 'Card',
      last_digits: paymentFromCheckout.last_digits ?? paymentFromCheckout.root?.last_digits ?? '****',
    });

  return (
    <div className="flex w-full my-2 justify-start">
      <div className="max-w-md bg-white rounded-lg shadow-lg p-4 border border-[#e0e0e0]">
        <h3 className="text-md font-bold text-[#333] border-b border-[#e0e0e0] pb-2 mb-3 flex items-center">
          {showCartSummary ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {isCompleted ? 'Order Confirmed' : 'Checkout Summary'}
            </>
          ) : (
            'Confirm Payment'
          )}
        </h3>
        {showCartSummary && orderId && (
          <p className="border-b border-[#e0e0e0] pt-3 pb-3 text-sm font-semibold text-[#333]">
            Order ID: {orderId}
          </p>
        )}
        {showCartSummary && customerDetails && (
          <div className="border-b border-[#e0e0e0] pt-3 pb-3 text-sm space-y-1">
            <p className="font-semibold text-[#333]">Customer details</p>
            <p className="text-[#666]">{customerDetails}</p>
          </div>
        )}
        {showCartSummary && (
          <>
            <div className="pt-3 space-y-3">
              {itemsToShow.map((lineItem: any) => (
                <div key={lineItem.id} className="flex items-center text-sm">
                  <img
                    src={lineItem.item.image_url}
                    alt={lineItem.item.id}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold text-[#333]">
                      {lineItem.item.title}
                    </p>
                    <p className="text-[#666]">Qty: {lineItem.quantity}</p>
                  </div>
                  <p className="text-[#333] font-medium pl-2">
                    {formatCurrency(
                      getItemTotal(lineItem).amount,
                      checkout.currency,
                    )}
                  </p>
                </div>
              ))}
            </div>
            {checkout.line_items.length > 5 && (
              <div className="mt-3">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-sm text-[#00a040] hover:underline w-full text-center">
                  {isExpanded
                    ? 'Show less'
                    : `Show ${checkout.line_items.length - 5} more items`}
                </button>
              </div>
            )}
          </>
        )}
        {showCartSummary && (
          <>
            <div className="border-t border-[#e0e0e0] mt-4 pt-3 text-sm space-y-2">
              {checkout.totals
                .filter((t) => t.type !== 'total' && t.amount > 0)
                .map((total) => (
                  <div
                    key={total.type}
                    className="flex justify-between items-center">
                    <span className="text-[#666]">{total.display_text}</span>
                    <span className="text-[#333] font-medium">
                      {formatCurrency(total.amount, checkout.currency)}
                    </span>
                  </div>
                ))}
            </div>
            {grandTotal && (
              <div className="border-t border-[#e0e0e0] mt-4 pt-3">
                <div className="flex justify-between items-center font-bold text-md">
                  <span>{grandTotal.display_text}</span>
                  <span>
                    {formatCurrency(grandTotal.amount, checkout.currency)}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
        {paymentDisplay && (
            <div className="border-t border-[#e0e0e0] mt-4 pt-3 pb-3 text-sm">
            <p className="font-semibold text-[#333] mb-1">
              Payment method
            </p>
            <p className="text-[#666]">
              {String(paymentDisplay.brand ?? 'Card').toUpperCase()} ending in{' '}
              {paymentDisplay.last_digits ?? '****'}
            </p>
          </div>
        )}
        {showCartSummary && (
            <p className="text-xs text-[#999] mt-3 text-center">
            Checkout ID: {checkout.id}
          </p>
        )}
        {checkout.status !== 'completed' && (
          <div className="border-t border-[#e0e0e0] mt-4 pt-4 space-y-3">
            {onCheckout && !paymentInstrument && (
              <button
                onClick={onCheckout}
                className="w-full bg-[#00a040] hover:bg-[#006633] text-white font-bold py-2 px-4 rounded text-sm">
                Start payment
              </button>
            )}
            {onCompletePayment && !paymentInstrument && (
              <button
                onClick={() => onCompletePayment && onCompletePayment(checkout)}
                className="w-full bg-[#00a040] hover:bg-[#006633] text-white font-bold py-2 px-4 rounded text-sm">
                Complete Payment
              </button>
            )}
            {paymentInstrument && onConfirmPayment && (
              <button
                onClick={() => {
                  if (isConfirming) return;
                  setIsConfirming(true);
                  onConfirmPayment(paymentInstrument);
                }}
                disabled={isConfirming}
                className="w-full bg-[#00a040] hover:bg-[#006633] text-white font-bold py-2 px-4 rounded text-sm disabled:bg-[#7DBB7C] disabled:cursor-wait">
                {isConfirming ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Confirm Purchase'
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutComponent;
