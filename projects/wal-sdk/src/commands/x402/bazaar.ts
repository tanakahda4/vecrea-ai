import { getResources } from "../../helpers/bazaar-cache";

export type DiscoveryResource = {
  resource: string;
  type: string;
  x402Version: number;
  accepts: Array<{
    scheme: string;
    network?: string;
    asset?: string;
    description?: string;
    maxAmountRequired?: string;
    payTo?: string;
    [key: string]: unknown;
  }>;
  lastUpdated: string;
  metadata?: Record<string, unknown>;
};

const normalizeNetwork = (n: string): string => {
  const lower = n.toLowerCase();
  if (lower === "eip155:8453" || lower === "base") return "base";
  if (lower === "eip155:84532" || lower === "base-sepolia") return "base-sepolia";
  return n;
};

const matchesNetwork = (resource: DiscoveryResource, network: string): boolean => {
  const target = normalizeNetwork(network);
  return resource.accepts.some((a) => {
    const n = normalizeNetwork(a.network ?? "");
    return n === target || a.network?.toLowerCase().includes(target);
  });
};

const matchesQuery = (resource: DiscoveryResource, query: string): boolean => {
  const q = query.toLowerCase();
  const desc = resource.accepts.map((a) => a.description ?? "").join(" ").toLowerCase();
  const resourceUrl = resource.resource.toLowerCase();
  return desc.includes(q) || resourceUrl.includes(q);
};

export type RunX402BazaarSearchOptions = {
  query: string;
  top?: number;
  forceRefresh?: boolean;
  network?: string;
};

export type RunX402BazaarSearchResult = {
  items: DiscoveryResource[];
  total: number;
};

/**
 * Search the x402 bazaar by keyword. Uses cached resources and filters client-side.
 * Cache at ~/.config/wal-sdk/bazaar/, auto-refresh after 12 hours. On 429, uses cache if available.
 */
export const runX402BazaarSearch = async (
  options: RunX402BazaarSearchOptions
): Promise<RunX402BazaarSearchResult> => {
  const { query, top = 5, network, forceRefresh = false } = options;
  const resources = (await getResources(forceRefresh)) as DiscoveryResource[];
  const matched = resources.filter(
    (r) =>
      matchesQuery(r, query) && (!network || matchesNetwork(r, network))
  );
  return {
    items: matched.slice(0, top),
    total: matched.length,
  };
};

export type RunX402BazaarListOptions = {
  network?: string;
  limit?: number;
  offset?: number;
  forceRefresh?: boolean;
};

export type RunX402BazaarListResult = {
  items: DiscoveryResource[];
  pagination: { limit: number; offset: number; total: number };
};

/**
 * List x402 bazaar resources. Uses cache; optionally filter by network.
 */
export const runX402BazaarList = async (
  options: RunX402BazaarListOptions = {}
): Promise<RunX402BazaarListResult> => {
  const { network, limit = 100, offset = 0, forceRefresh = false } = options;
  const resources = (await getResources(forceRefresh)) as DiscoveryResource[];
  const filtered = network
    ? resources.filter((r) => matchesNetwork(r, network))
    : resources;
  const items = filtered.slice(offset, offset + limit);
  return {
    items,
    pagination: {
      limit,
      offset,
      total: filtered.length,
    },
  };
};
