import { runAddress } from "./address";

const FAUCET_URL = "https://portal.cdp.coinbase.com/products/faucet";

export type RunFaucetResult =
  | { url: string }
  | { url: string; error: "not_authenticated" }
  | { url: string; error: "no_evm_account" };

/**
 * Runs the faucet URL fetch. Pure function - no console output, suitable for SDK usage.
 * Returns the faucet URL with address query param if the user is authenticated and has an EVM account.
 * @returns The faucet URL (and error if address could not be resolved)
 */
export const runFaucet = async (): Promise<RunFaucetResult> => {
  const result = await runAddress();
  if ("error" in result) {
    return { url: FAUCET_URL, error: result.error };
  }
  return { url: `${FAUCET_URL}?address=${result.address}` };
};
