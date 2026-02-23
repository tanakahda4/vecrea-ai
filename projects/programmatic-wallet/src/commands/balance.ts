import { type Address } from "viem";
import { getAssetBalance, getTokenBalance } from "../helpers/balance";
import {
  getUsdcAddress,
  getWethAddress,
  isSupportedChain,
} from "../helpers/chain";
import { runAddress } from "./address";

export type RunBalanceResult =
  | { ethWei: bigint; usdcRaw: bigint; wethRaw: bigint; chain: string }
  | { error: "not_authenticated" }
  | { error: "no_evm_account" }
  | { error: "unsupported_chain"; chain: string };

export type RunBalanceOptions = {
  chain: string;
};

/**
 * Runs the balance fetch. Pure function - no console output, suitable for SDK usage.
 * @param options - Options including chain
 * @returns Balance data or error type
 */
export const runBalance = async (
  options: RunBalanceOptions
): Promise<RunBalanceResult> => {
  const { chain } = options;
  if (!isSupportedChain(chain)) {
    return { error: "unsupported_chain", chain };
  }
  const addressResult = await runAddress();
  if (addressResult.address === undefined) {
    return { error: addressResult.error };
  }
  const address = addressResult.address as Address;
  const [ethWei, usdcRaw, wethRaw] = await Promise.all([
    getAssetBalance({ address, chain }),
    getTokenBalance({
      address,
      tokenAddress: getUsdcAddress(chain),
      chain,
    }),
    getTokenBalance({
      address,
      tokenAddress: getWethAddress(),
      chain,
    }),
  ]);
  return { ethWei, usdcRaw, wethRaw, chain };
};
