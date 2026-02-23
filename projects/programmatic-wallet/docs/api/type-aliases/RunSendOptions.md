[**pwal**](../README.md)

***

[pwal](../README.md) / RunSendOptions

# Type Alias: RunSendOptions

> **RunSendOptions** = `object`

Defined in: [src/commands/send.ts:14](https://github.com/dentsusoken/vecrea-ai/blob/d7515fd128635d29a7e37d5e8a1f73fab8b6a37e/projects/programmatic-wallet/src/commands/send.ts#L14)

## Properties

### amount

> **amount**: `string`

Defined in: [src/commands/send.ts:16](https://github.com/dentsusoken/vecrea-ai/blob/d7515fd128635d29a7e37d5e8a1f73fab8b6a37e/projects/programmatic-wallet/src/commands/send.ts#L16)

Amount as $1.00 or atomic units (e.g. 1000000).

***

### chain?

> `optional` **chain**: `string`

Defined in: [src/commands/send.ts:20](https://github.com/dentsusoken/vecrea-ai/blob/d7515fd128635d29a7e37d5e8a1f73fab8b6a37e/projects/programmatic-wallet/src/commands/send.ts#L20)

Chain (default: base).

***

### to

> **to**: `string`

Defined in: [src/commands/send.ts:18](https://github.com/dentsusoken/vecrea-ai/blob/d7515fd128635d29a7e37d5e8a1f73fab8b6a37e/projects/programmatic-wallet/src/commands/send.ts#L18)

Recipient address or ENS name.

***

### verbose?

> `optional` **verbose**: `boolean`

Defined in: [src/commands/send.ts:22](https://github.com/dentsusoken/vecrea-ai/blob/d7515fd128635d29a7e37d5e8a1f73fab8b6a37e/projects/programmatic-wallet/src/commands/send.ts#L22)

Print transaction details before sending.
