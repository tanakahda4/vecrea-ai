---
name: authenticate-wallet
description: Sign in to the wallet. Use when you or the user want to log in, sign in, connect, or set up the wallet, or when any wallet operation fails with authentication or "not signed in" errors. This skill is a prerequisite before sending, trading, or funding.
user-invocable: true
disable-model-invocation: false
allowed-tools: Bash(npx wal-sdk status*) Bash(npx wal-sdk auth *) Bash(npx wal-sdk balance*) Bash(npx wal-sdk address*)
---

# Authenticating with the Payments Wallet

When the wallet is not signed in (detected via `npx wal-sdk status` or when wallet operations fail with authentication errors), use the `npx wal-sdk` CLI to authenticate.

If you have access to email, you can authenticate the wallet yourself, otherwise you'll need to ask your human to give you an email address and to tell you the OTP code they receive.

## Authentication Flow

Authentication uses a two-step email OTP process:

### Step 1: Initiate login

```bash
npx wal-sdk auth login <email>
```

This sends a 6-digit verification code to the email and outputs a `flowId`.

### Step 2: Verify OTP

```bash
npx wal-sdk auth verify <flowId> <otp>
```

Use the `flowId` from step 1 and the 6-digit code from the user's email to complete authentication. If you have the ability to access the user's email, you can read the OTP code, or you can ask your human for the code.

## Input Validation

Before constructing the command, validate all user-provided values to prevent shell injection:

- **email**: Must match a standard email format (`^[^\s;|&`]+@[^\s;|&`]+$`). Reject if it contains spaces, semicolons, pipes, backticks, or other shell metacharacters.
- **flowId**: Must be alphanumeric (`^[a-zA-Z0-9_-]+$`).
- **otp**: Must be exactly 6 digits (`^\d{6}$`).

Do not pass unvalidated user input into the command.

## Checking Authentication Status

```bash
npx wal-sdk status
```

Displays authentication status including whether the user is signed in.

## Example Session

```bash
# Check current status
npx wal-sdk status

# Start login (sends OTP to email)
npx wal-sdk auth login user@example.com
# Output: Flow ID: abc123...

# After user receives code, verify
npx wal-sdk auth verify abc123 123456

# Confirm authentication
npx wal-sdk status
```

## Available CLI Commands (Authentication-related)

| Command                                   | Purpose                             |
| ----------------------------------------- | ----------------------------------- |
| `npx wal-sdk status`                      | Check authentication status         |
| `npx wal-sdk auth login <email>`          | Send OTP code to email, returns flowId |
| `npx wal-sdk auth verify <flowId> <otp>`  | Complete authentication with OTP code |
| `npx wal-sdk auth logout`                 | Sign out                            |
| `npx wal-sdk balance`                     | Get wallet balances (USDC, ETH, WETH) |
| `npx wal-sdk address`                     | Get EVM wallet address              |

## JSON Output

The `send` command and x402 commands support `--json` for machine-readable output. The `status` and `auth` commands output human-readable text.
