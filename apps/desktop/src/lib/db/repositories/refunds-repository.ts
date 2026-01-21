import { invoke } from '@tauri-apps/api/core'
import type { Refund, CreateRefundDTO, UpdateRefundDTO } from '@uru/types'
import { REFUND_STATUSES, REFUND_REASONS } from '@uru/types'

export const RefundsRepository = {
  async list(): Promise<Refund[]> {
    return invoke('list_refunds')
  },

  async listByPayment(paymentId: string): Promise<Refund[]> {
    return invoke('list_refunds_by_payment', { paymentId })
  },

  async getById(id: string): Promise<Refund | null> {
    return invoke('get_refund', { id })
  },

  async create(payload: CreateRefundDTO): Promise<Refund> {
    return invoke('create_refund', { payload })
  },

  async update(payload: UpdateRefundDTO): Promise<Refund> {
    return invoke('update_refund', { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke('delete_refund', { id })
  },

  async updateStatus(id: string, status: string): Promise<Refund> {
    return invoke('update_refund_status', { id, status })
  },
}

export { REFUND_STATUSES, REFUND_REASONS }
