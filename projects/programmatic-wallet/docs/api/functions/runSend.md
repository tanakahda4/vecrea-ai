[**wal-sdk**](../README.md)

***

[wal-sdk](../README.md) / runSend

# Function: runSend()

> **runSend**(`options`): `Promise`\<[`RunSendResult`](../type-aliases/RunSendResult.md)\>

Defined in: [src/commands/send.ts:83](https://github.com/dentsusoken/vecrea-ai/blob/0eb9a22e94bada7f80d84a403a65048c4f8ff325/projects/programmatic-wallet/src/commands/send.ts#L83)

Sends USDC to an address or ENS name. Signs with CDP and broadcasts via
our publicClient so --chain is respected (CDP sendEvmTransaction may
broadcast to wrong chain).

## Parameters

### options

[`RunSendOptions`](../type-aliases/RunSendOptions.md)

## Returns

`Promise`\<[`RunSendResult`](../type-aliases/RunSendResult.md)\>
