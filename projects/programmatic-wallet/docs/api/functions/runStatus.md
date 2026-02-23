[**wal-sdk**](../README.md)

***

[wal-sdk](../README.md) / runStatus

# Function: runStatus()

> **runStatus**(): `Promise`\<[`RunStatusResult`](../type-aliases/RunStatusResult.md)\>

Defined in: [src/commands/status.ts:11](https://github.com/dentsusoken/vecrea-ai/blob/0eb9a22e94bada7f80d84a403a65048c4f8ff325/projects/programmatic-wallet/src/commands/status.ts#L11)

Runs the status check. Pure function - no console output, suitable for SDK usage.

## Returns

`Promise`\<[`RunStatusResult`](../type-aliases/RunStatusResult.md)\>

The current user or null if not authenticated
