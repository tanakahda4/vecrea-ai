[**wal-sdk**](../README.md)

***

[wal-sdk](../README.md) / RunBalanceResult

# Type Alias: RunBalanceResult

> **RunBalanceResult** = \{ `chain`: `string`; `ethWei`: `bigint`; `usdcRaw`: `bigint`; `wethRaw`: `bigint`; \} \| \{ `error`: `"not_authenticated"`; \} \| \{ `error`: `"no_evm_account"`; \} \| \{ `chain`: `string`; `error`: `"unsupported_chain"`; \}

Defined in: [src/commands/balance.ts:10](https://github.com/dentsusoken/vecrea-ai/blob/4250676ecea381199037768f398044ec7c7d1a6a/projects/programmatic-wallet/src/commands/balance.ts#L10)
