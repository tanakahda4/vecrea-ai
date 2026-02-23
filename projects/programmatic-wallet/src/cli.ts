import "./env-shim";
import "dotenv/config";
import { getCurrentUser, isSignedIn } from "@coinbase/cdp-core";
import {
  formatAssetBalance,
  formatTokenBalance,
} from "./helpers/balance";
import { getChainLabel, SUPPORTED_CHAINS } from "./helpers/chain";
import { clearAuthState } from "./helpers/auth-persistence";
import { getEmail, getEvmAddress } from "./helpers/user";
import { runForCli } from "./helpers/runForCli";
import { getConfig } from "./config";
import { runAddress } from "./commands/address";
import { runAuthLogin } from "./commands/auth/login";
import { runAuthLogout } from "./commands/auth/logout";
import { runAuthVerify } from "./commands/auth/verify";
import { runBalance } from "./commands/balance";
import { runStatus } from "./commands/status";

/** CLI command for usage instructions. Will be "npx pwal" when published. */
const CLI_CMD = "npx tsx src/cli.ts";

const FAUCET_URL = "https://portal.cdp.coinbase.com/products/faucet";

const printAuthSignInInstructions = (): void => {
  console.log("Sign in using one of:");
  console.log("  1. Email OTP:");
  console.log(`     ${CLI_CMD} auth login <your-email>`);
  console.log(`     ${CLI_CMD} auth verify <flow-id> <6-digit-code>`);
};

const main = async () => {
  const args = process.argv.slice(2);

  if (args[0] === "auth" && args[1] === "login") {
    const email = args[2];
    if (!email) {
      console.error("Usage: auth login <email>");
      process.exit(1);
    }
    console.log("Initializing CDP Core...");
    const { flowId } = await runForCli(() => runAuthLogin({ email }), {
      skipPersist: true,
    });
    console.log("✓ Verification code sent!");
    console.log(`ℹ Check your email (${email}) for a 6-digit code.\n`);
    console.log(`Flow ID: ${flowId}\n`);
    console.log("To complete sign-in, run:");
    console.log(`  ${CLI_CMD} auth verify ${flowId} <6-digit-code>`);
    process.exit(0);
  }

  if (args[0] === "auth" && args[1] === "verify") {
    const flowId = args[2];
    const otp = args[3];
    if (!flowId || !otp) {
      console.error("Usage: auth verify <flowId> <6-digit-code>");
      process.exit(1);
    }
    console.log("Initializing CDP Core...");
    const result = await runForCli(() => runAuthVerify({ flowId, otp }));
    const email = getEmail(result.user);
    console.log("✔ Authentication successful!");
    console.log(`Successfully signed in as ${email}.\n`);
    console.log("You can now use wallet commands:");
    console.log(`  ${CLI_CMD} balance`);
    console.log(`  ${CLI_CMD} address`);
    process.exit(0);
  }

  if (args[0] === "auth" && args[1] === "logout") {
    await runForCli(async () => {
      await runAuthLogout();
      await clearAuthState();
    }, { skipPersist: true });
    console.log("✔ Signed out successfully.");
    process.exit(0);
  }

  if (args[0] === "status") {
    console.log("Initializing CDP Core...");
    const { user } = await runForCli(() => runStatus());
    console.log("\nAuthentication");
    if (user) {
      const email = getEmail(user);
      console.log("✓ Authenticated");
      console.log(`Logged in as: ${email}`);
    } else {
      console.log("⚠ Not authenticated\n");
      printAuthSignInInstructions();
    }
    process.exit(0);
  }

  if (args[0] === "address") {
    const result = await runForCli(() => runAddress());
    if ("error" in result) {
      console.log("✖ Failed to fetch address");
      if (result.error === "no_evm_account") {
        console.log("No EVM account found.\n");
      } else {
        console.log("Authentication required.\n");
      }
      printAuthSignInInstructions();
      process.exit(1);
    }
    console.log(result.address);
    process.exit(0);
  }

  if (args[0] === "balance") {
    const chainIdx = args.indexOf("--chain");
    const chain =
      chainIdx >= 0 && args[chainIdx + 1]
        ? args[chainIdx + 1].toLowerCase()
        : "base";
    const result = await runForCli(() => runBalance({ chain }));
    if ("error" in result) {
      if (result.error === "unsupported_chain") {
        console.error(`✖ Unsupported chain: ${result.chain}`);
        console.error(`Supported chains: ${SUPPORTED_CHAINS.join(", ")}`);
      } else {
        console.log("✖ Failed to fetch balance");
        if (result.error === "no_evm_account") {
          console.log("No EVM account found.\n");
        } else {
          console.log("Authentication required.\n");
        }
        printAuthSignInInstructions();
      }
      process.exit(1);
    }
    console.log(`\nWallet Balances (${getChainLabel(result.chain)})`);
    console.log("────────────────────────");
    console.log(`USDC    $${formatTokenBalance(result.usdcRaw, 6)}`);
    console.log(`ETH     ${formatAssetBalance(result.ethWei)}`);
    console.log(`WETH    ${formatTokenBalance(result.wethRaw, 18)}`);
    process.exit(0);
  }

  if (args[0] === "faucet") {
    await runForCli(async () => {
      const signedIn = await isSignedIn();
      const config = getConfig();
      const user = signedIn ? await getCurrentUser() : null;
      const evmAddress = user ? getEvmAddress(user, config) : undefined;
      const url = evmAddress ? `${FAUCET_URL}?address=${evmAddress}` : FAUCET_URL;
      console.log("Base Sepolia faucet (select ETH or USDC on the site):");
      console.log(`  ${url}`);
    });
    process.exit(0);
  }

  console.log("Usage:");
  console.log(`  ${CLI_CMD} auth login <email>`);
  console.log(`  ${CLI_CMD} auth verify <flowId> <6-digit-code>`);
  console.log(`  ${CLI_CMD} auth logout`);
  console.log(`  ${CLI_CMD} status`);
  console.log(`  ${CLI_CMD} address`);
  console.log(`  ${CLI_CMD} balance [--chain base|base-sepolia]`);
  console.log(`  ${CLI_CMD} faucet`);
  process.exit(1);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
