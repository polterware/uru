import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";

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
import type { RuntimeSupabaseConfig } from "@/lib/supabase/runtime-config";

interface SupabaseConnectionFormProps {
  initialConfig: RuntimeSupabaseConfig | null;
  title?: string;
  description?: string;
  submitLabel?: string;
  clearLabel?: string;
  renderCard?: boolean;
  onSubmit: (input: {
    url: string;
    publishableKey: string;
    projectRef: string | null;
  }) => Promise<void>;
  onClear?: () => Promise<void>;
  footer?: ReactNode;
}

export function SupabaseConnectionForm({
  initialConfig,
  title = "Supabase Connection",
  description = "Configure the Supabase project used by this desktop app.",
  submitLabel = "Save connection",
  clearLabel = "Clear runtime config",
  renderCard = true,
  onSubmit,
  onClear,
  footer,
}: SupabaseConnectionFormProps) {
  const [url, setUrl] = useState(initialConfig?.url ?? "");
  const [publishableKey, setPublishableKey] = useState(
    initialConfig?.publishableKey ?? "",
  );
  const [projectRef, setProjectRef] = useState(initialConfig?.projectRef ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUrl(initialConfig?.url ?? "");
    setPublishableKey(initialConfig?.publishableKey ?? "");
    setProjectRef(initialConfig?.projectRef ?? "");
  }, [initialConfig]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await onSubmit({
        url,
        publishableKey,
        projectRef: projectRef.trim() || null,
      });
      setMessage("Connection saved.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save connection",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    if (!onClear) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await onClear();
      setMessage("Runtime config cleared.");
    } catch (clearError) {
      setError(
        clearError instanceof Error
          ? clearError.message
          : "Unable to clear connection",
      );
    } finally {
      setSaving(false);
    }
  }

  const formContent = (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="supabase-url">Supabase URL</Label>
        <Input
          id="supabase-url"
          placeholder="https://your-project-ref.supabase.co"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="supabase-publishable-key">Publishable key</Label>
        <Input
          id="supabase-publishable-key"
          value={publishableKey}
          onChange={(event) => setPublishableKey(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="supabase-project-ref">Project ref</Label>
        <Input
          id="supabase-project-ref"
          placeholder="Optional but recommended"
          value={projectRef}
          onChange={(event) => setProjectRef(event.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : submitLabel}
        </Button>
        {onClear ? (
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => {
              void handleClear();
            }}
          >
            {clearLabel}
          </Button>
        ) : null}
      </div>

      {message ? (
        <p className="text-muted-foreground text-sm">{message}</p>
      ) : null}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {footer}
    </form>
  );

  if (!renderCard) {
    return formContent;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
