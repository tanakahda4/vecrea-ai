[**pwal**](../README.md)

***

[pwal](../README.md) / runSend

# Function: runSend()

> **runSend**(`options`): `Promise`\<[`RunSendResult`](../type-aliases/RunSendResult.md)\>

Defined in: [src/commands/send.ts:83](https://github.com/dentsusoken/vecrea-ai/blob/d7515fd128635d29a7e37d5e8a1f73fab8b6a37e/projects/programmatic-wallet/src/commands/send.ts#L83)

Sends USDC to an address or ENS name. Signs with CDP and broadcasts via
our publicClient so --chain is respected (CDP sendEvmTransaction may
broadcast to wrong chain).

## Parameters

### options

[`RunSendOptions`](../type-aliases/RunSendOptions.md)

## Returns

`Promise`\<[`RunSendResult`](../type-aliases/RunSendResult.md)\>
