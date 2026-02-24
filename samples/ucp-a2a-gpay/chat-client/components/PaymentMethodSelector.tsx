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
import React from 'react';
import {Checkout, PaymentMethod} from '../types';
import GooglePayButton, {GooglePayPaymentData} from './GooglePayButton';

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  onSelect: (selectedMethod: string) => void;
  onGooglePayComplete?: (data: GooglePayPaymentData) => void;
  onGooglePayReady?: () => void;
  checkout?: Checkout | null;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onGooglePayComplete,
  onGooglePayReady,
  checkout,
}) => {
  const subtotalTotal = checkout?.totals?.find((t) => t.type === 'subtotal');
  const taxTotal = checkout?.totals?.find((t) => t.type === 'tax');
  const totalTotal = checkout?.totals?.find((t) => t.type === 'total');
  const subtotalAmount = subtotalTotal
    ? (subtotalTotal.amount / 100).toFixed(2)
    : totalTotal
      ? (totalTotal.amount / 100).toFixed(2)
      : '100';
  const taxAmount = taxTotal
    ? (taxTotal.amount / 100).toFixed(2)
    : (() => {
        if (subtotalTotal) {
          return (Math.round(subtotalTotal.amount * 0.1) / 100).toFixed(2);
        }
        if (totalTotal) {
          const estimatedSubtotalCents = totalTotal.amount / 1.1;
          return (Math.round(estimatedSubtotalCents * 0.1) / 100).toFixed(2);
        }
        return '10.00';
      })();
  const currencyCode = checkout?.currency ?? 'USD';

  if (!onGooglePayComplete) return null;

  return (
    <div className="max-w-md bg-white rounded-lg shadow-lg p-4 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-3">
        Select a Payment Method
      </h3>
      <GooglePayButton
        onToken={onGooglePayComplete}
        onReady={onGooglePayReady}
        totalAmount={subtotalAmount}
        taxAmount={taxAmount}
        currencyCode={currencyCode}
        countryCode="US"
      />
    </div>
  );
};

export default PaymentMethodSelector;
