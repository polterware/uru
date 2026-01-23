import { Store } from "@tauri-apps/plugin-store";

// Type-safe settings keys
export type SettingKey =
  | "organization_name"
  | "owner_email"
  | "server_port"
  | "server_protocol";

export interface AppSettings {
  organization_name?: string;
  owner_email?: string;
  server_port?: string;
  server_protocol?: string;
}

// Singleton store instance
let storeInstance: Store | null = null;

async function getStore(): Promise<Store> {
  if (!storeInstance) {
    storeInstance = await Store.load("settings.json", { autoSave: true });
  }
  return storeInstance;
}

/**
 * Settings Store using @tauri-apps/plugin-store
 * Provides persistent key-value storage for app settings
 */
export const SettingsStore = {
  /**
   * Get a single setting value
   */
  async get<T = string>(key: SettingKey): Promise<T | null> {
    const store = await getStore();
    return store.get<T>(key);
  },

  /**
   * Set a single setting value
   */
  async set<T = string>(key: SettingKey, value: T): Promise<void> {
    const store = await getStore();
    await store.set(key, value);
    await store.save();
  },

  /**
   * Delete a setting
   */
  async delete(key: SettingKey): Promise<void> {
    const store = await getStore();
    await store.delete(key);
    await store.save();
  },

  /**
   * Get all settings as an object
   */
  async getAll(): Promise<AppSettings> {
    const store = await getStore();
    const entries = await store.entries<string>();
    const settings: AppSettings = {};

    for (const [key, value] of entries) {
      if (value !== null && value !== undefined) {
        settings[key as SettingKey] = value;
      }
    }

    return settings;
  },

  /**
   * Clear all settings
   */
  async clear(): Promise<void> {
    const store = await getStore();
    await store.clear();
    await store.save();
  },

  /**
   * Check if a setting exists
   */
  async has(key: SettingKey): Promise<boolean> {
    const store = await getStore();
    return store.has(key);
  },
};
