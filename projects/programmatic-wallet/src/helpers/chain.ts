import { base, baseSepolia } from "viem/chains";
import { type Address, type PublicClient, createPublicClient, http } from "viem";

const WETH_ADDRESS = "0x4200000000000000000000000000000000000006" as Address;

/** Maps EIP-155 chain IDs to chain names (for x402 network normalization). */
export const EIP155_TO_CHAIN: Record<string, string> = {
  "eip155:84532": "base-sepolia",
  "eip155:8453": "base",
};

/** Maps chain names to EIP-155 (for x402 network filter). */
export const CHAIN_TO_EIP155: Record<string, string> = {
  "base-sepolia": "eip155:84532",
  base: "eip155:8453",
};

const CHAIN_CONFIG: Record<
  string,
  { chain: typeof base | typeof baseSepolia; usdc: Address; label: string }
> = {
  base: {
    chain: base,
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    label: "Base",
  },
  "base-sepolia": {
    chain: baseSepolia,
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    label: "Base Sepolia",
  },
};

const clientCache = new Map<string, PublicClient>();

export const SUPPORTED_CHAINS = ["base", "base-sepolia"] as const;

export const isSupportedChain = (chain: string): chain is (typeof SUPPORTED_CHAINS)[number] =>
  SUPPORTED_CHAINS.includes(chain.toLowerCase() as (typeof SUPPORTED_CHAINS)[number]);

export const getPublicClient = (chain: string = "base"): PublicClient => {
  const cached = clientCache.get(chain);
  if (cached) {
    return cached;
  }
  const config =
    (CHAIN_CONFIG as Record<string, (typeof CHAIN_CONFIG)["base"]>)[chain] ??
    CHAIN_CONFIG.base;
  const client = createPublicClient({
    chain: config.chain,
    transport: http(),
  }) as PublicClient;
  clientCache.set(chain, client);
  return client;
};

export const getChainLabel = (chain: string): string => {
  const config =
    (CHAIN_CONFIG as Record<string, (typeof CHAIN_CONFIG)["base"]>)[chain] ??
    CHAIN_CONFIG.base;
  return config.label;
};

export const getUsdcAddress = (chain: string): Address => {
  const config =
    (CHAIN_CONFIG as Record<string, (typeof CHAIN_CONFIG)["base"]>)[chain] ??
    CHAIN_CONFIG.base;
  return config.usdc;
};

/** Returns chain ID for the given chain name. */
export const getChainId = (chain: string): number => {
  const config =
    (CHAIN_CONFIG as Record<string, (typeof CHAIN_CONFIG)["base"]>)[chain] ??
    CHAIN_CONFIG.base;
  return config.chain.id;
};

export const getWethAddress = (): Address => WETH_ADDRESS;

/** Returns block explorer base URL for the chain. */
export const getExplorerBaseUrl = (chain: string): string => {
  const config =
    (CHAIN_CONFIG as Record<string, (typeof CHAIN_CONFIG)["base"]>)[chain] ??
    CHAIN_CONFIG.base;
  return config.chain.blockExplorers?.default?.url ?? "https://basescan.org";
};

/** Returns RPC URL for the chain. */
export const getRpcUrl = (chain: string): string => {
  const config =
    (CHAIN_CONFIG as Record<string, (typeof CHAIN_CONFIG)["base"]>)[chain] ??
    CHAIN_CONFIG.base;
  const http = config.chain.rpcUrls?.default?.http;
  return (Array.isArray(http) ? http[0] : undefined) ?? "https://mainnet.base.org";
};

/** Returns block explorer URL for a transaction hash. */
export const getTxExplorerUrl = (chain: string, txHash: string): string => {
  return `${getExplorerBaseUrl(chain)}/tx/${txHash}`;
};

/** Returns viem chain for wallet client (x402 pay). */
export const getChainForWallet = (chainName: string = "base") => {
  const config =
    (CHAIN_CONFIG as Record<string, (typeof CHAIN_CONFIG)["base"]>)[
      chainName.toLowerCase()
    ] ?? CHAIN_CONFIG.base;
  return config.chain;
};
