import { invoke } from '@tauri-apps/api/core'
import type { SettingsMap } from '@uru/types'

export const SettingsRepository = {
  async get(key: string): Promise<string | null> {
    return invoke('get_setting', { key })
  },

  async set(key: string, value: string): Promise<void> {
    return invoke('set_setting', { key, value })
  },

  async getAll(): Promise<SettingsMap> {
    return invoke('get_all_settings')
  },

  async delete(key: string): Promise<void> {
    return invoke('delete_setting', { key })
  },
}
