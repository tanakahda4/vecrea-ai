[**wal-sdk**](../README.md)

***

[wal-sdk](../README.md) / RunBalanceResult

# Type Alias: RunBalanceResult

> **RunBalanceResult** = \{ `chain`: `string`; `ethWei`: `bigint`; `usdcRaw`: `bigint`; `wethRaw`: `bigint`; \} \| \{ `error`: `"not_authenticated"`; \} \| \{ `error`: `"no_evm_account"`; \} \| \{ `chain`: `string`; `error`: `"unsupported_chain"`; \}

Defined in: [src/commands/balance.ts:10](https://github.com/dentsusoken/vecrea-ai/blob/1aa53cac93b5712bdce8becd33f3c12d00b3fd65/projects/wal-sdk/src/commands/balance.ts#L10)
