[**pwal**](../README.md)

***

[pwal](../README.md) / runX402Pay

# Function: runX402Pay()

> **runX402Pay**(`options`): `Promise`\<[`RunX402PayResult`](../type-aliases/RunX402PayResult.md)\>

Defined in: [src/commands/x402/pay.ts:83](https://github.com/dentsusoken/vecrea-ai/blob/d7515fd128635d29a7e37d5e8a1f73fab8b6a37e/projects/programmatic-wallet/src/commands/x402/pay.ts#L83)

Makes a paid x402 request. Uses CDP signer + x402 client like the standard sample,
with automatic USDC payment on Base.

## Parameters

### options

[`RunX402PayOptions`](../type-aliases/RunX402PayOptions.md)

## Returns

`Promise`\<[`RunX402PayResult`](../type-aliases/RunX402PayResult.md)\>
