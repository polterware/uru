import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/app/brand-lockup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  refreshResolvedSupabaseConfig,
  type RuntimeSupabaseConfig,
} from "@/lib/supabase/runtime-config";
import { getSession, signInWithPassword } from "@/lib/supabase/auth";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const config = await refreshResolvedSupabaseConfig();
    if (!config) {
      throw redirect({ to: "/onboarding" });
    }

    const session = await getSession();
    if (session) {
      throw redirect({ to: "/tables/$table", params: { table: "products" } });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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

    return () => {
      ignore = true;
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithPassword(email, password);
      await navigate({ to: "/tables/$table", params: { table: "products" } });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to sign in",
      );
    } finally {
      setLoading(false);
    }
  }

  if (configLoading) {
    return (
      <section className="mx-auto mt-20 w-full max-w-lg">
        <Card>
          <CardHeader className="space-y-4">
            <BrandLockup
              size="md"
              subtitle="Preparing the connection details for this OPS workspace."
            />
            <CardTitle className="text-xl">Loading connection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Checking runtime configuration and bootstrap payload.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-20 w-full max-w-sm space-y-3">
      <Card>
        <CardHeader className="space-y-4">
          <BrandLockup
            size="md"
            subtitle="Your self-hosted operations workspace"
          />
          <CardTitle className="text-xl">Sign in to Ops</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error ? <p className="text-destructive text-sm">{error}</p> : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-muted-foreground flex items-center justify-center gap-1.5 text-xs">
        <span className="truncate max-w-[220px]">{config?.url}</span>
        <span>&middot;</span>
        <button
          type="button"
          className="hover:text-foreground underline-offset-4 hover:underline"
          onClick={() => void navigate({ to: "/onboarding", search: { reconfigure: true } })}
        >
          Change
        </button>
      </div>
    </section>
  );
}
