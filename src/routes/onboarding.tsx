import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AdminSignupForm } from "@/components/app/onboarding/admin-signup-form";
import { BrandLockup } from "@/components/app/brand-lockup";
import { SupabaseConnectionForm } from "@/components/app/supabase-connection-form";
import { StepIndicator } from "@/components/app/onboarding/step-indicator";
import { WelcomeIllustration } from "@/components/app/onboarding/welcome-illustration";
import { SupabaseIllustration } from "@/components/app/onboarding/supabase-illustration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resetSupabaseClient } from "@/lib/supabase/client";
import {
  getCachedSupabaseConfig,
  refreshResolvedSupabaseConfig,
  saveRuntimeSupabaseConfig,
} from "@/lib/supabase/runtime-config";

interface OnboardingSearch {
  reconfigure?: boolean;
}

export const Route = createFileRoute("/onboarding")({
  validateSearch: (search: Record<string, unknown>): OnboardingSearch => ({
    reconfigure: search.reconfigure === true || search.reconfigure === "true",
  }),
  beforeLoad: async ({ search }) => {
    if ((search as OnboardingSearch).reconfigure) {
      return;
    }
    const config = await refreshResolvedSupabaseConfig();
    if (config) {
      throw redirect({ to: "/login" });
    }
  },
  component: OnboardingPage,
});

const TOTAL_STEPS = 4;

function OnboardingPage() {
  const navigate = useNavigate();
  const { reconfigure } = Route.useSearch();
  const [step, setStep] = useState(reconfigure ? 2 : 0);

  useEffect(() => {
    if (reconfigure) setStep(2);
  }, [reconfigure]);

  return (
    <div className="bg-background text-foreground flex h-screen flex-col overflow-hidden">
      <div
        data-tauri-drag-region
        className="bg-background/95 supports-[backdrop-filter]:bg-background/80 h-6 w-full shrink-0 backdrop-blur"
      />

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 p-6">
        {step === 0 && <StepWelcome onNext={() => setStep(1)} />}
        {step === 1 && (
          <StepHowItWorks onNext={() => setStep(2)} onBack={() => setStep(0)} />
        )}
        {step === 2 && (
          <StepConfigure
            onBack={reconfigure ? () => void navigate({ to: "/login" }) : () => setStep(1)}
            onDone={
              reconfigure
                ? () => void navigate({ to: "/login" })
                : () => setStep(3)
            }
          />
        )}
        {step === 3 && (
          <StepCreateAdmin
            onBack={() => setStep(2)}
            onDone={() => void navigate({ to: "/tables/$table", params: { table: "products" } })}
            onGoToLogin={() => void navigate({ to: "/login" })}
          />
        )}

        {!reconfigure && <StepIndicator total={TOTAL_STEPS} current={step} />}
      </main>
    </div>
  );
}

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <Card className="w-full">
      <CardHeader className="items-center text-center">
        <BrandLockup
          size="lg"
          align="center"
          subtitle="Self-hosted operations for inventory, sales, and analytics."
          className="mb-2"
        />
        <WelcomeIllustration className="mb-2 h-48 w-full" />
        <CardTitle className="text-2xl">Welcome to Ops</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <p className="text-muted-foreground">
          Manage your business without relying on expensive SaaS. Products,
          inventory, orders, sales, and analytics — all in one place.
        </p>
        <Button className="w-full" onClick={onNext}>
          Get started &rarr;
        </Button>
      </CardContent>
    </Card>
  );
}

function StepHowItWorks({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <Card className="w-full">
      <CardHeader className="items-center text-center">
        <BrandLockup
          size="md"
          align="center"
          subtitle="Connect your own Supabase backend and keep full control."
          className="mb-2"
        />
        <SupabaseIllustration className="mb-2 h-48 w-full" />
        <CardTitle className="text-2xl">Powered by Supabase</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <p className="text-muted-foreground">
          Ops connects to your own Supabase project. Your data stays under your
          control — authentication, database, and access rules all live in your
          Supabase instance.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onBack}>
            &larr; Back
          </Button>
          <Button className="flex-1" onClick={onNext}>
            Continue &rarr;
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StepConfigure({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const currentConfig = getCachedSupabaseConfig();

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          &larr; Back
        </Button>
      </div>
      <BrandLockup
        size="sm"
        subtitle="Set the project URL and publishable key for this workspace."
      />
      <SupabaseConnectionForm
        initialConfig={currentConfig}
        title="Connect your Supabase project"
        description="Enter the URL and publishable key from your Supabase project settings."
        submitLabel="Save & continue"
        onSubmit={async (input) => {
          await saveRuntimeSupabaseConfig(input);
          resetSupabaseClient();
          onDone();
        }}
        footer={
          <p className="text-muted-foreground text-xs">
            Find these values in your Supabase dashboard under Project Settings
            &rarr; API.
          </p>
        }
      />
    </div>
  );
}

function StepCreateAdmin({
  onBack,
  onDone,
  onGoToLogin,
}: {
  onBack: () => void;
  onDone: () => void;
  onGoToLogin: () => void;
}) {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          &larr; Back
        </Button>
      </div>
      <BrandLockup
        size="sm"
        subtitle="Create the first administrator for this OPS workspace."
      />
      <AdminSignupForm onDone={onDone} onGoToLogin={onGoToLogin} />
    </div>
  );
}
