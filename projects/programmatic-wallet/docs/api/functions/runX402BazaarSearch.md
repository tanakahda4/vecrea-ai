[**pwal**](../README.md)

***

[pwal](../README.md) / runX402BazaarSearch

# Function: runX402BazaarSearch()

> **runX402BazaarSearch**(`options`): `Promise`\<[`RunX402BazaarSearchResult`](../type-aliases/RunX402BazaarSearchResult.md)\>

Defined in: [src/commands/x402/bazaar.ts:58](https://github.com/dentsusoken/vecrea-ai/blob/d7515fd128635d29a7e37d5e8a1f73fab8b6a37e/projects/programmatic-wallet/src/commands/x402/bazaar.ts#L58)

Search the x402 bazaar by keyword. Uses cached resources and filters client-side.
Cache at ~/.config/pwal/bazaar/, auto-refresh after 12 hours. On 429, uses cache if available.

## Parameters

### options

[`RunX402BazaarSearchOptions`](../type-aliases/RunX402BazaarSearchOptions.md)

## Returns

`Promise`\<[`RunX402BazaarSearchResult`](../type-aliases/RunX402BazaarSearchResult.md)\>
