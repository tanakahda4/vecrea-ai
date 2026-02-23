[**pwal**](../README.md)

***

[pwal](../README.md) / runX402Details

# Function: runX402Details()

> **runX402Details**(`url`): `Promise`\<[`RunX402DetailsResult`](../type-aliases/RunX402DetailsResult.md)\>

Defined in: [src/commands/x402/details.ts:17](https://github.com/dentsusoken/vecrea-ai/blob/d7515fd128635d29a7e37d5e8a1f73fab8b6a37e/projects/programmatic-wallet/src/commands/x402/details.ts#L17)

Inspect an endpoint's x402 payment requirements without paying.
Tries each HTTP method until it gets a 402 response.

## Parameters

### url

`string`

## Returns

`Promise`\<[`RunX402DetailsResult`](../type-aliases/RunX402DetailsResult.md)\>
