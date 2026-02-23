[**pwal**](../README.md)

***

[pwal](../README.md) / runForCli

# Function: runForCli()

> **runForCli**\<`T`\>(`fn`, `options?`): `Promise`\<`T`\>

Defined in: [src/helpers/runForCli.ts:14](https://github.com/dentsusoken/vecrea-ai/blob/d7515fd128635d29a7e37d5e8a1f73fab8b6a37e/projects/programmatic-wallet/src/helpers/runForCli.ts#L14)

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
