# wal-sdk

Programmatic wallet using [@coinbase/cdp-core](https://www.npmjs.com/package/@coinbase/cdp-core) with TypeScript.

Use wal-sdk as a **CLI**, **SDK** (import and call from your code), **AI agent skill** (via SKILL.md in Cursor, Codex, CC, etc.), or in **cloud/serverless** environments (Vercel AI SDK and similar). When running in Node.js, `localStorage` is emulated via [localstorage-polyfill](https://www.npmjs.com/package/localstorage-polyfill) so the CDP SDK can store tokens. In the browser, the native `window.localStorage` is used.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set your CDP Project ID:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and replace `your-project-id` with your actual Project ID from the [CDP Portal](https://portal.cdp.coinbase.com).

## Usage

### CLI

Run the CLI with:

```bash
npx wal-sdk [command] [options]
```

### Commands

| Command                      | Description                                                 |
| ---------------------------- | ----------------------------------------------------------- |
| `auth login <email>`         | Sign in with email OTP                                      |
| `auth verify <flowId> <otp>` | Complete sign-in with verification code                     |
| `auth logout`                | Sign out                                                    |
| `status`                     | Show authentication status                                  |
| `address`                    | Show EVM address                                            |
| `balance`                    | Show wallet balances                                        |
| `send <amount> <to>`        | Send USDC to address or ENS                                |
| `faucet`                     | Show Base Sepolia faucet URL                                |
| `x402 bazaar search <query>` | Search x402 bazaar by keyword                               |
| `x402 bazaar list`           | List bazaar resources                                       |
| `x402 pay <url>`            | Make a paid x402 request with automatic USDC payment        |
| `x402 details <url>`        | Inspect payment requirements for an endpoint                |
| `x402 bazaar details <url>` | Same as x402 details (alias)                                |

### Options by Command

#### `auth login <email>`
| Argument | Description |
| -------- | ----------- |
| `email` | Your email address for OTP sign-in |

#### `auth verify <flowId> <otp>`
| Argument | Description |
| -------- | ----------- |
| `flowId` | Flow ID from the login step |
| `otp` | 6-digit verification code from email |

#### `balance`
| Option | Description |
| ------ | ----------- |
| `-c, --chain <chain>` | Chain to use (default: base). Choices: `base`, `base-sepolia` |
| `--base-sepolia` | Use Base Sepolia testnet |
| `--base` | Use Base mainnet |

#### `send <amount> <to>`
| Argument | Description |
| -------- | ----------- |
| `amount` | Amount as `$1.00`, `1.00`, or atomic units (e.g. `1000000` = $1.00) |
| `to` | Recipient address or ENS name (e.g. `vitalik.eth`) |

| Option | Description |
| ------ | ----------- |
| `-c, --chain <chain>` | Chain to use (default: base). Choices: `base`, `base-sepolia` |
| `--json` | Output as JSON |
| `-V, --verbose` | Print transaction details before sending |

#### `x402 bazaar search <query>`
| Argument | Description |
| -------- | ----------- |
| `query` | Search keyword |

| Option | Description |
| ------ | ----------- |
| `-k, --top <n>` | Number of results (default: 5) |
| `--network <network>` | Filter by network. Choices: `base`, `base-sepolia` |
| `-c, --chain <chain>` | Filter by chain (same as --network). Choices: `base`, `base-sepolia` |
| `--force-refresh` | Re-fetch from CDP API |
| `--json` | Output as JSON |

#### `x402 bazaar list`
| Option | Description |
| ------ | ----------- |
| `--network <network>` | Filter by network. Choices: `base`, `base-sepolia` |
| `-c, --chain <chain>` | Filter by chain (same as --network). Choices: `base`, `base-sepolia` |
| `--full` | Show complete details including schemas |
| `--json` | Output as JSON |

#### `x402 bazaar details <url>` / `x402 details <url>`
| Argument | Description |
| -------- | ----------- |
| `url` | x402 endpoint URL to inspect |

| Option | Description |
| ------ | ----------- |
| `--network <network>` | Filter payment options by network. Choices: `base`, `base-sepolia` |
| `-c, --chain <chain>` | Filter by chain (same as --network). Choices: `base`, `base-sepolia` |
| `--json` | Output as JSON |

#### `x402 pay <url>`
| Argument | Description |
| -------- | ----------- |
| `url` | Endpoint URL for paid request |

| Option | Description |
| ------ | ----------- |
| `-X, --method <method>` | HTTP method (default: GET) |
| `-d, --data <json>` | Request body as JSON string |
| `-q, --query <params>` | Query parameters as JSON string |
| `--headers <json>` | Custom HTTP headers as JSON string |
| `-m, --max-amount <amount>` | Max payment in USDC atomic units (1000000 = $1.00) |
| `--correlation-id <id>` | Group related operations |
| `--network <network>` | Filter payment options by network. Choices: `base`, `base-sepolia` |
| `-c, --chain <chain>` | Filter by chain (same as --network). Choices: `base`, `base-sepolia` |
| `--verbose` | Show debug output (address, payment headers) |
| `--json` | Output as JSON |

### Examples

```bash
# Authentication
npx wal-sdk auth login your@email.com
npx wal-sdk auth verify <flow-id> <6-digit-code>
npx wal-sdk auth logout

# Wallet
npx wal-sdk status
npx wal-sdk address
npx wal-sdk balance                    # Base mainnet (default)
npx wal-sdk balance --base-sepolia     # Base Sepolia testnet
npx wal-sdk balance --chain base-sepolia
npx wal-sdk send $1.00 0x...recipient...   # Send USDC (Base mainnet)
npx wal-sdk send 1000000 vitalik.eth       # Send 1 USDC to ENS
npx wal-sdk send $0.01 0x... -c base-sepolia  # Send on Base Sepolia
npx wal-sdk faucet

# x402 Bazaar (discovery)
# Results are cached at ~/.config/wal-sdk/bazaar/ (auto-refresh after 12h). On 429, cached data is used.
npx wal-sdk x402 bazaar search "weather"
npx wal-sdk x402 bazaar search "weather" --network base
npx wal-sdk x402 bazaar search "sentiment" -k 10 --chain base-sepolia
npx wal-sdk x402 bazaar list --network base
npx wal-sdk x402 bazaar list --chain base-sepolia
npx wal-sdk x402 bazaar list --full
npx wal-sdk x402 details https://example.com/api/weather
npx wal-sdk x402 bazaar details https://example.com/api/weather  # alias

# x402 Pay (requires auth, uses CDP fetchWithX402)
npx wal-sdk x402 pay https://example.com/api/weather
npx wal-sdk x402 pay https://example.com/api/sentiment -X POST -d '{"text": "I love this product"}'
npx wal-sdk x402 pay https://example.com/api/data --max-amount 100000  # max $0.10
npx wal-sdk x402 pay https://example.com/api/weather -c base-sepolia   # pay on Base Sepolia
```

### Help

```bash
npx wal-sdk --help
npx wal-sdk balance --help
```

### SDK / Programmatic

Import and call the run functions from your code:

```typescript
import { runAddress, runBalance, runSend, runX402Pay } from "wal-sdk";
```

See [API Documentation](./docs/api/README.md) for the full reference.

### AI Agents & Cloud

wal-sdk can be used in AI coding assistants (Cursor, Codex, CC) via SKILL.md, and in serverless/cloud environments (Vercel AI SDK, etc.). A separate project provides SKILL.md and deployment examples.
