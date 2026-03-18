import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { relaunch } from "@tauri-apps/plugin-process";

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
import {
  checkForAppUpdate,
  getCurrentVersion,
  type UpdateStatus,
} from "@/lib/updater";

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

function AppVersionCard() {
  const [version, setVersion] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    state: "idle",
  });

  useEffect(() => {
    void getCurrentVersion().then(setVersion);
  }, []);

  async function onCheckUpdate() {
    setUpdateStatus({ state: "checking" });
    const status = await checkForAppUpdate();
    setUpdateStatus(status);
  }

  async function onInstallUpdate() {
    if (updateStatus.state !== "available") return;

    const { update } = updateStatus;
    try {
      setUpdateStatus({ state: "downloading", progress: 0 });
      await update.downloadAndInstall((event) => {
        if (event.event === "Started" && event.data.contentLength) {
          setUpdateStatus({ state: "downloading", progress: 0 });
        } else if (event.event === "Progress") {
          setUpdateStatus((prev) =>
            prev.state === "downloading"
              ? { ...prev, progress: prev.progress + (event.data.chunkLength ?? 0) }
              : prev,
          );
        } else if (event.event === "Finished") {
          setUpdateStatus({ state: "ready" });
        }
      });
      await relaunch();
    } catch (err) {
      setUpdateStatus({
        state: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>App Version</CardTitle>
        <CardDescription>
          {version ? `v${version}` : "Loading…"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {updateStatus.state === "idle" && (
          <Button type="button" variant="outline" onClick={onCheckUpdate}>
            Check for updates
          </Button>
        )}

        {updateStatus.state === "checking" && (
          <p className="text-muted-foreground text-sm">Checking for updates…</p>
        )}

        {updateStatus.state === "up-to-date" && (
          <p className="text-muted-foreground text-sm">You're on the latest version.</p>
        )}

        {updateStatus.state === "available" && (
          <div className="space-y-2">
            <p className="text-sm">
              Version <strong>v{updateStatus.version}</strong> is available.
            </p>
            <Button type="button" onClick={onInstallUpdate}>
              Install and restart
            </Button>
          </div>
        )}

        {updateStatus.state === "downloading" && (
          <p className="text-muted-foreground text-sm">Downloading update…</p>
        )}

        {updateStatus.state === "ready" && (
          <p className="text-muted-foreground text-sm">Restarting…</p>
        )}

        {updateStatus.state === "error" && (
          <div className="space-y-2">
            <p className="text-destructive text-sm">{updateStatus.message}</p>
            <Button type="button" variant="outline" onClick={onCheckUpdate}>
              Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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

      <AppVersionCard />

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
            The desktop app persists a runtime connection locally. Build-time
            env vars are only used during development.
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
                    ? "Development environment fallback"
                    : connectionConfig.source === "bootstrap"
                      ? "Imported bootstrap payload"
                      : "Saved runtime config"}
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
