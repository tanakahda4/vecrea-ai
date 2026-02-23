/**
 * wal-sdk - Programmatic wallet for CDP (Coinbase Developer Platform).
 *
 * Use as a library in your Node.js, cloud (Vercel AI SDK), or AI agent (Cursor/Codex) projects.
 *
 * @packageDocumentation
 */

export { runAddress } from "./commands/address";
export type { RunAddressResult } from "./commands/address";

export { runBalance } from "./commands/balance";
export type { RunBalanceOptions, RunBalanceResult } from "./commands/balance";

export { runSend } from "./commands/send";
export type { RunSendOptions, RunSendResult } from "./commands/send";

export { runX402Pay } from "./commands/x402/pay";
export type { RunX402PayOptions, RunX402PayResult } from "./commands/x402/pay";

export { runX402Details } from "./commands/x402/details";
export type { RunX402DetailsResult } from "./commands/x402/details";

export {
  runX402BazaarSearch,
  runX402BazaarList,
} from "./commands/x402/bazaar";
export type {
  DiscoveryResource,
  RunX402BazaarSearchOptions,
  RunX402BazaarSearchResult,
  RunX402BazaarListOptions,
  RunX402BazaarListResult,
} from "./commands/x402/bazaar";

export { runStatus } from "./commands/status";
export type { RunStatusResult } from "./commands/status";

export { runFaucet } from "./commands/faucet";
export type { RunFaucetResult } from "./commands/faucet";

export { runForCli } from "./helpers/runForCli";
export type { RunForCliOptions } from "./helpers/runForCli";

export {
  getPublicClient,
  getChainId,
  getUsdcAddress,
  getTxExplorerUrl,
  getExplorerBaseUrl,
  getRpcUrl,
  getChainLabel,
  getChainForWallet,
  isSupportedChain,
  SUPPORTED_CHAINS,
  EIP155_TO_CHAIN,
  CHAIN_TO_EIP155,
} from "./helpers/chain";

export { createCdpEvmSigner } from "./helpers/cdp-evm-signer";

export { formatUsdcAmount, formatBazaarTable } from "./helpers/x402-format";
