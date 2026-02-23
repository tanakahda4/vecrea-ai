[**pwal**](../README.md)

***

[pwal](../README.md) / runStatus

# Function: runStatus()

> **runStatus**(): `Promise`\<[`RunStatusResult`](../type-aliases/RunStatusResult.md)\>

Defined in: [src/commands/status.ts:11](https://github.com/dentsusoken/vecrea-ai/blob/d7515fd128635d29a7e37d5e8a1f73fab8b6a37e/projects/programmatic-wallet/src/commands/status.ts#L11)

Runs the status check. Pure function - no console output, suitable for SDK usage.

## Returns

`Promise`\<[`RunStatusResult`](../type-aliases/RunStatusResult.md)\>

The current user or null if not authenticated
