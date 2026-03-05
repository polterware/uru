import { Store } from '@tauri-apps/plugin-store'

export type LocalSettingValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: LocalSettingValue }
  | Array<LocalSettingValue>

let storeInstance: Store | null = null

async function getStore(): Promise<Store> {
  if (!storeInstance) {
    storeInstance = await Store.load('settings.json', { autoSave: true, defaults: {} })
  }
  return storeInstance
}

export const SettingsStore = {
  async get<T = LocalSettingValue>(key: string): Promise<T | null> {
    const store = await getStore()
    const value = await store.get<T>(key)
    return value ?? null
  },

  async set<T = LocalSettingValue>(key: string, value: T): Promise<void> {
    const store = await getStore()
    await store.set(key, value)
    await store.save()
  },

  async delete(key: string): Promise<void> {
    const store = await getStore()
    await store.delete(key)
    await store.save()
  },

  async getAll<T = LocalSettingValue>(): Promise<Record<string, T>> {
    const store = await getStore()
    const entries = await store.entries<T>()
    const settings: Record<string, T> = {}

    for (const [key, value] of entries) {
      if (value !== null && value !== undefined) {
        settings[key] = value
      }
    }

    return settings
  },

  async clear(): Promise<void> {
    const store = await getStore()
    await store.clear()
    await store.save()
  },

  async has(key: string): Promise<boolean> {
    const store = await getStore()
    return store.has(key)
  },
}
