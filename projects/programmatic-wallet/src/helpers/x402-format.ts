import chalk from "chalk";

/**
 * Format USDC atomic units (6 decimals) to human-readable format.
 * Matches awal's formatUsdcAmount.
 */
export const formatUsdcAmount = (atomicUnits: number | string): string => {
  const units =
    typeof atomicUnits === "string" ? parseInt(atomicUnits, 10) : atomicUnits;
  const dollars = units / 1_000_000;
  const decimals = dollars < 0.01 && dollars > 0 ? 4 : 2;
  return `$${dollars.toFixed(decimals)} USDC`;
};

/**
 * Format a table for bazaar list (summary mode).
 * Matches awal's formatTable output.
 */
export const formatBazaarTable = (
  rows: Array<{
    resource: string;
    description: string;
    price: string;
    network: string;
  }>,
  colWidths = { resource: 50, description: 40, price: 12, network: 12 }
): string => {
  if (rows.length === 0) return "No data";
  const truncate = (s: string, w: number) =>
    s.length > w ? s.slice(0, w - 3) + "..." : s;
  const pad = (s: string, w: number) => s.padEnd(w);
  const header =
    chalk.bold(
      pad("Resource", colWidths.resource) +
        "  " +
        pad("Description", colWidths.description) +
        "  " +
        pad("Price", colWidths.price) +
        "  " +
        pad("Network", colWidths.network)
    ) +
    "\n" +
    "-".repeat(colWidths.resource) +
    "  " +
    "-".repeat(colWidths.description) +
    "  " +
    "-".repeat(colWidths.price) +
    "  " +
    "-".repeat(colWidths.network);
  const body = rows
    .map(
      (r) =>
        pad(truncate(r.resource, colWidths.resource), colWidths.resource) +
        "  " +
        pad(truncate(r.description, colWidths.description), colWidths.description) +
        "  " +
        pad(r.price, colWidths.price) +
        "  " +
        pad(r.network, colWidths.network)
    )
    .join("\n");
  return header + "\n" + body;
};

const isEmpty = (value: unknown): boolean => {
  if (value == null) return true;
  if (typeof value === "string" && value === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && Object.keys(value as object).length === 0)
    return true;
  return false;
};

const formatValue = (value: unknown): string =>
  typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);

/**
 * Print object fields (for details command). Matches awal's printFields.
 */
export const printFields = (
  obj: Record<string, unknown>,
  indent: string
): void => {
  for (const [key, value] of Object.entries(obj)) {
    if (isEmpty(value)) continue;
    const formatted = formatValue(value);
    if (formatted.includes("\n")) {
      console.log(`${indent}${chalk.bold(key)}:`);
      for (const line of formatted.split("\n")) {
        console.log(`${indent}  ${line}`);
      }
    } else {
      console.log(`${indent}${chalk.bold(key)}: ${formatted}`);
    }
  }
};
