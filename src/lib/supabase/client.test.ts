import { beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.fn();
const getCachedSupabaseConfigMock = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}));

vi.mock("@/lib/supabase/runtime-config", () => ({
  getCachedSupabaseConfig: () => getCachedSupabaseConfigMock(),
}));

describe("supabase client", () => {
  beforeEach(() => {
    vi.resetModules();
    createClientMock.mockReset();
    getCachedSupabaseConfigMock.mockReset();
    createClientMock.mockImplementation(() => ({ auth: {} }));
  });

  it("reuses the client for the same runtime config and resets cleanly", async () => {
    getCachedSupabaseConfigMock.mockReturnValue({
      url: "https://demo.supabase.co",
      publishableKey: "pk-demo",
    });

    const { getSupabaseClient, resetSupabaseClient } = await import(
      "@/lib/supabase/client"
    );

    const first = getSupabaseClient();
    const second = getSupabaseClient();

    expect(first).toBe(second);
    expect(createClientMock).toHaveBeenCalledTimes(1);

    resetSupabaseClient();
    const third = getSupabaseClient();

    expect(third).not.toBe(first);
    expect(createClientMock).toHaveBeenCalledTimes(2);
  });
});
