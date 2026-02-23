[**wal-sdk**](../README.md)

***

[wal-sdk](../README.md) / runX402Details

# Function: runX402Details()

> **runX402Details**(`url`): `Promise`\<[`RunX402DetailsResult`](../type-aliases/RunX402DetailsResult.md)\>

Defined in: [src/commands/x402/details.ts:17](https://github.com/dentsusoken/vecrea-ai/blob/4250676ecea381199037768f398044ec7c7d1a6a/projects/programmatic-wallet/src/commands/x402/details.ts#L17)

Inspect an endpoint's x402 payment requirements without paying.
Tries each HTTP method until it gets a 402 response.

## Parameters

### url

`string`

## Returns

`Promise`\<[`RunX402DetailsResult`](../type-aliases/RunX402DetailsResult.md)\>
