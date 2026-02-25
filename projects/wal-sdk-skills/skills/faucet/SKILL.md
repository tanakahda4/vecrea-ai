---
name: faucet
description: Get free testnet tokens (ETH, USDC) on Base Sepolia. Use when the user wants to fund their testnet wallet, get faucet tokens, or needs test USDC/ETH for Base Sepolia development or testing.
user-invocable: true
disable-model-invocation: false
allowed-tools: Bash(npx wal-sdk status*) Bash(npx wal-sdk address*) Bash(npx wal-sdk balance*) Bash(npx wal-sdk faucet*)
---

# Base Sepolia Faucet

Get free testnet tokens (ETH and USDC) on Base Sepolia for development and testing.

## Prerequisites

The wallet must be authenticated. Check status with:

```bash
npx wal-sdk status
```

If not authenticated, refer to the `authenticate-wallet` skill.

## Get Faucet URL

```bash
npx wal-sdk faucet
```

This outputs the CDP faucet URL. If authenticated, the URL includes your wallet address as a query parameter so tokens are sent directly to your wallet.

## Using the Faucet

1. Run `npx wal-sdk faucet` to get the URL
2. Open the URL in a browser (or share it with the user)
3. On the faucet page, select ETH or USDC
4. Complete the claim to receive testnet tokens

## Verify Balance

After claiming, check your balance:

```bash
npx wal-sdk balance --base-sepolia
```

## Notes

- Faucet is for Base Sepolia testnet only (not mainnet)
- Tokens have no real value; they are for testing
- Rate limits may apply on the faucet
- If the URL does not include an address, the user can paste their address on the faucet page (get it with `npx wal-sdk address`)
