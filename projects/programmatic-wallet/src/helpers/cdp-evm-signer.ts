import { signEvmTypedData } from "@coinbase/cdp-core";
import type { ClientEvmSigner } from "@x402/evm";
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
 *
 * The x402 client (e.g. @x402/fetch) passes EIP-712 typed data with BigInt values
 * (value, validAfter, validBefore, etc.) to the signer. The CDP API serializes
 * the request as JSON, but JSON.stringify cannot handle BigInt and throws
 * "Do not know how to serialize a BigInt". This signer converts BigInt to string
 * in the message before calling signEvmTypedData, so the API request succeeds.
 *
 * Also ensures EIP712Domain is included in types (required by the CDP API).
 *
 * @param address - EVM address to sign with (must be authenticated via CDP)
 * @param publicClient - viem PublicClient for readContract (allowance, nonces, etc.)
 * @returns ClientEvmSigner compatible with registerExactEvmScheme
 */
export const createCdpEvmSigner = (
  address: Address,
  publicClient: PublicClient
): ClientEvmSigner => ({
  address,
  signTypedData: async (typedData: {
    domain: Record<string, unknown>;
    types: Record<string, unknown>;
    primaryType: string;
    message: Record<string, unknown>;
  }): Promise<`0x${string}`> => {
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
