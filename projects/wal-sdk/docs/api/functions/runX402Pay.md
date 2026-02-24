[**wal-sdk**](../README.md)

***

[wal-sdk](../README.md) / runX402Pay

# Function: runX402Pay()

> **runX402Pay**(`options`): `Promise`\<[`RunX402PayResult`](../type-aliases/RunX402PayResult.md)\>

Defined in: [src/commands/x402/pay.ts:83](https://github.com/dentsusoken/vecrea-ai/blob/1aa53cac93b5712bdce8becd33f3c12d00b3fd65/projects/wal-sdk/src/commands/x402/pay.ts#L83)

Makes a paid x402 request. Uses CDP signer + x402 client like the standard sample,
with automatic USDC payment on Base.

## Parameters

### options

[`RunX402PayOptions`](../type-aliases/RunX402PayOptions.md)

## Returns

`Promise`\<[`RunX402PayResult`](../type-aliases/RunX402PayResult.md)\>
