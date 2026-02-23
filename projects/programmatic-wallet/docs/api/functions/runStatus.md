[**wal-sdk**](../README.md)

***

[wal-sdk](../README.md) / runStatus

# Function: runStatus()

> **runStatus**(): `Promise`\<[`RunStatusResult`](../type-aliases/RunStatusResult.md)\>

Defined in: [src/commands/status.ts:11](https://github.com/dentsusoken/vecrea-ai/blob/4250676ecea381199037768f398044ec7c7d1a6a/projects/programmatic-wallet/src/commands/status.ts#L11)

Runs the status check. Pure function - no console output, suitable for SDK usage.

## Returns

`Promise`\<[`RunStatusResult`](../type-aliases/RunStatusResult.md)\>

The current user or null if not authenticated
