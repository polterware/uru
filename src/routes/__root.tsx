import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";

import appCss from "../styles.css?url";
import { AppSidebar } from "@/components/app/app-sidebar";
import { BrandLockup } from "@/components/app/brand-lockup";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getTableConfig } from "@/lib/schema-registry";
import { getSession, signOut } from "@/lib/supabase/auth";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  refreshResolvedSupabaseConfig,
  subscribeToSupabaseConfigChanges,
  type RuntimeSupabaseConfig,
} from "@/lib/supabase/runtime-config";
import { checkForAppUpdate } from "@/lib/updater";

export const Route = createRootRoute({
  ssr: false,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "OPS",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/ops-logo.png",
      },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
});

function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [config, setConfig] = useState<RuntimeSupabaseConfig | null>(null);

  useEffect(() => {
    let ignore = false;

    void refreshResolvedSupabaseConfig().then((resolvedConfig) => {
      if (ignore) {
        return;
      }

      setConfig(resolvedConfig);
      setConfigLoading(false);
    });

    const unsubscribeConfig = subscribeToSupabaseConfigChanges((nextConfig) => {
      setConfig(nextConfig);
    });

    return () => {
      ignore = true;
      unsubscribeConfig();
    };
  }, []);

  useEffect(() => {
    if (!config) {
      setIsAuthenticated(false);
      return;
    }

    let mounted = true;
    const supabase = getSupabaseClient();
    const syncSession = async () => {
      try {
        const session = await getSession();
        if (mounted) {
          setIsAuthenticated(Boolean(session));
        }
      } catch {
        if (mounted) {
          setIsAuthenticated(false);
        }
      }
    };

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsAuthenticated(Boolean(session));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [config?.publishableKey, config?.url]);

  useEffect(() => {
    if (!isAuthenticated || !config) return;
    if (import.meta.env.DEV) return;

    void checkForAppUpdate().then((status) => {
      if (status.state === "available") {
        toast(`Update v${status.version} available`, {
          description: "Go to Settings to install it.",
          action: {
            label: "Settings",
            onClick: () => void navigate({ to: "/settings" }),
          },
          duration: 10000,
        });
      }
    });
  }, [isAuthenticated, config?.url]);

  const isLoginPage = location.pathname === "/login";
  const isOnboardingPage = location.pathname === "/onboarding";

  const pageTitle = useMemo(() => {
    if (location.pathname === "/settings") {
      return "Settings";
    }

    if (location.pathname === "/analytics") {
      return "Analytics";
    }

    if (location.pathname.startsWith("/tables/")) {
      const tableName = location.pathname.replace("/tables/", "");
      const tableConfig = getTableConfig(tableName);
      if (tableConfig) {
        return `${tableConfig.label} (${tableConfig.table})`;
      }

      return "Table";
    }

    return "OPS";
  }, [location.pathname]);

  if (configLoading) {
    return (
      <div className="bg-background text-foreground flex h-screen flex-col overflow-hidden">
        <div
          data-tauri-drag-region
          className="bg-background/95 supports-[backdrop-filter]:bg-background/80 h-6 w-full shrink-0 backdrop-blur"
        />

        <main className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center p-6">
          <div className="w-full rounded-xl border p-6">
            <BrandLockup
              size="sm"
              subtitle="Preparing your runtime connection and session bootstrap."
              className="mb-5"
            />
            <h1 className="text-lg font-semibold">Loading configuration</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Checking runtime configuration and bootstrap payload.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (isOnboardingPage) {
    return <Outlet />;
  }

  if (isLoginPage) {
    return (
      <div className="bg-background text-foreground flex h-screen flex-col overflow-hidden">
        <div
          data-tauri-drag-region
          className="bg-background/95 supports-[backdrop-filter]:bg-background/80 h-6 w-full shrink-0 backdrop-blur"
        />

        <main className="mx-auto w-full max-w-md flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-background text-foreground flex h-screen flex-col overflow-hidden">
        <div
          data-tauri-drag-region
          className="bg-background/95 supports-[backdrop-filter]:bg-background/80 h-6 w-full shrink-0 backdrop-blur"
        />

        <main className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center p-6">
          <div className="w-full rounded-xl border p-6">
            <BrandLockup
              size="sm"
              subtitle="Finish setup before opening the operations workspace."
              className="mb-5"
            />
            <h1 className="text-lg font-semibold">Supabase connection required</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Complete the runtime connection setup before using the app.
            </p>
            <div className="mt-4">
              <Button type="button" onClick={() => void navigate({ to: "/onboarding" })}>
                Set up connection
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground flex h-screen flex-col overflow-hidden">
      <div
        data-tauri-drag-region
        className="bg-background/95 supports-[backdrop-filter]:bg-background/80 h-6 w-full shrink-0 backdrop-blur"
      />

      <SidebarProvider defaultOpen className="flex-1 overflow-hidden">
        <AppSidebar pathname={location.pathname} />

        <SidebarInset>
          <header className="border-border bg-background/95 shrink-0 border-b backdrop-blur">
            <div className="flex w-full items-center justify-between gap-4 px-4 py-2 md:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{pageTitle}</p>
                  <p className="text-primary/70 hidden text-xs sm:block">
                    Schema-driven data console
                  </p>
                </div>
              </div>

              {isAuthenticated ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await signOut();
                    await navigate({ to: "/login" });
                  }}
                >
                  Sign out
                </Button>
              ) : (
                <Button asChild size="sm" variant="outline">
                  <Link to="/login">Sign in</Link>
                </Button>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="mx-auto w-full max-w-7xl p-6">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <HeadContent />
      </head>
      <body className="h-full">
        {children}
        <Toaster theme="dark" position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
