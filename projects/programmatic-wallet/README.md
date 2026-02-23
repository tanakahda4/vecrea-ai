# pwal

Programmatic wallet CLI using [@coinbase/cdp-core](https://www.npmjs.com/package/@coinbase/cdp-core) with TypeScript.

This project supports both **Web** and **CLI** usage. When running in Node.js (CLI), `localStorage` is emulated via [localstorage-polyfill](https://www.npmjs.com/package/localstorage-polyfill) so the CDP SDK can store tokens. In the browser, the native `window.localStorage` is used.

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

Run the CLI with:

```bash
npx pwal [command] [options]
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
| `faucet`                     | Show Base Sepolia faucet URL                                |
| `x402 bazaar search <query>` | Search x402 bazaar by keyword (supports --network, --chain) |
| `x402 bazaar list`           | List bazaar resources (supports --network, --chain)         |
| `x402 pay <url>`            | Make a paid x402 request with automatic USDC payment        |
| `x402 details <url>`        | Inspect payment requirements for an endpoint                |
| `x402 bazaar details <url>` | Same as x402 details (alias)                                |

### Examples

```bash
# Authentication
npx pwal auth login your@email.com
npx pwal auth verify <flow-id> <6-digit-code>
npx pwal auth logout

# Wallet
npx pwal status
npx pwal address
npx pwal balance                    # Base mainnet (default)
npx pwal balance --base-sepolia     # Base Sepolia testnet
npx pwal balance --chain base-sepolia
npx pwal faucet

# x402 Bazaar (discovery)
# Results are cached at ~/.config/pwal/bazaar/ (auto-refresh after 12h). On 429, cached data is used.
npx pwal x402 bazaar search "weather"
npx pwal x402 bazaar search "weather" --network base
npx pwal x402 bazaar search "sentiment" -k 10 --chain base-sepolia
npx pwal x402 bazaar list --network base
npx pwal x402 bazaar list --chain base-sepolia
npx pwal x402 bazaar list --full
npx pwal x402 details https://example.com/api/weather
npx pwal x402 bazaar details https://example.com/api/weather  # alias

# x402 Pay (requires auth, uses CDP fetchWithX402)
npx pwal x402 pay https://example.com/api/weather
npx pwal x402 pay https://example.com/api/sentiment -X POST -d '{"text": "I love this product"}'
npx pwal x402 pay https://example.com/api/data --max-amount 100000  # max $0.10
```

### Help

```bash
npx pwal --help
npx pwal balance --help
```
