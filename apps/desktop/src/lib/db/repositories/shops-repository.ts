import { invoke } from '@tauri-apps/api/core'
import type { Shop, CreateShopDTO, UpdateShopDTO } from '@uru/types'

export const ShopsRepository = {
  async list(): Promise<Shop[]> {
    return invoke('list_shops')
  },

  async getById(id: string): Promise<Shop | null> {
    return invoke('get_shop', { id })
  },

  async create(payload: CreateShopDTO): Promise<Shop> {
    return invoke('create_shop', { payload })
  },

  async createFromTemplate(
    payload: CreateShopDTO,
    templateCode?: string,
  ): Promise<Shop> {
    return invoke('create_shop_from_template', {
      payload,
      template_code: templateCode,
    })
  },

  async update(payload: UpdateShopDTO): Promise<Shop> {
    return invoke('update_shop', { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke('delete_shop', { id })
  },
}
