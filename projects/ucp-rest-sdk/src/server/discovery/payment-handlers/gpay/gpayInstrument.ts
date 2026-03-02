/**
 * TypeScript types for the Google Pay card payment instrument.
 * Based on https://pay.google.com/gp/p/ucp/2026-01-11/schemas/card_payment_instrument.json
 * Extends UCP Card Payment Instrument with Google Pay tokenization data.
 */

/** Postal address for billing (from payment_instrument_base) */
export interface GpayPostalAddress {
  street_address?: string;
  extended_address?: string;
  address_locality?: string;
  address_region?: string;
  address_country?: string;
  postal_code?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone_number?: string;
}

/** Tokenization data for the selected payment method (credential payload) */
export interface GpayTokenizationData {
  /** The type of tokenization. Matches tokenization_specification.type (e.g. DIRECT, PAYMENT_GATEWAY) */
  type: string;
  /** The generated payment method token */
  token: string;
}

/**
 * Google Pay card payment instrument.
 * Extends the base Card Payment Instrument with Google Pay tokenized credential.
 */
export interface GpayCardPaymentInstrument {
  /** Unique identifier for this instrument instance, assigned by the platform */
  id: string;
  /** Identifier for the handler instance that produced this instrument */
  handler_id: string;
  /** Constant: card */
  type: 'card';
  /** The billing address associated with this payment method */
  billing_address?: GpayPostalAddress;
  /** The card brand/network (e.g., visa, mastercard, amex) */
  brand: string;
  /** Last 4 digits of the card number */
  last_digits: string;
  /** The month of the card's expiration date (1-12) */
  expiry_month?: number;
  /** The year of the card's expiration date */
  expiry_year?: number;
  /** Optional rich text description of the card */
  rich_text_description?: string;
  /** Optional URI to a rich image representing the card */
  rich_card_art?: string;
  /** Google Pay tokenization data (replaces base credential) */
  credential?: GpayTokenizationData;
}
