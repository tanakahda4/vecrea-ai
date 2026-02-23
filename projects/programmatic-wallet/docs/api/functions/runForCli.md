[**wal-sdk**](../README.md)

***

[wal-sdk](../README.md) / runForCli

# Function: runForCli()

> **runForCli**\<`T`\>(`fn`, `options?`): `Promise`\<`T`\>

Defined in: [src/helpers/runForCli.ts:14](https://github.com/dentsusoken/vecrea-ai/blob/4250676ecea381199037768f398044ec7c7d1a6a/projects/programmatic-wallet/src/helpers/runForCli.ts#L14)

Runs CLI setup (restore auth state + initialize CDP), executes the given command,
then persists auth state. Use this to wrap all command execution in the CLI.

## Type Parameters

### T

`T`

## Parameters

### fn

() => `Promise`\<`T`\>

### options?

[`RunForCliOptions`](../type-aliases/RunForCliOptions.md) = `{}`

## Returns

`Promise`\<`T`\>
