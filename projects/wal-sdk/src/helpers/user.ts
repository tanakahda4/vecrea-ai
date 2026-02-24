import type { Config, User } from "@coinbase/cdp-core";

/**
 * Extracts the EVM address from a CDP User based on config (createOnLogin: "eoa" vs "smart").
 * @param user - The CDP user object
 * @param config - The CDP config
 * @returns The EVM address or undefined if not found
 */
export const getEvmAddress = (
  user: User,
  config: Config
): string | undefined => {
  const createOnLogin = config.ethereum?.createOnLogin;
  if (createOnLogin === "smart") {
    return user.evmSmartAccountObjects?.[0]?.address ?? user.evmAccounts?.[0];
  }
  return user.evmAccountObjects?.[0]?.address ?? user.evmAccounts?.[0];
};

/**
 * Extracts the email address from a CDP User.
 * @param user - The CDP user object
 * @returns The email address
 * @throws Error when email is not available
 */
export const getEmail = (user: User): string => {
  const email = user.authenticationMethods?.email?.email;
  if (!email) {
    throw new Error("Could not retrieve your email address. Please try signing in again.");
  }
  return email;
};
