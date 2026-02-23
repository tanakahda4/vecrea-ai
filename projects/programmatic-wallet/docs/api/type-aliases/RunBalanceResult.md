[**wal-sdk**](../README.md)

***

[wal-sdk](../README.md) / RunBalanceResult

# Type Alias: RunBalanceResult

> **RunBalanceResult** = \{ `chain`: `string`; `ethWei`: `bigint`; `usdcRaw`: `bigint`; `wethRaw`: `bigint`; \} \| \{ `error`: `"not_authenticated"`; \} \| \{ `error`: `"no_evm_account"`; \} \| \{ `chain`: `string`; `error`: `"unsupported_chain"`; \}

Defined in: [src/commands/balance.ts:10](https://github.com/dentsusoken/vecrea-ai/blob/0eb9a22e94bada7f80d84a403a65048c4f8ff325/projects/programmatic-wallet/src/commands/balance.ts#L10)
