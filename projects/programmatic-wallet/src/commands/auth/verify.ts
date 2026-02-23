import {
  verifyEmailOTP,
  type VerifyEmailOTPOptions,
  type VerifyEmailOTPResult,
} from "@coinbase/cdp-core";

/**
 * Runs the auth verify flow by verifying the OTP code.
 * Pure function - no console output, suitable for SDK usage.
 * @param options - Options for the auth verify flow
 * @returns The verification result including user info
 */
export const runAuthVerify = async (
  options: VerifyEmailOTPOptions
): Promise<VerifyEmailOTPResult> => {
  return verifyEmailOTP(options);
};
