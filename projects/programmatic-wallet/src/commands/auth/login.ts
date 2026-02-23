import {
  signInWithEmail,
  type SignInWithEmailOptions,
  type SignInWithEmailResult,
} from "@coinbase/cdp-core";

/**
 * Runs the auth login flow by sending a verification code to the specified email.
 * Pure function with no side effects - suitable for SDK usage.
 * @param options - Options for the auth login flow
 * @returns The result including flow ID for completing verification
 */
export const runAuthLogin = async (
  options: SignInWithEmailOptions
): Promise<SignInWithEmailResult> => {
  return signInWithEmail(options);
};
