import { sendEvmTransaction } from "@coinbase/cdp-core";
import { encodeFunctionData, getAddress } from "viem";
import { mainnet } from "viem/chains";
import { createPublicClient, http } from "viem";
import { normalize } from "viem/ens";
import { runAddress } from "./address";
import {
  getChainId,
  getPublicClient,
  getUsdcAddress,
  isSupportedChain,
} from "@/helpers/chain";

export type RunSendOptions = {
  /** Amount as $1.00 or atomic units (e.g. 1000000). */
  amount: string;
  /** Recipient address or ENS name. */
  to: string;
  /** Chain (default: base). */
  chain?: string;
  /** Print transaction details before sending. */
  verbose?: boolean;
};

export type RunSendResult =
  | { transactionHash: string; from: string; network: string }
  | { error: "not_authenticated" }
  | { error: "no_evm_account" }
  | { error: "invalid_amount"; message: string }
  | { error: "invalid_address"; message: string }
  | { error: "unsupported_chain"; chain: string }
  | { error: "request_failed"; message: string; chain: string };

const USDC_DECIMALS = 6;

const ERC20_TRANSFER_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

/**
 * Parses amount string to USDC atomic units.
 * Supports: $1.00, 1.00, 1000000 (atomic)
 */
const parseAmount = (input: string): bigint | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withoutDollar = trimmed.replace(/^\$/, "");
  const num = parseFloat(withoutDollar);
  if (Number.isNaN(num) || num < 0) return null;
  if (trimmed.startsWith("$") || withoutDollar.includes(".")) {
    return BigInt(Math.round(num * 10 ** USDC_DECIMALS));
  }
  const asInt = parseInt(trimmed, 10);
  if (String(asInt) !== trimmed) return null;
  return BigInt(asInt);
};

const isEvmAddress = (s: string): boolean => /^0x[0-9a-fA-F]{40}$/.test(s);
const looksLikeEns = (s: string): boolean =>
  s.includes(".") && !s.startsWith("0x") && s.length > 4;

const resolveEnsToAddress = async (name: string): Promise<string | null> => {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(),
  });
  return client.getEnsAddress({ name: normalize(name) });
};

/**
 * Sends USDC to an address or ENS name. Signs with CDP and broadcasts via
 * our publicClient so --chain is respected (CDP sendEvmTransaction may
 * broadcast to wrong chain).
 */
export const runSend = async (options: RunSendOptions): Promise<RunSendResult> => {
  const { amount: amountInput, to: toInput, chain = "base", verbose = false } = options;

  const addressResult = await runAddress();
  if (addressResult.address === undefined) {
    return { error: addressResult.error };
  }

  const chainLower = chain.toLowerCase();
  if (!isSupportedChain(chainLower)) {
    return { error: "unsupported_chain", chain: chainLower };
  }

  const amountBigInt = parseAmount(amountInput);
  if (amountBigInt === null || amountBigInt === 0n) {
    return {
      error: "invalid_amount",
      message: `Invalid amount: ${amountInput}. Use $1.00 or atomic units (e.g. 1000000).`,
    };
  }

  let toAddress: string;
  if (isEvmAddress(toInput)) {
    toAddress = getAddress(toInput);
  } else if (looksLikeEns(toInput)) {
    const resolved = await resolveEnsToAddress(toInput);
    if (!resolved) {
      return {
        error: "invalid_address",
        message: `ENS name could not be resolved: ${toInput}`,
      };
    }
    toAddress = resolved;
  } else {
    return {
      error: "invalid_address",
      message: `Invalid address or ENS: ${toInput}`,
    };
  }

  try {
    const publicClient = getPublicClient(chainLower);
    const usdcAddress = getUsdcAddress(chainLower);
    const chainId = getChainId(chainLower);

    const data = encodeFunctionData({
      abi: ERC20_TRANSFER_ABI,
      functionName: "transfer",
      args: [toAddress as `0x${string}`, amountBigInt],
    });

    const [nonce, gas, fee] = await Promise.all([
      publicClient.getTransactionCount({
        address: addressResult.address as `0x${string}`,
      }),
      publicClient.estimateGas({
        account: addressResult.address as `0x${string}`,
        to: usdcAddress,
        data,
      }),
      publicClient.estimateFeesPerGas(),
    ]);

    const transaction = {
      to: usdcAddress,
      data,
      value: 0n,
      nonce,
      gas,
      maxFeePerGas: fee.maxFeePerGas ?? 0n,
      maxPriorityFeePerGas: fee.maxPriorityFeePerGas ?? 0n,
      chainId,
      type: "eip1559" as const,
    };

    if (verbose) {
      console.error("[wal-sdk] Transaction:");
      console.error(JSON.stringify({
        from: addressResult.address,
        to: transaction.to,
        value: transaction.value.toString(),
        data: transaction.data,
        nonce: transaction.nonce,
        gas: transaction.gas.toString(),
        maxFeePerGas: transaction.maxFeePerGas.toString(),
        maxPriorityFeePerGas: transaction.maxPriorityFeePerGas.toString(),
        chainId: transaction.chainId,
        chain: chainLower,
      }, null, 2));
      console.error("[wal-sdk] ERC20 transfer:", { to: toAddress, amount: amountBigInt.toString() });
    }

    const result = await sendEvmTransaction({
      evmAccount: addressResult.address as `0x${string}`,
      network: chainLower,
      transaction,
    });

    const transactionHash = result.transactionHash;

    return {
      transactionHash,
      from: addressResult.address,
      network: chainLower,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("not authenticated") ||
      msg.includes("Not authenticated") ||
      msg.includes("auth")
    ) {
      return { error: "not_authenticated" };
    }
    if (msg.includes("No EVM account") || msg.includes("no_evm_account")) {
      return { error: "no_evm_account" };
    }
    if (msg.toLowerCase().includes("exceeds balance") || msg.includes("insufficient")) {
      return {
        error: "request_failed",
        message: `${msg} Check balance: npx wal-sdk balance -c ${chainLower}`,
        chain: chainLower,
      };
    }
    return { error: "request_failed", message: msg, chain: chainLower };
  }
};
