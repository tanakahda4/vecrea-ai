# CDP Core Examples

CLI examples for trying [@coinbase/cdp-core](https://www.npmjs.com/package/@coinbase/cdp-core) with TypeScript.

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

```bash
npx tsx src/cli.ts
```

To run other scripts, add `import "./env-shim"` at the top (before any CDP imports) so `localStorage` is polyfilled in Node:

```bash
npx tsx src/xxx.ts
```
