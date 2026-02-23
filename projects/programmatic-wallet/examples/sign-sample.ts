/**
 * Sample: sign EIP-3009 TransferWithAuthorization using signEvmTypedData from @coinbase/cdp-core.
 *
 * Run: npx tsx examples/sign-sample.ts
 * Prerequisite: pwal auth login + verify
 */
import "../src/env-shim";
import "dotenv/config";
import { getCurrentUser, signEvmTypedData } from "@coinbase/cdp-core";
import { toHex } from "viem";
import { restoreAuthState } from "../src/helpers/auth-persistence";
import { initializeWithNodeCompat } from "../src/helpers/initializeWithNodeCompat";
import { getConfig } from "../src/config";

const createNonce = (): `0x${string}` =>
  toHex(globalThis.crypto.getRandomValues(new Uint8Array(32)));

const main = async () => {
  await restoreAuthState(); // ensure auth state is loaded from file
  await initializeWithNodeCompat(getConfig());

  const user = await getCurrentUser();
  const evmAccount = user?.evmAccountObjects?.[0]?.address;

  if (!evmAccount) {
    console.error("No EVM account. Run: pwal auth login <email> && pwal auth verify <flow-id> <code>");
    process.exit(1);
  }

  const now = Math.floor(Date.now() / 1e3);
  const validAfter = (now - 600).toString();
  const validBefore = (now + 3600).toString();
  const nonce = createNonce();

  const result = await signEvmTypedData({
    evmAccount,
    typedData: {
      domain: {
        name: "USDC",
        version: "2",
        chainId: 84532,
        verifyingContract: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia USDC
      },
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        TransferWithAuthorization: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "validAfter", type: "uint256" },
          { name: "validBefore", type: "uint256" },
          { name: "nonce", type: "bytes32" },
        ],
      },
      primaryType: "TransferWithAuthorization",
      message: {
        from: evmAccount,
        to: evmAccount,
        value: "1000",
        validAfter,
        validBefore,
        nonce,
      },
    },
  });

  console.log(result.signature);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
