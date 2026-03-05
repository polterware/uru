import { createFileRoute, redirect } from "@tanstack/react-router";

import { getSession } from "@/lib/supabase/auth";
import { refreshResolvedSupabaseConfig } from "@/lib/supabase/runtime-config";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const config = await refreshResolvedSupabaseConfig();
    if (!config) {
      throw redirect({ to: "/login" });
    }

    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }

    throw redirect({ to: "/tables/$table", params: { table: "products" } });
  },
});
