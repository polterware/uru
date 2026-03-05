import { beforeEach, describe, expect, it, vi } from "vitest";

const invokeMock = vi.fn();
const settingsGetMock = vi.fn();
const settingsSetMock = vi.fn();
const settingsDeleteMock = vi.fn();

vi.mock("@tauri-apps/api/core", () => ({
  isTauri: () => true,
  invoke: (...args: unknown[]) => invokeMock(...args),
}));

vi.mock("@/lib/stores/settings-store", () => ({
  SettingsStore: {
    get: (...args: unknown[]) => settingsGetMock(...args),
    set: (...args: unknown[]) => settingsSetMock(...args),
    delete: (...args: unknown[]) => settingsDeleteMock(...args),
  },
}));

describe("runtime supabase config", () => {
  beforeEach(() => {
    vi.resetModules();
    invokeMock.mockReset();
    settingsGetMock.mockReset();
    settingsSetMock.mockReset();
    settingsDeleteMock.mockReset();

    const eventTarget = new EventTarget();
    vi.stubGlobal(
      "window",
      Object.assign(eventTarget, {
        localStorage: {
          getItem: vi.fn(),
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
      }),
    );
  });

  it("consumes bootstrap payload and persists it to the runtime store", async () => {
    invokeMock.mockResolvedValue({
      url: "https://demo.supabase.co",
      publishableKey: "pk-demo",
      projectRef: "demo",
      updatedAt: "2026-03-05T00:00:00.000Z",
    });
    settingsGetMock.mockResolvedValue(null);

    const { refreshResolvedSupabaseConfig } = await import(
      "@/lib/supabase/runtime-config"
    );

    const config = await refreshResolvedSupabaseConfig();

    expect(config).toEqual({
      url: "https://demo.supabase.co",
      publishableKey: "pk-demo",
      projectRef: "demo",
      updatedAt: "2026-03-05T00:00:00.000Z",
      source: "runtime",
    });
    expect(invokeMock).toHaveBeenCalledWith(
      "consume_supabase_bootstrap_payload",
    );
    expect(settingsSetMock).toHaveBeenCalledWith(
      "supabase.runtime.connection",
      expect.objectContaining({
        url: "https://demo.supabase.co",
        publishableKey: "pk-demo",
      }),
    );
  });
});
