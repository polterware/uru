import { invoke } from '@tauri-apps/api/core'
import type {
  TransactionItem,
  CreateTransactionItemDTO,
  UpdateTransactionItemDTO,
} from '@uru/types'

export const TransactionItemsRepository = {
  async list(): Promise<TransactionItem[]> {
    return invoke('list_transaction_items')
  },

  async getById(id: string): Promise<TransactionItem | null> {
    return invoke('get_transaction_item', { id })
  },

  async listByTransaction(transactionId: string): Promise<TransactionItem[]> {
    return invoke('list_transaction_items_by_transaction', { transactionId })
  },

  async create(payload: CreateTransactionItemDTO): Promise<TransactionItem> {
    return invoke('create_transaction_item', { payload })
  },

  async update(payload: UpdateTransactionItemDTO): Promise<TransactionItem> {
    return invoke('update_transaction_item', { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke('delete_transaction_item', { id })
  },
}
