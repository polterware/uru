import { invoke } from '@tauri-apps/api/core'
import type {
  CustomerAddress,
  CreateCustomerAddressDTO,
  UpdateCustomerAddressDTO,
} from '@uru/types'

export const CustomerAddressesRepository = {
  async list(): Promise<CustomerAddress[]> {
    return invoke('list_customer_addresses')
  },

  async listByCustomer(customerId: string): Promise<CustomerAddress[]> {
    return invoke('list_customer_addresses_by_customer', { customerId })
  },

  async getById(id: string): Promise<CustomerAddress | null> {
    return invoke('get_customer_address', { id })
  },

  async create(payload: CreateCustomerAddressDTO): Promise<CustomerAddress> {
    return invoke('create_customer_address', { payload })
  },

  async update(payload: UpdateCustomerAddressDTO): Promise<CustomerAddress> {
    return invoke('update_customer_address', { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke('delete_customer_address', { id })
  },
}
