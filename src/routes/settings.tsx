import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { SupabaseConnectionForm } from "@/components/app/supabase-connection-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SettingsStore } from "@/lib/stores/settings-store";
import { getUser, getUserRoles } from "@/lib/supabase/auth";
import { resetSupabaseClient } from "@/lib/supabase/client";
import {
  clearRuntimeSupabaseConfig,
  refreshResolvedSupabaseConfig,
  saveRuntimeSupabaseConfig,
  type RuntimeSupabaseConfig,
} from "@/lib/supabase/runtime-config";

export const Route = createFileRoute("/settings")({
  beforeLoad: async () => {
    const config = await refreshResolvedSupabaseConfig();
    if (!config) {
      throw redirect({ to: "/login" });
    }

    const user = await getUser();
    if (!user) {
      throw redirect({ to: "/login" });
    }
  },
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [roles, setRoles] = useState<Array<string>>([]);
  const [settingKey, setSettingKey] = useState("dashboard.default_range");
  const [settingValue, setSettingValue] = useState('{"days":30}');
  const [connectionConfig, setConnectionConfig] =
    useState<RuntimeSupabaseConfig | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadIdentity() {
      try {
        const user = await getUser();
        if (!user) {
          await navigate({ to: "/login" });
          return;
        }

        const userRoles = await getUserRoles(user.id);
        const resolvedConfig = await refreshResolvedSupabaseConfig();

        if (!ignore) {
          setUserEmail(user.email ?? null);
          setRoles(userRoles);
          setConnectionConfig(resolvedConfig);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load profile",
          );
        }
      }
    }

    void loadIdentity();

    return () => {
      ignore = true;
    };
  }, []);

  async function onSaveSetting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const parsed = JSON.parse(settingValue);
      await SettingsStore.set(settingKey, parsed);
      setMessage("Setting saved locally (Tauri Store)");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save local setting",
      );
    }
  }

  async function onLoadSetting() {
    setMessage(null);
    setError(null);

    try {
      const value = await SettingsStore.get<unknown>(settingKey);
      if (value === null) {
        setMessage("No local value found for this key");
        return;
      }

      setSettingValue(JSON.stringify(value, null, 2));
      setMessage("Local setting loaded");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load local setting",
      );
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Local desktop settings via Tauri Store (not persisted in Supabase).
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Session Context</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p>User: {userEmail ?? "Unknown"}</p>
          <p>Roles: {roles.length ? roles.join(", ") : "No roles found"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Runtime Connection</CardTitle>
          <CardDescription>
            The installed desktop app can override build-time env vars with a
            runtime connection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupabaseConnectionForm
            initialConfig={connectionConfig}
            renderCard={false}
            submitLabel="Save runtime connection"
            onSubmit={async (input) => {
              const saved = await saveRuntimeSupabaseConfig(input);
              resetSupabaseClient();
              setConnectionConfig(saved);
            }}
            onClear={async () => {
              await clearRuntimeSupabaseConfig();
              resetSupabaseClient();
              const fallbackConfig = await refreshResolvedSupabaseConfig();
              setConnectionConfig(fallbackConfig);
            }}
            footer={
              connectionConfig ? (
                <p className="text-muted-foreground text-xs">
                  Active source:{" "}
                  {connectionConfig.source === "env"
                    ? "Environment fallback"
                    : "Runtime config"}
                </p>
              ) : null
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Local Settings</CardTitle>
          <CardDescription>
            Persisted in Tauri Store on this desktop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onSaveSetting}>
            <div className="space-y-2">
              <Label htmlFor="setting-key">Key</Label>
              <Input
                id="setting-key"
                value={settingKey}
                onChange={(event) => setSettingKey(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="setting-json">JSON Value</Label>
              <Textarea
                id="setting-json"
                className="min-h-24 font-mono text-xs"
                value={settingValue}
                onChange={(event) => setSettingValue(event.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                Use valid JSON. For lists, separate items with commas inside
                brackets. Example: ["https://cdn.example.com/image-a.jpg",
                "https://cdn.example.com/image-b.jpg"]
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Save local setting</Button>
              <Button type="button" variant="outline" onClick={onLoadSetting}>
                Load key
              </Button>
            </div>

            {message ? (
              <p className="text-muted-foreground text-sm">{message}</p>
            ) : null}
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
