import { invoke } from '@tauri-apps/api/core'
import type { Module } from '@uru/types'

export const ModulesRepository = {
  async list(): Promise<Module[]> {
    return invoke('list_modules')
  },

  async getById(id: string): Promise<Module | null> {
    return invoke('get_module', { id })
  },

  async getByCode(code: string): Promise<Module | null> {
    return invoke('get_module_by_code', { code })
  },

  async listByCategory(category: string): Promise<Module[]> {
    return invoke('list_modules_by_category', { category })
  },

  async listCore(): Promise<Module[]> {
    return invoke('list_core_modules')
  },
}
