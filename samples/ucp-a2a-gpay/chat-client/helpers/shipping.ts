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

export const SHIPPING_OPTIONS = {
  standard: {id: 'shipping-standard', label: 'Standard', description: 'Delivered in 5-7 business days.'},
  express: {id: 'shipping-express', label: 'Express', description: 'Delivered in 1-2 business days.'},
} as const;

export const DEFAULT_SHIPPING_OPTION_ID = SHIPPING_OPTIONS.standard.id;

/** Shipping cost by country: US $5/$10, Canada $7/$12 (standard/express). */
export const SHIPPING_COST_BY_COUNTRY: Record<string, {standard: number; express: number}> = {
  US: {standard: 5, express: 10},
  CA: {standard: 7, express: 12},
};

export const DEFAULT_COUNTRY = 'US';

export const getShippingCost = (optionId: string, countryCode: string): number => {
  const costs = SHIPPING_COST_BY_COUNTRY[countryCode] ?? SHIPPING_COST_BY_COUNTRY[DEFAULT_COUNTRY];
  const isStandard = optionId === SHIPPING_OPTIONS.standard.id;
  return isStandard ? costs.standard : costs.express;
};
