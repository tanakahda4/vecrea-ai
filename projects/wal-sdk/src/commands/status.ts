import { getCurrentUser, isSignedIn, type User } from "@coinbase/cdp-core";

export type RunStatusResult = {
  user: User | null;
};

/**
 * Runs the status check. Pure function - no console output, suitable for SDK usage.
 * @returns The current user or null if not authenticated
 */
export const runStatus = async (): Promise<RunStatusResult> => {
  const signedIn = await isSignedIn();
  const user = signedIn ? await getCurrentUser() : null;
  return { user };
};
