[**wal-sdk**](../README.md)

***

[wal-sdk](../README.md) / runFaucet

# Function: runFaucet()

> **runFaucet**(): `Promise`\<[`RunFaucetResult`](../type-aliases/RunFaucetResult.md)\>

Defined in: [src/commands/faucet.ts:15](https://github.com/dentsusoken/vecrea-ai/blob/4250676ecea381199037768f398044ec7c7d1a6a/projects/programmatic-wallet/src/commands/faucet.ts#L15)

Runs the faucet URL fetch. Pure function - no console output, suitable for SDK usage.
Returns the faucet URL with address query param if the user is authenticated and has an EVM account.

## Returns

`Promise`\<[`RunFaucetResult`](../type-aliases/RunFaucetResult.md)\>

The faucet URL (and error if address could not be resolved)
