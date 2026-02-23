[**wal-sdk**](../README.md)

***

[wal-sdk](../README.md) / runSend

# Function: runSend()

> **runSend**(`options`): `Promise`\<[`RunSendResult`](../type-aliases/RunSendResult.md)\>

Defined in: [src/commands/send.ts:83](https://github.com/dentsusoken/vecrea-ai/blob/4250676ecea381199037768f398044ec7c7d1a6a/projects/programmatic-wallet/src/commands/send.ts#L83)

Sends USDC to an address or ENS name. Signs with CDP and broadcasts via
our publicClient so --chain is respected (CDP sendEvmTransaction may
broadcast to wrong chain).

## Parameters

### options

[`RunSendOptions`](../type-aliases/RunSendOptions.md)

## Returns

`Promise`\<[`RunSendResult`](../type-aliases/RunSendResult.md)\>
