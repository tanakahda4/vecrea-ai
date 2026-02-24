import { persistAuthState, restoreAuthState } from "./auth-persistence";
import { initializeWithNodeCompat } from "./initializeWithNodeCompat";
import { getConfig } from "../config";

export type RunForCliOptions = {
  /** Skip persistAuthState (e.g. auth login - no refresh token yet). Default: false */
  skipPersist?: boolean;
};

/**
 * Runs CLI setup (restore auth state + initialize CDP), executes the given command,
 * then persists auth state. Use this to wrap all command execution in the CLI.
 */
export const runForCli = async <T>(
  fn: () => Promise<T>,
  options: RunForCliOptions = {}
): Promise<T> => {
  await restoreAuthState();
  await initializeWithNodeCompat(getConfig());
  try {
    return await fn();
  } finally {
    if (!options.skipPersist) {
      await persistAuthState();
    }
  }
};
