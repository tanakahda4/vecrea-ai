[**wal-sdk**](../README.md)

***

[wal-sdk](../README.md) / runSend

# Function: runSend()

> **runSend**(`options`): `Promise`\<[`RunSendResult`](../type-aliases/RunSendResult.md)\>

Defined in: [src/commands/send.ts:83](https://github.com/dentsusoken/vecrea-ai/blob/1aa53cac93b5712bdce8becd33f3c12d00b3fd65/projects/wal-sdk/src/commands/send.ts#L83)

Sends USDC to an address or ENS name. Signs with CDP and broadcasts via
our publicClient so --chain is respected (CDP sendEvmTransaction may
broadcast to wrong chain).

## Parameters

### options

[`RunSendOptions`](../type-aliases/RunSendOptions.md)

## Returns

`Promise`\<[`RunSendResult`](../type-aliases/RunSendResult.md)\>
