[**pwal**](../README.md)

***

[pwal](../README.md) / RunSendResult

# Type Alias: RunSendResult

> **RunSendResult** = \{ `from`: `string`; `network`: `string`; `transactionHash`: `string`; \} \| \{ `error`: `"not_authenticated"`; \} \| \{ `error`: `"no_evm_account"`; \} \| \{ `error`: `"invalid_amount"`; `message`: `string`; \} \| \{ `error`: `"invalid_address"`; `message`: `string`; \} \| \{ `chain`: `string`; `error`: `"unsupported_chain"`; \} \| \{ `chain`: `string`; `error`: `"request_failed"`; `message`: `string`; \}

Defined in: [src/commands/send.ts:25](https://github.com/dentsusoken/vecrea-ai/blob/d7515fd128635d29a7e37d5e8a1f73fab8b6a37e/projects/programmatic-wallet/src/commands/send.ts#L25)
