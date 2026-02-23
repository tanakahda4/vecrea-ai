[**pwal**](../README.md)

***

[pwal](../README.md) / RunBalanceResult

# Type Alias: RunBalanceResult

> **RunBalanceResult** = \{ `chain`: `string`; `ethWei`: `bigint`; `usdcRaw`: `bigint`; `wethRaw`: `bigint`; \} \| \{ `error`: `"not_authenticated"`; \} \| \{ `error`: `"no_evm_account"`; \} \| \{ `chain`: `string`; `error`: `"unsupported_chain"`; \}

Defined in: [src/commands/balance.ts:10](https://github.com/dentsusoken/vecrea-ai/blob/d7515fd128635d29a7e37d5e8a1f73fab8b6a37e/projects/programmatic-wallet/src/commands/balance.ts#L10)
