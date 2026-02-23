import { signEvmTypedData } from "@coinbase/cdp-core";
import { getTypesForEIP712Domain } from "viem";
import type { Address } from "viem";
import type { PublicClient } from "viem";

/**
 * Recursively converts BigInt values to string for JSON serialization (CDP API).
 */
const toJsonSerializable = (value: unknown): unknown => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map(toJsonSerializable);
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = toJsonSerializable(v);
    }
    return out;
  }
  return value;
};

/**
 * Creates an x402-compatible signer that uses signEvmTypedData from CDP.
 * Converts BigInt to string in typed data before calling the API (fixes JSON serialization).
 */
export const createCdpEvmSigner = (
  address: Address,
  publicClient: PublicClient
) => ({
  address,
  signTypedData: async (typedData: {
    domain: Record<string, unknown>;
    types: Record<string, unknown>;
    primaryType: string;
    message: Record<string, unknown>;
  }) => {
    const messageForApi = toJsonSerializable(typedData.message) as Record<
      string,
      unknown
    >;
    const typesWithDomain = {
      EIP712Domain: getTypesForEIP712Domain({ domain: typedData.domain }),
      ...typedData.types,
    };
    const result = await signEvmTypedData({
      evmAccount: address,
      typedData: {
        domain: typedData.domain,
        types: typesWithDomain,
        primaryType: typedData.primaryType,
        message: messageForApi,
      },
    });
    return result.signature;
  },
  readContract: publicClient.readContract.bind(publicClient),
});
