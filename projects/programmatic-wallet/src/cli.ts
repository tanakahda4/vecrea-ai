import "./env-shim";
import "dotenv/config";
import { Command, Option } from "commander";
import {
  formatAssetBalance,
  formatTokenBalance,
} from "./helpers/balance";
import {
  getChainLabel,
  getExplorerBaseUrl,
  getRpcUrl,
  getTxExplorerUrl,
  SUPPORTED_CHAINS,
} from "./helpers/chain";
import { clearAuthState } from "./helpers/auth-persistence";
import { getEmail } from "./helpers/user";
import { runFaucet } from "./commands/faucet";
import { runForCli } from "./helpers/runForCli";
import { runAddress } from "./commands/address";
import { runAuthLogin } from "./commands/auth/login";
import { runAuthLogout } from "./commands/auth/logout";
import { runAuthVerify } from "./commands/auth/verify";
import { runBalance } from "./commands/balance";
import { runStatus } from "./commands/status";
import chalk from "chalk";
import ora from "ora";
import {
  runX402BazaarList,
  runX402BazaarSearch,
} from "./commands/x402/bazaar";
import { runX402Details } from "./commands/x402/details";
import { runX402Pay } from "./commands/x402/pay";
import { runSend } from "./commands/send";
import {
  formatBazaarTable,
  formatUsdcAmount,
  printFields,
} from "./helpers/x402-format";

/** CLI command for usage instructions. */
const CLI_CMD = "npx wal-sdk";

const printAuthSignInInstructions = (): void => {
  console.log("Sign in using one of:");
  console.log("  1. Email OTP:");
  console.log(`     ${CLI_CMD} auth login <your-email>`);
  console.log(`     ${CLI_CMD} auth verify <flow-id> <6-digit-code>`);
};

const program = new Command();

program
  .name("wal-sdk")
  .description("Programmatic wallet CLI")
  .version("1.0.0");

const auth = program.command("auth").description("Authentication commands");

auth
  .command("login <email>")
  .description("Sign in with email OTP")
  .action(async (email: string) => {
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
  });

auth
  .command("verify <flowId> <otp>")
  .description("Complete sign-in with verification code")
  .action(async (flowId: string, otp: string) => {
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
  });

auth
  .command("logout")
  .description("Sign out")
  .action(async () => {
    await runForCli(async () => {
      await runAuthLogout();
      await clearAuthState();
    }, { skipPersist: true });
    console.log("✔ Signed out successfully.");
    process.exit(0);
  });

program
  .command("status")
  .description("Show authentication status")
  .action(async () => {
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
  });

program
  .command("address")
  .description("Show EVM address")
  .action(async () => {
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
  });

program
  .command("balance")
  .description("Show wallet balances")
  .addOption(
    new Option("-c, --chain <chain>", "chain to use")
      .default("base")
      .choices(["base", "base-sepolia"])
  )
  .addOption(new Option("--base-sepolia", "use Base Sepolia testnet"))
  .addOption(new Option("--base", "use Base mainnet"))
  .action(async (opts: { chain: string; baseSepolia?: boolean; base?: boolean }) => {
    const chain = opts.baseSepolia
      ? "base-sepolia"
      : opts.base
        ? "base"
        : opts.chain.toLowerCase();
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
  });

program
  .command("send <amount> <to>")
  .description("Send USDC to address or ENS (e.g. send $1.00 0x... or send 1000000 vitalik.eth)")
  .addOption(
    new Option("-c, --chain <chain>", "chain to use")
      .default("base")
      .choices(["base", "base-sepolia"])
  )
  .addOption(new Option("--json", "output as JSON"))
  .addOption(new Option("-V, --verbose", "print transaction details before sending"))
  .action(
    async (amount: string, to: string, opts: { chain?: string; json?: boolean; verbose?: boolean }) => {
      const chain = opts.chain ?? "base";
      const result = await runForCli(() =>
        runSend({ amount, to, chain, verbose: opts.verbose })
      );
      if ("error" in result) {
        if (result.error === "not_authenticated" || result.error === "no_evm_account") {
          console.log("✖ Authentication required.");
          printAuthSignInInstructions();
        } else if (result.error === "invalid_amount") {
          console.log("✖", result.message);
        } else if (result.error === "invalid_address") {
          console.log("✖", result.message);
        } else if (result.error === "unsupported_chain") {
          console.error(`✖ Unsupported chain: ${result.chain}`);
          console.error(`Supported chains: ${SUPPORTED_CHAINS.join(", ")}`);
        } else {
          console.log("✖ Send failed:", result.message);
          const chain = result.chain;
          if (chain) {
            console.log(getRpcUrl(chain));
            console.log(getExplorerBaseUrl(chain));
          }
        }
        process.exit(1);
      }
      if (opts.json) {
        console.log(
          JSON.stringify(
            { ...result, explorerUrl: getTxExplorerUrl(result.network, result.transactionHash) },
            null,
            2
          )
        );
      } else {
        const url = getTxExplorerUrl(result.network, result.transactionHash);
        console.log(`✓ Sent. Transaction: ${result.transactionHash}`);
        console.log(url);
      }
      process.exit(0);
    }
  );

const x402 = program.command("x402").description("x402 Bazaar discovery commands");

const bazaar = x402.command("bazaar").description("Search and list x402 bazaar resources");

const networkOrChain = (opts: { network?: string; chain?: string }): string | undefined =>
  opts.chain ?? opts.network;

bazaar
  .command("search <query>")
  .description("Search paid services by keyword")
  .addOption(
    new Option("-k, --top <n>", "number of results")
      .default("5")
      .argParser(Number)
  )
  .addOption(
    new Option("--network <network>", "filter by network").choices([
      "base",
      "base-sepolia",
    ])
  )
  .addOption(
    new Option("-c, --chain <chain>", "filter by chain (same as --network)").choices([
      "base",
      "base-sepolia",
    ])
  )
  .addOption(new Option("--force-refresh", "re-fetch from CDP API"))
  .addOption(new Option("--json", "output as JSON"))
  .action(
    async (
      query: string,
      opts: {
        top: number;
        forceRefresh?: boolean;
        json?: boolean;
        network?: string;
        chain?: string;
      }
    ) => {
      const spinner = ora(
        opts.forceRefresh ? "Loading bazaar data..." : "Searching..."
      ).start();
      try {
        const result = await runX402BazaarSearch({
          query,
          top: opts.top,
          forceRefresh: opts.forceRefresh,
          network: networkOrChain(opts),
        });
        spinner.stop();
        if (opts.json) {
          console.log(JSON.stringify(result.items, null, 2));
          return;
        }
        if (result.items.length === 0) {
          console.log("No matching resources found");
          return;
        }
        console.log(
          chalk.dim(
            `Found ${result.items.length} result${result.items.length === 1 ? "" : "s"}\n`
          )
        );
        for (const item of result.items) {
          const accept = item.accepts?.[0];
          const description =
            (item.metadata as { description?: string })?.description ??
            accept?.description;
          console.log(chalk.bold(item.resource));
          if (description) {
            console.log(chalk.dim(description));
          }
          if (accept?.maxAmountRequired) {
            console.log(
              `Price: ${formatUsdcAmount(parseInt(accept.maxAmountRequired, 10))}`
            );
          }
          if (accept?.network) {
            console.log(`Network: ${accept.network}`);
          }
          if (accept?.scheme) {
            console.log(`Scheme: ${accept.scheme}`);
          }
          if (item.type) {
            console.log(`Type: ${item.type}`);
          }
          console.log("---");
        }
      } catch (err) {
        spinner.fail("Search failed");
        console.error(chalk.red(String(err)));
        process.exit(1);
      }
    }
  );

bazaar
  .command("list")
  .description("List all bazaar resources")
  .addOption(
    new Option("--network <network>", "filter by network").choices([
      "base",
      "base-sepolia",
    ])
  )
  .addOption(
    new Option("-c, --chain <chain>", "filter by chain (same as --network)").choices([
      "base",
      "base-sepolia",
    ])
  )
  .addOption(new Option("--full", "show complete details including schemas"))
  .addOption(new Option("--json", "output as JSON"))
  .action(
    async (opts: {
      network?: string;
      chain?: string;
      full?: boolean;
      json?: boolean;
    }) => {
      const spinner = ora("Fetching bazaar resources...").start();
      try {
        const result = await runX402BazaarList({
          network: networkOrChain(opts),
          limit: 100,
        });
        spinner.stop();
        if (opts.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }
        if (result.items.length === 0) {
          console.log("No resources found");
          return;
        }
        if (opts.full) {
          for (const item of result.items) {
            const accept = item.accepts?.[0];
            console.log(chalk.bold(`\n${item.resource}`));
            if (accept?.description) {
              console.log(chalk.dim(accept.description));
            }
            if (accept?.maxAmountRequired) {
              console.log(
                `Price: ${formatUsdcAmount(parseInt(accept.maxAmountRequired, 10))}`
              );
            }
            if (accept?.network) {
              console.log(`Network: ${accept.network}`);
            }
            if (accept?.scheme) {
              console.log(`Scheme: ${accept.scheme}`);
            }
            const meta = item.metadata as { confidence?: { overallScore?: number } } | undefined;
            if (meta?.confidence?.overallScore !== undefined) {
              console.log(`Quality Score: ${meta.confidence.overallScore}`);
            }
            if (accept?.outputSchema) {
              console.log(
                `Schema: ${JSON.stringify(accept.outputSchema, null, 2)}`
              );
            }
            console.log("---");
          }
        } else {
          const tableData = result.items.map((r) => {
            const accept = r.accepts?.[0];
            return {
              resource: r.resource,
              description: accept?.description ?? "-",
              price: accept?.maxAmountRequired
                ? formatUsdcAmount(parseInt(accept.maxAmountRequired, 10))
                : "-",
              network: accept?.network ?? "-",
            };
          });
          console.log(formatBazaarTable(tableData));
        }
      } catch (err) {
        spinner.fail("Failed to fetch bazaar resources");
        console.error(chalk.red(String(err)));
        process.exit(1);
      }
    }
  );

const detailsNetworkMatch = (
  accept: Record<string, unknown>,
  network: string
): boolean => {
  const n = String(accept.network ?? "").toLowerCase();
  const target = network.toLowerCase();
  if (target === "base") return n === "base" || n === "eip155:8453";
  if (target === "base-sepolia")
    return n === "base-sepolia" || n === "eip155:84532";
  return n.includes(target);
};

const runDetailsAction = async (
  url: string,
  opts: { json?: boolean; network?: string; chain?: string }
) => {
  const spinner = ora("Discovering payment requirements...").start();
  try {
    const result = await runX402Details(url);
    spinner.stop();
    if ("error" in result) {
      console.log(chalk.yellow("No X402 payment requirements found at that URL."));
      process.exit(1);
    }
    const pr = result.paymentRequired as Record<string, unknown> | undefined;
    const networkFilter = opts.chain ?? opts.network;
    let accepts = Array.isArray(pr?.accepts) ? pr.accepts : [];
    if (networkFilter) {
      accepts = accepts.filter((a: Record<string, unknown>) =>
        detailsNetworkMatch(a, networkFilter)
      );
    }
    const prFiltered = pr
      ? { ...pr, accepts }
      : undefined;
    if (opts.json) {
      console.log(
        JSON.stringify(
          { method: result.method, url, ...prFiltered },
          null,
          2
        )
      );
      return;
    }
    if (!pr) {
      console.log(chalk.yellow("No X402 payment requirements found at that URL."));
      process.exit(1);
    }
    console.log(chalk.bold("Payment Requirements"));
    console.log("---");
    console.log(`URL: ${url}`);
    console.log(`Method: ${result.method}`);
    const { accepts: _accepts, resource, extensions, ...topLevel } = pr;
    printFields(topLevel as Record<string, unknown>, "");
    if (resource && typeof resource === "object") {
      console.log(`\n${chalk.bold("Resource")}`);
      printFields(resource as Record<string, unknown>, "  ");
    }
    if (
      extensions &&
      typeof extensions === "object" &&
      Object.keys(extensions).length > 0
    ) {
      console.log(`\n${chalk.bold("Extensions")}`);
      printFields(extensions as Record<string, unknown>, "  ");
    }
    if (accepts.length > 0) {
      console.log(`\n${chalk.bold("Accepted Payment Options")}`);
      for (const req of accepts) {
        console.log("");
        printFields(req as Record<string, unknown>, "  ");
      }
    } else if (networkFilter && Array.isArray(pr.accepts) && pr.accepts.length > 0) {
      console.log(
        chalk.dim(
          `\n(No payment options match --chain ${networkFilter}. Omit to see all.)`
        )
      );
    }
  } catch (err) {
    spinner.fail("Discovery failed");
    console.error(chalk.red(String(err)));
    process.exit(1);
  }
};

bazaar
  .command("details <url>")
  .description("Inspect payment requirements for an x402 endpoint")
  .addOption(
    new Option("--network <network>", "filter payment options by network").choices([
      "base",
      "base-sepolia",
    ])
  )
  .addOption(
    new Option("-c, --chain <chain>", "filter by chain (same as --network)").choices([
      "base",
      "base-sepolia",
    ])
  )
  .addOption(new Option("--json", "output as JSON"))
  .action(runDetailsAction);

x402
  .command("pay <url>")
  .description("Make a paid x402 request with automatic USDC payment")
  .addOption(
    new Option("-X, --method <method>", "HTTP method").default("GET")
  )
  .addOption(new Option("-d, --data <json>", "Request body as JSON string"))
  .addOption(new Option("-q, --query <params>", "Query parameters as JSON string"))
  .addOption(new Option("--headers <json>", "Custom HTTP headers as JSON string"))
  .addOption(
    new Option("-m, --max-amount <amount>", "Max payment in USDC atomic units (1000000 = $1.00)")
      .argParser((v) => BigInt(v))
  )
  .addOption(new Option("--correlation-id <id>", "Group related operations"))
  .addOption(
    new Option("--network <network>", "Filter payment options by network").choices([
      "base",
      "base-sepolia",
    ])
  )
  .addOption(
    new Option("-c, --chain <chain>", "Filter by chain (same as --network)").choices([
      "base",
      "base-sepolia",
    ])
  )
  .addOption(new Option("--verbose", "Show debug output (address, payment headers)"))
  .addOption(new Option("--json", "Output as JSON"))
  .action(
    async (
      url: string,
      opts: {
        method: string;
        data?: string;
        query?: string;
        headers?: string;
        maxAmount?: bigint;
        correlationId?: string;
        network?: string;
        chain?: string;
        verbose?: boolean;
        json?: boolean;
      }
    ) => {
      const spinner = ora("Making paid request...").start();
      try {
        const chain = opts.chain ?? opts.network ?? "base";
        const result = await runForCli(() =>
          runX402Pay({
            url,
            method: opts.method,
            data: opts.data,
            query: opts.query,
            headers: opts.headers,
            maxAmount: opts.maxAmount,
            correlationId: opts.correlationId,
            chain,
            verbose: opts.verbose,
          })
        );
        spinner.stop();
        if ("error" in result) {
          if (result.error === "not_authenticated" || result.error === "no_evm_account") {
            console.log("✖ Authentication required.");
            printAuthSignInInstructions();
          } else if (result.error === "invalid_url") {
            console.log("✖ Invalid URL. Must start with https:// or http://.");
          } else {
            console.log("✖ Request failed:", result.message);
          }
          process.exit(1);
        }
        if (opts.json) {
          console.log(
            JSON.stringify(
              { status: result.status, body: result.body, headers: result.headers },
              null,
              2
            )
          );
        } else {
          if (typeof result.body === "object" && result.body !== null) {
            console.log(JSON.stringify(result.body, null, 2));
          } else {
            console.log(String(result.body));
          }
        }
        process.exit(0);
      } catch (err) {
        spinner.fail("Payment failed");
        console.error(chalk.red(String(err)));
        process.exit(1);
      }
    }
  );

x402
  .command("details <url>")
  .description("Inspect payment requirements for an x402 endpoint")
  .addOption(
    new Option("--network <network>", "filter payment options by network").choices([
      "base",
      "base-sepolia",
    ])
  )
  .addOption(
    new Option("-c, --chain <chain>", "filter by chain (same as --network)").choices([
      "base",
      "base-sepolia",
    ])
  )
  .addOption(new Option("--json", "output as JSON"))
  .action(runDetailsAction);

program
  .command("faucet")
  .description("Show Base Sepolia faucet URL")
  .action(async () => {
    const { url } = await runForCli(() => runFaucet());
    console.log("Base Sepolia faucet (select ETH or USDC on the site):");
    console.log(`  ${url}`);
    process.exit(0);
  });

program.parseAsync().catch((err) => {
  console.error(err);
  process.exit(1);
});
