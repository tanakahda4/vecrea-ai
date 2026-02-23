[**wal-sdk**](../README.md)

***

[wal-sdk](../README.md) / RunSendResult

# Type Alias: RunSendResult

> **RunSendResult** = \{ `from`: `string`; `network`: `string`; `transactionHash`: `string`; \} \| \{ `error`: `"not_authenticated"`; \} \| \{ `error`: `"no_evm_account"`; \} \| \{ `error`: `"invalid_amount"`; `message`: `string`; \} \| \{ `error`: `"invalid_address"`; `message`: `string`; \} \| \{ `chain`: `string`; `error`: `"unsupported_chain"`; \} \| \{ `chain`: `string`; `error`: `"request_failed"`; `message`: `string`; \}

Defined in: [src/commands/send.ts:25](https://github.com/dentsusoken/vecrea-ai/blob/0eb9a22e94bada7f80d84a403a65048c4f8ff325/projects/programmatic-wallet/src/commands/send.ts#L25)
