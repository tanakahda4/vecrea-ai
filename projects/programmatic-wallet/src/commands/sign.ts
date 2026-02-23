import { signEvmTypedData } from "@coinbase/cdp-core";
import { getAddress, toHex } from "viem";
import { authorizationTypes } from "@x402/evm";
import { runAddress } from "./address";
import { getUsdcAddress } from "../helpers/chain";

/** EIP-3009 TransferWithAuthorization types (CDP API requires EIP712Domain). */
const TYPED_DATA_TYPES = {
  EIP712Domain: [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ],
  ...(authorizationTypes as { TransferWithAuthorization: readonly { name: string; type: string }[] }),
};

const createNonce = (): `0x${string}` =>
  toHex(globalThis.crypto.getRandomValues(new Uint8Array(32)));

export type RunSignOptions = {
  /** Sender address (default: current user's address). */
  from?: string;
  /** Recipient address (default: same as from). */
  to?: string;
  /** Amount in token atomic units (default: "1000"). */
  value?: string;
  /** Token/asset contract address (default: USDC for chain). */
  asset?: string;
  /** Chain for domain.chainId (default: "base"). */
  chain?: string;
  /** EIP-712 domain name (default: "USD Coin" for base, "USDC" for base-sepolia). */
  domainName?: string;
  /** EIP-712 domain version (default: "2"). */
  domainVersion?: string;
  /** Include underlying error details in output. */
  verbose?: boolean;
};

export type RunSignResult =
  | { signature: string }
  | { error: "not_authenticated" }
  | { error: "no_evm_account" }
  | { error: "request_failed"; message: string };

/** Sample value when amount is not specified. */
const SAMPLE_VALUE = "1000";

/**
 * Signs an EIP-3009 TransferWithAuthorization message.
 * When options are omitted, uses sample values for testing.
 */
export const runSign = async (options: RunSignOptions = {}): Promise<RunSignResult> => {
  const {
    from: fromOpt,
    to: toOpt,
    value: valueOpt,
    asset: assetOpt,
    chain = "base",
    domainName: domainNameOpt,
    domainVersion = "2",
    verbose = false,
  } = options;

  const chainId = chain === "base" ? 8453 : 84532;
  const domainName =
    domainNameOpt ?? (chain === "base" ? "USD Coin" : "USDC");
  const asset = assetOpt
    ? (getAddress(assetOpt) as `0x${string}`)
    : (getUsdcAddress(chain) as `0x${string}`);

  let from: `0x${string}`;
  if (fromOpt) {
    from = getAddress(fromOpt) as `0x${string}`;
  } else {
    const addressResult = await runAddress();
    if (addressResult.address === undefined) {
      return { error: addressResult.error };
    }
    from = addressResult.address as `0x${string}`;
  }

  const to = toOpt ? (getAddress(toOpt) as `0x${string}`) : from;
  const value = valueOpt ?? SAMPLE_VALUE;
  const nonce = createNonce();
  const now = Math.floor(Date.now() / 1e3);
  const validAfter = (now - 600).toString();
  const validBefore = (now + 3600).toString();

  const typedData = {
    types: TYPED_DATA_TYPES,
    domain: {
      name: domainName,
      version: domainVersion,
      chainId,
      verifyingContract: asset,
    },
    primaryType: "TransferWithAuthorization" as const,
    message: {
      from,
      to,
      value,
      validAfter,
      validBefore,
      nonce,
    },
  };

  try {
    const result = await signEvmTypedData({
      evmAccount: from,
      typedData,
    });

    return { signature: result.signature };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("not authenticated") ||
      msg.includes("Not authenticated") ||
      msg.includes("auth")
    ) {
      return { error: "not_authenticated" };
    }
    if (msg.includes("No EVM account") || msg.includes("no_evm_account")) {
      return { error: "no_evm_account" };
    }
    let message = msg;
    if (verbose && err instanceof Error) {
      const parts = [msg];
      if (err.cause instanceof Error) {
        parts.push(`Cause: ${err.cause.message}`);
      }
      const ax = err as { response?: { status?: number; data?: unknown } };
      if (ax.response) {
        parts.push(`Response: ${ax.response.status} ${JSON.stringify(ax.response.data)}`);
      }
      message = parts.join("\n");
    }
    return { error: "request_failed", message };
  }
};
