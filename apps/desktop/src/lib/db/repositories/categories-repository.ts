import { invoke } from "@tauri-apps/api/core"

export type Category = {
  id: string
  name: string
  slug: string
  parent_id: string | null
  description: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number | null
  metadata: string | null
  _status: string | null
  created_at: string | null
  updated_at: string | null
}

export type CreateCategoryDTO = {
  name: string
  slug: string
  parent_id?: string
  description?: string
  image_url?: string
  is_active?: boolean
  sort_order?: number
  metadata?: string
}

export type UpdateCategoryDTO = {
  id: string
  name?: string
  slug?: string
  parent_id?: string
  description?: string
  image_url?: string
  is_active?: boolean
  sort_order?: number
  metadata?: string
}

export const CategoriesRepository = {
  async listByShop(shopId: string): Promise<Category[]> {
    return invoke("list_categories_by_shop", { shopId })
  },

  async getById(id: string): Promise<Category | null> {
    return invoke("get_category", { id })
  },

  async create(payload: CreateCategoryDTO): Promise<Category> {
    return invoke("create_category", { payload })
  },

  async update(payload: UpdateCategoryDTO): Promise<Category> {
    return invoke("update_category", { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_category", { id })
  },
}
