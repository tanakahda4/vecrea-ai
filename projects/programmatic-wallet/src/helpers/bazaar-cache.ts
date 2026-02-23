import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export type CachedDiscoveryResource = {
  resource: string;
  type: string;
  x402Version: number;
  accepts: Array<Record<string, unknown>>;
  lastUpdated: string;
  metadata?: Record<string, unknown>;
};

const STALE_HOURS = 12;

const getCacheDir = (): string =>
  join(homedir(), ".config", "wal-sdk", "bazaar");

const getCachePath = (): string => join(getCacheDir(), "resources.json");

type CacheData = {
  fetchedAt: string;
  resources: CachedDiscoveryResource[];
};

export const loadCache = (): CacheData | null => {
  const cachePath = getCachePath();
  if (!existsSync(cachePath)) return null;
  try {
    const raw = readFileSync(cachePath, "utf-8");
    return JSON.parse(raw) as CacheData;
  } catch {
    return null;
  }
};

export const saveCache = (resources: CachedDiscoveryResource[]): void => {
  const dir = getCacheDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const cache: CacheData = {
    fetchedAt: new Date().toISOString(),
    resources,
  };
  writeFileSync(getCachePath(), JSON.stringify(cache, null, 2), "utf-8");
};

export const isCacheStale = (cache: CacheData): boolean => {
  const fetchedAt = new Date(cache.fetchedAt).getTime();
  const now = Date.now();
  return now - fetchedAt > STALE_HOURS * 60 * 60 * 1000;
};

export const fetchAllResources = async (): Promise<CachedDiscoveryResource[]> => {
  const CDP_URL =
    "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources";
  const all: CachedDiscoveryResource[] = [];
  let offset = 0;
  const pageSize = 100;

  while (true) {
    const url = `${CDP_URL}?limit=${pageSize}&offset=${offset}`;
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 429 && all.length > 0) {
        break;
      }
      if (res.status === 429) {
        throw new Error("CDP API returned 429");
      }
      throw new Error(`CDP API error: ${res.status}`);
    }
    const body = (await res.json()) as {
      items: CachedDiscoveryResource[];
      pagination: { total: number };
    };
    all.push(...body.items);
    if (all.length >= body.pagination.total || body.items.length < pageSize) {
      break;
    }
    offset += pageSize;
  }
  return all;
};

/**
 * Get bazaar resources. Uses cache if fresh; otherwise fetches from CDP API.
 * On 429, falls back to cache if available.
 */
export const getResources = async (
  forceRefresh: boolean
): Promise<CachedDiscoveryResource[]> => {
  if (!forceRefresh) {
    const cache = loadCache();
    if (cache && !isCacheStale(cache)) {
      return cache.resources;
    }
  }
  try {
    const resources = await fetchAllResources();
    saveCache(resources);
    return resources;
  } catch (err) {
    if (
      err instanceof Error &&
      err.message === "CDP API returned 429"
    ) {
      const cache = loadCache();
      if (cache?.resources.length) {
        return cache.resources;
      }
    }
    throw err;
  }
};
