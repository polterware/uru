# Troubleshooting

This guide covers issues that are visible in the current codebase: runtime Supabase configuration, local desktop state, Supabase Auth/RPC calls, Tauri dependencies, and updater artifacts.

## Supabase Connection Required

Symptoms:

- The app shows "Supabase connection required".
- `/` redirects to `/onboarding`.
- Login and data routes are unavailable.

Checks:

- Complete `/onboarding` with a Supabase URL and publishable key.
- In source checkout development, confirm `.env.local` contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`.
- Confirm the values are publishable/default client values, not service-role secrets.
- Confirm the URL does not include an extra trailing path.

## Stale Runtime Config

Symptoms:

- The app keeps connecting to an old Supabase project.
- Changing `.env.local` does not affect the desktop app.
- Login still targets a previous project after reinstalling.

Cause:

- Runtime config persisted by Tauri Store has priority over development fallback environment variables.
- Tauri application data can survive app reinstall/uninstall.

Fix on macOS:

```bash
./scripts/reset-config.sh
```

The script removes Tauri Store settings, bootstrap payloads, and `.env.local`. Restart the renderer or desktop app after running it.

## Bootstrap Payload Was Not Imported

Symptoms:

- The app still asks for connection setup even though a bootstrap payload was created.
- Runtime source does not show "Imported bootstrap payload" in Settings.

Checks:

- The preferred payload path is under the Tauri app config directory at `bootstrap/supabase.json`.
- The legacy macOS path is `~/Library/Application Support/uru/bootstrap/supabase.json`.
- The payload must be valid JSON with URL and publishable key fields matching the Rust `SupabaseBootstrapPayload` shape.
- The command consumes and deletes the payload after a successful read.

## Unable To Sign In

Symptoms:

- Supabase Auth returns an error.
- The app reports that it cannot reach the Auth endpoint.
- Desktop sign-in behaves differently from browser-only development.

Checks:

- Confirm the configured project URL and publishable key are valid.
- Confirm the Supabase project Auth settings allow the user to sign in.
- Confirm network, firewall, or VPN settings are not blocking the Supabase Auth endpoint.
- In Tauri, the app retries network failures and then uses the native `supabase_sign_in_with_password` command as a fallback.

## First Admin Creation Fails

Symptoms:

- The onboarding admin form fails after sign-up.
- The app reports that an administrator already exists.

Checks:

- The connected Supabase project must expose the `bootstrap_first_admin` RPC.
- The RPC is expected to assign the first admin and confirm email according to the app flow.
- If the RPC returns false, the UI treats the project as already having an administrator.

## Table Console Fails To Load

Symptoms:

- `/tables/$table` shows an error.
- Some tables load while enriched views fail.

Checks:

- Confirm the authenticated user has RLS access to the requested table.
- Confirm the table exists in the Supabase project and matches `src/types/database.ts`.
- For profiles, customers, orders, transactions, and shipments, the console first tries read-model RPCs such as `console_profiles_list`.
- If a read-model RPC is missing with `PGRST202`, `42883`, or a "could not find the function" message, `ConsoleReadRepository` falls back to direct table listing.
- Join editors require their detail/sync RPCs. Missing join RPCs do not have the same generic fallback.

## Analytics Shows Partial Data

Symptoms:

- The analytics dashboard loads but one domain shows "Partial data".
- Some charts are empty while other cards work.

Cause:

- `AnalyticsDashboardRepository` loads domains with `Promise.allSettled`. One failing RPC does not block the entire dashboard.

Checks:

- Confirm the relevant analytics RPC exists.
- Confirm the authenticated role can execute the RPC.
- Confirm the RPC accepts the expected date and timezone parameters.

## Tauri Development Does Not Start

Checks:

- Confirm Rust is installed.
- Confirm Tauri system dependencies are installed for your OS.
- Confirm Node dependencies are installed with `pnpm install`.
- Use `pnpm dev:web` to isolate renderer problems from native shell problems.
- Check `src-tauri/tauri.conf.json` for the configured dev URL and frontend command.

## Update Check Fails

Symptoms:

- Settings shows an updater error.
- The app never reports an available update.

Checks:

- The updater endpoint must serve `latest.json` from GitHub Releases.
- Release assets must include platform-specific `.app.tar.gz` files and `.sig` signatures.
- The manifest signatures must match the updater public key in `src-tauri/tauri.conf.json`.
- Update checks are skipped in development mode by the root layout.

## Tests or Lint Fail

Relevant commands:

```bash
pnpm test
pnpm lint
```

Notes:

- `pnpm test` runs Vitest.
- `pnpm lint` runs ESLint.
- `pnpm check` mutates files because it runs `prettier --write .` and `eslint --fix`.
