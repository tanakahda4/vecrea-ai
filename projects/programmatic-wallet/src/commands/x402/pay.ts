import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import type { PaymentRequirements } from "@x402/core/types";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { runAddress } from "@/commands/address";
import { getPublicClient } from "@/helpers/chain";
import { createCdpEvmSigner } from "@/helpers/cdp-evm-signer";

const getAmount = (r: PaymentRequirements): bigint => {
  const amt = (r as { amount?: string; maxAmountRequired?: string }).amount
    ?? (r as { maxAmountRequired?: string }).maxAmountRequired
    ?? "0";
  return BigInt(amt);
};

export type RunX402PayOptions = {
  url: string;
  method?: string;
  data?: string;
  query?: string;
  headers?: string;
  maxAmount?: bigint;
  correlationId?: string;
  chain?: string;
  verbose?: boolean;
};

export type RunX402PayResult =
  | { status: number; body: unknown; headers: Record<string, string> }
  | { error: "not_authenticated" }
  | { error: "no_evm_account" }
  | { error: "invalid_url" }
  | { error: "request_failed"; message: string };

const isValidUrl = (url: string): boolean => {
  if (url.includes(" ") || url.includes(";") || url.includes("|") || url.includes("`") || url.includes("$")) {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

const buildRequest = (
  options: Pick<RunX402PayOptions, "url" | "method" | "data" | "query" | "headers" | "correlationId">
): { requestUrl: string; init: RequestInit } | { error: RunX402PayResult } => {
  const { url, method = "GET", data, query, headers: headersJson, correlationId } = options;
  let requestUrl = url;
  if (query) {
    try {
      const params = JSON.parse(query) as Record<string, string>;
      requestUrl = url.includes("?") ? `${url}&${new URLSearchParams(params)}` : `${url}?${new URLSearchParams(params)}`;
    } catch {
      return { error: { error: "request_failed", message: "Invalid --query JSON" } };
    }
  }
  const headers: Record<string, string> = { Accept: "application/json" };
  if (data) {
    try {
      JSON.parse(data);
    } catch {
      return { error: { error: "request_failed", message: "Invalid --data JSON" } };
    }
    headers["Content-Type"] = "application/json";
  }
  if (headersJson) {
    try {
      Object.assign(headers, JSON.parse(headersJson) as Record<string, string>);
    } catch {
      return { error: { error: "request_failed", message: "Invalid --headers JSON" } };
    }
  }
  if (correlationId) headers["X-Correlation-ID"] = correlationId;
  return { requestUrl, init: { method, headers, body: data } };
};

/**
 * Makes a paid x402 request. Uses CDP signer + x402 client like the standard sample,
 * with automatic USDC payment on Base.
 */
export const runX402Pay = async (options: RunX402PayOptions): Promise<RunX402PayResult> => {
  const { url, verbose = false } = options;

  if (!isValidUrl(url)) return { error: "invalid_url" };

  const built = buildRequest(options);
  if ("error" in built) return built.error;

  try {
    const addressResult = await runAddress();
    if (addressResult.address === undefined) return { error: addressResult.error };
    if (verbose) console.error("[pwal] Paying from:", addressResult.address);

    const chain = (options.chain ?? "base").toLowerCase();
    const signer = createCdpEvmSigner(addressResult.address as `0x${string}`, getPublicClient(chain));
    const maxAmount = options.maxAmount;

    const client = new x402Client();
    registerExactEvmScheme(client, {
      signer,
      ...(maxAmount !== undefined && {
        policies: [
          (_version, reqs): PaymentRequirements[] =>
            reqs.filter((r) => getAmount(r) <= maxAmount),
        ],
        paymentRequirementsSelector: (_version, accepts): PaymentRequirements => {
          if (accepts.length === 0) {
            throw new Error(
              `No payment option within max amount (${maxAmount} atomic units)` +
                ` (1000000 = $1.00 USDC)`
            );
          }
          return accepts[0];
        },
      }),
    });

    const fetchWithPayment = wrapFetchWithPayment(fetch, client);
    const response = await fetchWithPayment(built.requestUrl, built.init);

    const resHeaders: Record<string, string> = {};
    response.headers.forEach((v, k) => { resHeaders[k] = v; });

    const body = response.headers.get("content-type")?.includes("application/json")
      ? await response.json().catch(() => response.text())
      : await response.text();

    if (response.status === 402) {
      const reason = typeof body === "object" && body !== null
        ? (body as { reason?: string }).reason ?? (body as { error?: string }).error ?? (body as { message?: string }).message
        : undefined;
      return {
        error: "request_failed",
        message: `Payment was not accepted.${reason ? ` ${reason}` : ""} Check FACILITATOR_URL and wallet balance.`,
      };
    }

    return { status: response.status, body, headers: resHeaders };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (verbose && err instanceof Error && err.cause) console.error("[pwal] Error:", err.cause);
    if (msg.includes("not authenticated") || msg.includes("Not authenticated") || msg.includes("auth")) {
      return { error: "not_authenticated" };
    }
    if (msg.includes("No EVM account") || msg.includes("no_evm_account")) return { error: "no_evm_account" };
    return { error: "request_failed", message: msg };
  }
};
