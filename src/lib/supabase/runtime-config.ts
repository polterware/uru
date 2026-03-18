import { invoke, isTauri } from "@tauri-apps/api/core";
import { SettingsStore } from "@/lib/stores/settings-store";

const RUNTIME_CONFIG_KEY = "supabase.runtime.connection";
const BROWSER_CONFIG_KEY = "ops.supabase.runtime.connection";
const CONFIG_CHANGED_EVENT = "ops:supabase-config-changed";

export interface RuntimeSupabaseConfig {
  url: string;
  publishableKey: string;
  projectRef: string | null;
  updatedAt: string;
  source: "saved" | "bootstrap" | "env";
}

interface BootstrapSupabaseConfigPayload {
  url: string;
  publishableKey: string;
  projectRef?: string | null;
  updatedAt?: string;
  source?: string;
}

let cachedResolvedConfig: RuntimeSupabaseConfig | null | undefined;
let bootstrapSyncPromise: Promise<RuntimeSupabaseConfig | null> | null = null;

function normalizeSource(
  source: string | undefined,
  fallbackSource: RuntimeSupabaseConfig["source"],
): RuntimeSupabaseConfig["source"] {
  if (source === "saved" || source === "bootstrap" || source === "env") {
    return source;
  }

  if (source === "runtime") {
    return "saved";
  }

  return fallbackSource;
}

function normalizeConfig(
  config: BootstrapSupabaseConfigPayload,
  source: RuntimeSupabaseConfig["source"] = "saved",
): RuntimeSupabaseConfig {
  return {
    url: config.url.trim().replace(/\/$/, ""),
    publishableKey: config.publishableKey.trim(),
    projectRef: config.projectRef?.trim() || null,
    updatedAt: config.updatedAt ?? new Date().toISOString(),
    source: normalizeSource(config.source, source),
  };
}

function getEnvFallbackConfig(): RuntimeSupabaseConfig | null {
  if (isTauri() && !import.meta.env.DEV) {
    return null;
  }

  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const publishableKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim();

  if (!url || !publishableKey) {
    return null;
  }

  return normalizeConfig(
    {
      url,
      publishableKey,
      projectRef: null,
      source: "env",
    },
    "env",
  );
}

function emitConfigChanged(config: RuntimeSupabaseConfig | null): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(CONFIG_CHANGED_EVENT, {
      detail: config,
    }),
  );
}

async function readPersistedRuntimeConfig(): Promise<RuntimeSupabaseConfig | null> {
  if (isTauri()) {
    const value = await SettingsStore.get<RuntimeSupabaseConfig>(RUNTIME_CONFIG_KEY);
    return value ? normalizeConfig(value, value.source ?? "saved") : null;
  }

  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(BROWSER_CONFIG_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as BootstrapSupabaseConfigPayload;
    return normalizeConfig(parsed, parsed.source === "bootstrap" ? "bootstrap" : "saved");
  } catch {
    return null;
  }
}

async function persistRuntimeConfig(
  config: RuntimeSupabaseConfig,
): Promise<void> {
  if (isTauri()) {
    await SettingsStore.set(RUNTIME_CONFIG_KEY, config);
    return;
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(BROWSER_CONFIG_KEY, JSON.stringify(config));
  }
}

export async function consumeBootstrapSupabaseConfig(): Promise<RuntimeSupabaseConfig | null> {
  if (!isTauri()) {
    return null;
  }

  const payload = await invoke<BootstrapSupabaseConfigPayload | null>(
    "consume_supabase_bootstrap_payload",
  );

  if (!payload) {
    return null;
  }

  const normalized = normalizeConfig(payload, "bootstrap");
  await persistRuntimeConfig(normalized);
  cachedResolvedConfig = normalized;
  emitConfigChanged(normalized);
  return normalized;
}

export async function refreshResolvedSupabaseConfig(): Promise<RuntimeSupabaseConfig | null> {
  if (!bootstrapSyncPromise) {
    bootstrapSyncPromise = consumeBootstrapSupabaseConfig().finally(() => {
      bootstrapSyncPromise = null;
    });
  }

  await bootstrapSyncPromise;

  const persisted = await readPersistedRuntimeConfig();
  if (persisted) {
    cachedResolvedConfig = persisted;
    return persisted;
  }

  const envFallback = getEnvFallbackConfig();
  cachedResolvedConfig = envFallback;
  return envFallback;
}

export function getCachedSupabaseConfig(): RuntimeSupabaseConfig | null {
  if (cachedResolvedConfig !== undefined) {
    return cachedResolvedConfig;
  }

  const envFallback = getEnvFallbackConfig();
  cachedResolvedConfig = envFallback;
  return envFallback;
}

export async function saveRuntimeSupabaseConfig(
  config: BootstrapSupabaseConfigPayload,
): Promise<RuntimeSupabaseConfig> {
  const normalized = normalizeConfig(config, "saved");
  await persistRuntimeConfig(normalized);
  cachedResolvedConfig = normalized;
  emitConfigChanged(normalized);
  return normalized;
}

export async function clearRuntimeSupabaseConfig(): Promise<void> {
  if (isTauri()) {
    await SettingsStore.delete(RUNTIME_CONFIG_KEY);
  } else if (typeof window !== "undefined") {
    window.localStorage.removeItem(BROWSER_CONFIG_KEY);
  }

  cachedResolvedConfig = getEnvFallbackConfig();
  emitConfigChanged(cachedResolvedConfig);
}

export function subscribeToSupabaseConfigChanges(
  listener: (config: RuntimeSupabaseConfig | null) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<RuntimeSupabaseConfig | null>;
    listener(customEvent.detail ?? null);
  };

  window.addEventListener(CONFIG_CHANGED_EVENT, handler);
  return () => {
    window.removeEventListener(CONFIG_CHANGED_EVENT, handler);
  };
}
