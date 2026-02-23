import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { homedir } from "os";
import { isNode } from "./env";

/** CDP refresh token key in localStorage. Used for auth persistence and logout. */
export const CDP_REFRESH_TOKEN_KEY = "cdp_refresh_token";

const getAuthStatePath = (): string => {
  const configDir = process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config");
  return join(configDir, "pwal", "auth-state.json");
};

/**
 * Restores cdp_refresh_token from persisted file. Call before initialize() when running in Node.js.
 * No-op in browser or when no persisted state exists.
 */
export const restoreAuthState = async (): Promise<void> => {
  if (!isNode || typeof globalThis.localStorage === "undefined") {
    return;
  }
  const path = getAuthStatePath();
  try {
    const data = await readFile(path, "utf-8");
    const state = JSON.parse(data) as Record<string, string>;
    const token = state[CDP_REFRESH_TOKEN_KEY];
    if (token) {
      globalThis.localStorage.setItem(CDP_REFRESH_TOKEN_KEY, token);
    }
  } catch {
    // File not found or invalid - ignore
  }
};

const waitForRefreshToken = async (): Promise<void> => {
  const intervalMs = 100;
  const maxWaitMs = 5000;
  const maxAttempts = maxWaitMs / intervalMs;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    if (globalThis.localStorage.getItem(CDP_REFRESH_TOKEN_KEY)) {
      return;
    }
  }
};

/**
 * Persists cdp_refresh_token to file. Call after successful auth or at end of command.
 * Waits until the token is written (SDK may write async).
 * Skips when token is not present (avoids overwriting with empty state).
 * No-op in browser.
 */
export const persistAuthState = async (): Promise<void> => {
  if (!isNode || typeof globalThis.localStorage === "undefined") {
    return;
  }
  await waitForRefreshToken();
  const token = globalThis.localStorage.getItem(CDP_REFRESH_TOKEN_KEY);
  if (!token) {
    return;
  }
  const path = getAuthStatePath();
  const state = { [CDP_REFRESH_TOKEN_KEY]: token };
  const dir = dirname(path);
  await mkdir(dir, { recursive: true });
  await writeFile(path, JSON.stringify(state), { mode: 0o600 });
};

/**
 * Clears persisted auth state (localStorage and file). Call after signOut when running in Node.js.
 * No-op in browser.
 */
export const clearAuthState = async (): Promise<void> => {
  if (typeof globalThis.localStorage !== "undefined") {
    globalThis.localStorage.removeItem(CDP_REFRESH_TOKEN_KEY);
  }
  if (!isNode) {
    return;
  }
  const path = getAuthStatePath();
  try {
    await unlink(path);
  } catch {
    // File not found - ignore
  }
};
