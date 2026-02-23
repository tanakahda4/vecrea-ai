import { signOut } from "@coinbase/cdp-core";

/**
 * Runs the auth logout flow. Pure function - no console output, suitable for SDK usage.
 * Note: In Node.js CLI, call clearAuthState after this to remove persisted auth file.
 */
export const runAuthLogout = async (): Promise<void> => {
  await signOut();
};
