import { getConfig } from "../config";
import { getEvmAddress } from "../helpers/user";
import { runStatus } from "./status";

export type RunAddressResult =
  | { address: string }
  | { address: undefined; error: "not_authenticated" }
  | { address: undefined; error: "no_evm_account" };

/**
 * Runs the address fetch. Pure function - no console output, suitable for SDK usage.
 * @returns The EVM address or error type
 */
export const runAddress = async (): Promise<RunAddressResult> => {
  const { user } = await runStatus();
  if (!user) {
    return { address: undefined, error: "not_authenticated" };
  }
  const config = getConfig();
  const address = getEvmAddress(user, config);
  if (!address) {
    return { address: undefined, error: "no_evm_account" };
  }
  return { address };
};
