[**wal-sdk**](../README.md)

***

[wal-sdk](../README.md) / RunSendResult

# Type Alias: RunSendResult

> **RunSendResult** = \{ `from`: `string`; `network`: `string`; `transactionHash`: `string`; \} \| \{ `error`: `"not_authenticated"`; \} \| \{ `error`: `"no_evm_account"`; \} \| \{ `error`: `"invalid_amount"`; `message`: `string`; \} \| \{ `error`: `"invalid_address"`; `message`: `string`; \} \| \{ `chain`: `string`; `error`: `"unsupported_chain"`; \} \| \{ `chain`: `string`; `error`: `"request_failed"`; `message`: `string`; \}

Defined in: [src/commands/send.ts:25](https://github.com/dentsusoken/vecrea-ai/blob/4250676ecea381199037768f398044ec7c7d1a6a/projects/programmatic-wallet/src/commands/send.ts#L25)
