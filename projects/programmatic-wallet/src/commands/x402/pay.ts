import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import type { PaymentRequirements } from "@x402/core/types";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { runAddress } from "../address";
import { EIP155_TO_CHAIN, getPublicClient } from "../../helpers/chain";
import { createCdpEvmSigner } from "../../helpers/cdp-evm-signer";

export type RunX402PayOptions = {
  url: string;
  method?: string;
  data?: string;
  query?: string;
  headers?: string;
  maxAmount?: bigint;
  correlationId?: string;
  /** Filter payment options by chain (e.g. base, base-sepolia). */
  chain?: string;
  /** Emit debug logs (address, headers sent on retry). */
  verbose?: boolean;
};

export type RunX402PayResult =
  | { status: number; body: unknown; headers: Record<string, string> }
  | { error: "not_authenticated" }
  | { error: "no_evm_account" }
  | { error: "invalid_url" }
  | { error: "request_failed"; message: string };

type PaymentRequirementsBody = {
  x402Version?: number;
  accepts?: unknown[];
  resource?: { url?: string; description?: string; mimeType?: string };
};

type AcceptItem = Record<string, unknown> & {
  scheme?: string;
  network?: string;
  amount?: string;
  maxAmountRequired?: string;
  resource?: string;
  description?: string;
  mimeType?: string;
};

const CHAIN_TO_EIP155: Record<string, string> = {
  "base-sepolia": "eip155:84532",
  base: "eip155:8453",
};

const normalizeAccept = (
  accept: AcceptItem,
  topLevelResource?: { url?: string; description?: string; mimeType?: string },
  useCaip2?: boolean
): AcceptItem => {
  const resource = topLevelResource ?? (accept.resource as Record<string, string> | undefined);
  const url = typeof resource?.url === "string" ? resource.url : "";
  const description = typeof resource?.description === "string" ? resource.description : "";
  const mimeType = typeof resource?.mimeType === "string" ? resource.mimeType : "application/json";

  let network: string | undefined =
    accept.network && EIP155_TO_CHAIN[String(accept.network)]
      ? EIP155_TO_CHAIN[String(accept.network)]
      : accept.network;
  if (useCaip2 && network && CHAIN_TO_EIP155[String(network)]) {
    network = CHAIN_TO_EIP155[String(network)];
  }

  return {
    ...accept,
    network,
    maxAmountRequired: accept.maxAmountRequired ?? accept.amount ?? "0",
    resource: typeof accept.resource === "string" ? accept.resource : url,
    description: accept.description ?? description,
    mimeType: accept.mimeType ?? mimeType,
  };
};

/**
 * Normalizes 402 responses so x402-fetch can parse them. Some servers put
 * payment requirements in the Payment-Required header instead of the body,
 * or use different field names (amount vs maxAmountRequired, eip155 network ids).
 */
const createFetchWith402Normalizer = (
  baseFetch: typeof fetch,
  chainFilter?: string
): typeof fetch => {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await baseFetch(input, init);
    if (response.status !== 402) {
      return response;
    }
    const prHeader = response.headers.get("payment-required");
    let body: PaymentRequirementsBody;
    try {
      const raw = await response.json();
      body = raw as PaymentRequirementsBody;
    } catch {
      body = {};
    }
    if (!Array.isArray(body.accepts) && prHeader) {
      try {
        const decoded = JSON.parse(
          Buffer.from(prHeader, "base64").toString("utf8")
        ) as
          | PaymentRequirementsBody
          | { paymentRequired?: PaymentRequirementsBody; accepts?: unknown[] };
        const pr =
          "accepts" in decoded && Array.isArray(decoded.accepts)
            ? (decoded as PaymentRequirementsBody)
            : "paymentRequired" in decoded
              ? decoded.paymentRequired
              : undefined;
        if (pr && Array.isArray(pr.accepts)) {
          body = {
            x402Version: pr.x402Version ?? 1,
            accepts: pr.accepts,
            resource: (pr as PaymentRequirementsBody).resource,
          };
        } else if (
          decoded &&
          Array.isArray((decoded as PaymentRequirementsBody).accepts)
        ) {
          body = decoded as PaymentRequirementsBody;
        }
      } catch {
        /* ignore */
      }
    }
    if (!Array.isArray(body.accepts)) {
      return response;
    }
    const useCaip2 = body.x402Version === 2;
    let normalizedAccepts = body.accepts.map((a) =>
      normalizeAccept(a as AcceptItem, body.resource, useCaip2)
    );
    if (chainFilter) {
      const target = chainFilter.toLowerCase();
      const targetCaip2 = CHAIN_TO_EIP155[target];
      normalizedAccepts = normalizedAccepts.filter((a) => {
        const n = String((a as AcceptItem).network ?? "").toLowerCase();
        return n === target || (targetCaip2 && n === targetCaip2);
      });
    }
    const normalizedBody = {
      x402Version: body.x402Version ?? 1,
      accepts: normalizedAccepts,
    };
    return new Response(JSON.stringify(normalizedBody), {
      status: 402,
      statusText: response.statusText,
      headers: response.headers,
    });
  };
};

const isValidUrl = (url: string): boolean => {
  if (
    url.includes(" ") ||
    url.includes(";") ||
    url.includes("|") ||
    url.includes("`") ||
    url.includes("$")
  ) {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

/**
 * Makes a paid x402 request to the given URL. Uses CDP fetchWithX402 to handle
 * 402 Payment Required and automatic USDC payment on Base.
 */
export const runX402Pay = async (
  options: RunX402PayOptions
): Promise<RunX402PayResult> => {
  const {
    url,
    method = "GET",
    data,
    query,
    headers: headersJson,
    maxAmount,
    correlationId,
    chain,
    verbose = false,
  } = options;

  if (!isValidUrl(url)) {
    return { error: "invalid_url" };
  }

  let requestUrl = url;
  if (query) {
    try {
      const params = JSON.parse(query) as Record<string, string>;
      const search = new URLSearchParams(params).toString();
      requestUrl = url.includes("?")
        ? `${url}&${search}`
        : `${url}?${search}`;
    } catch {
      return { error: "request_failed", message: "Invalid --query JSON" };
    }
  }

  const init: RequestInit = { method };
  const headers: Record<string, string> = { Accept: "application/json" };

  if (data) {
    try {
      JSON.parse(data);
      init.body = data;
      headers["Content-Type"] = "application/json";
    } catch {
      return { error: "request_failed", message: "Invalid --data JSON" };
    }
  }

  if (headersJson) {
    try {
      const custom = JSON.parse(headersJson) as Record<string, string>;
      Object.assign(headers, custom);
    } catch {
      return { error: "request_failed", message: "Invalid --headers JSON" };
    }
  }

  if (correlationId) {
    headers["X-Correlation-ID"] = correlationId;
  }

  init.headers = headers;

  try {
    const addressResult = await runAddress();
    if (addressResult.address === undefined) {
      return { error: addressResult.error };
    }

    if (verbose) {
      console.error("[pwal] Paying from:", addressResult.address);
    }

    const chainFilter = (chain ?? "base-sepolia").toLowerCase();
    const chainToCaip2: Record<string, string> = {
      "base-sepolia": "eip155:84532",
      base: "eip155:8453",
    };
    const targetNetwork = chainToCaip2[chainFilter] ?? `eip155:${chainFilter}`;

    const publicClient = getPublicClient(chainFilter);
    const signer = createCdpEvmSigner(
      addressResult.address as `0x${string}`,
      publicClient
    );
    const client = new x402Client();
    registerExactEvmScheme(client, {
      signer,
      networks: [targetNetwork as `eip155:${number}`],
      paymentRequirementsSelector: (
        _x402Version: number,
        accepts: PaymentRequirements[]
      ): PaymentRequirements => {
        const filtered = accepts.filter(
          (a: PaymentRequirements) =>
            String(a.network ?? "").toLowerCase() === chainFilter ||
            String(a.network ?? "").toLowerCase() === targetNetwork
        );
        return filtered[0] ?? accepts[0];
      },
    });

    const baseFetch = createFetchWith402Normalizer(fetch, chain);
    const fetchWithPayment = wrapFetchWithPayment(baseFetch, client);

    const response = await fetchWithPayment(requestUrl, init);

    if (response.status === 402) {
      let detail = "";
      try {
        const errBody = await response.json();
        const reason =
          (errBody as { reason?: string }).reason ??
          (errBody as { error?: string }).error ??
          (errBody as { message?: string }).message;
        if (reason) {
          detail = ` Server reason: ${String(reason)}`;
        } else if (typeof errBody === "object" && errBody !== null) {
          detail = ` Response: ${JSON.stringify(errBody)}`;
        }
      } catch {
        /* ignore */
      }
      return {
        error: "request_failed",
        message:
          `Payment was not accepted. The server returned 402 again.${detail} Check FACILITATOR_URL, wallet balance, and that the server's payTo address matches.`,
      };
    }

    const resHeaders: Record<string, string> = {};
    response.headers.forEach((v, k) => {
      resHeaders[k] = v;
    });

    let body: unknown;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      try {
        body = await response.json();
      } catch {
        body = await response.text();
      }
    } else {
      body = await response.text();
    }

    return {
      status: response.status,
      body,
      headers: resHeaders,
    };
  } catch (err) {
    if (verbose && err) {
      console.error("[pwal] Error details:", err);
      if (err instanceof Error && err.cause) {
        console.error("[pwal] Error cause:", err.cause);
      }
    }
    const msg = err instanceof Error ? err.message : String(err);
    const cause =
      err instanceof Error && err.cause instanceof Error
        ? err.cause.message
        : "";
    const fullMsg = verbose && cause ? `${msg} (cause: ${cause})` : msg;
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
    return { error: "request_failed", message: verbose ? fullMsg : msg };
  }
};
