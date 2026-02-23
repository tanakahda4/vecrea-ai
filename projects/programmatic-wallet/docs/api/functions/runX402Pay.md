[**wal-sdk**](../README.md)

***

[wal-sdk](../README.md) / runX402Pay

# Function: runX402Pay()

> **runX402Pay**(`options`): `Promise`\<[`RunX402PayResult`](../type-aliases/RunX402PayResult.md)\>

Defined in: [src/commands/x402/pay.ts:83](https://github.com/dentsusoken/vecrea-ai/blob/0eb9a22e94bada7f80d84a403a65048c4f8ff325/projects/programmatic-wallet/src/commands/x402/pay.ts#L83)

Makes a paid x402 request. Uses CDP signer + x402 client like the standard sample,
with automatic USDC payment on Base.

## Parameters

### options

[`RunX402PayOptions`](../type-aliases/RunX402PayOptions.md)

## Returns

`Promise`\<[`RunX402PayResult`](../type-aliases/RunX402PayResult.md)\>
