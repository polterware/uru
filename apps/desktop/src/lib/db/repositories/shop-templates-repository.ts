import { invoke } from '@tauri-apps/api/core'
import type { ShopTemplate } from '@uru/types'

export const ShopTemplatesRepository = {
  async list(): Promise<ShopTemplate[]> {
    return invoke('list_shop_templates')
  },

  async getById(id: string): Promise<ShopTemplate | null> {
    return invoke('get_shop_template', { id })
  },

  async getByCode(code: string): Promise<ShopTemplate | null> {
    return invoke('get_shop_template_by_code', { code })
  },

  async listByCategory(category: string): Promise<ShopTemplate[]> {
    return invoke('list_shop_templates_by_category', { category })
  },
}
