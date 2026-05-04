# Architecture

Ops is a medium-sized single-package desktop app. The renderer owns the product interface and calls Supabase directly. The Rust/Tauri side provides native window setup, local desktop storage, updater support, and a small set of native commands.

## System Overview

```mermaid
flowchart LR
  User["Desktop user"] --> Renderer["React/TanStack renderer"]
  Renderer --> RuntimeConfig["Runtime Supabase config"]
  Renderer --> Repositories["Supabase repositories"]
  Renderer --> TauriApi["Tauri commands and plugins"]
  RuntimeConfig --> TauriStore["Tauri Store or browser localStorage"]
  Repositories --> Supabase["Supabase Auth, Tables, RLS, RPC"]
  TauriApi --> NativeShell["Rust/Tauri shell"]
  NativeShell --> Bootstrap["Bootstrap payload consumption"]
  NativeShell --> Updater["Tauri updater"]
  Updater --> GitHub["GitHub Releases latest.json"]
```

## Renderer

The renderer lives under `src/` and uses TanStack Router file routes:

- `src/routes/onboarding.tsx` configures the runtime Supabase connection and creates the first administrator.
- `src/routes/login.tsx` signs users in with Supabase Auth.
- `src/routes/analytics.tsx` renders the RPC-backed analytics dashboard.
- `src/routes/tables.$table.tsx` renders the schema-driven CRUD console.
- `src/routes/settings.tsx` manages runtime connection, local settings, identity context, and app updates.
- `src/routes/__root.tsx` owns the shell layout, auth/config guards, updater notification, document metadata, and translation protection.

The root document sets `lang="en"`, adds the Google `notranslate` meta tag, and renders the body with `translate="no"` so browser translation tools do not mutate the app DOM.

## Schema-Driven Console

`src/lib/schema-registry.ts` is the main UI contract for the data console. It defines:

- 31 Supabase table configs.
- Table groups: identity, catalog, CRM, inventory, and commerce.
- List columns, field definitions, field groups, relation lookups, enum options, defaults, and editable fields.
- Soft-delete behavior through `deleted_at` and `lifecycle_status`.
- Join editor types for related records.
- Transactional action markers for orders and inventory.

`src/lib/schema-tables.ts` turns that registry into sidebar groups and hides join tables that are edited through parent records. `src/lib/hidden-join-routes.ts` redirects direct join-table routes to their parent console views.

## Data Access Layer

Supabase access is centralized in `src/lib/db/repositories/`:

- `table-crud-repository.ts` handles generic list, create, update, archive, hard delete, and lookup operations.
- `console-read-repository.ts` uses read-model RPCs for selected tables and falls back to direct table reads when those RPCs are not available.
- `console-joins-repository.ts` syncs related records through RPCs instead of editing join rows manually.
- `orders-repository.ts` wraps order-specific RPCs such as `update_order_status` and `finalize_sale`.
- `inventory-levels-repository.ts` wraps `reserve_inventory_stock` and `release_inventory_stock`.
- `analytics/*` repositories call analytics RPCs and compose dashboard data.

The frontend uses Supabase `from`, `rpc`, and `auth` calls. There is no local business database layer in this repository.

## Supabase Boundary

Supabase owns:

- Authentication and session persistence.
- Table storage.
- Row-level security and JWT-based authorization assumptions.
- RPC functions for transactional flows, analytics, read models, joins, and first-admin bootstrap.

The codebase includes a generated TypeScript contract in `src/types/database.ts`, but it does not include SQL migrations or seed scripts. Any schema change must keep the Supabase project, `src/types/database.ts`, and `src/lib/schema-registry.ts` aligned.

## Runtime Configuration Flow

The app resolves Supabase configuration through `src/lib/supabase/runtime-config.ts`:

1. In Tauri, call `consume_supabase_bootstrap_payload` to import and delete a one-time `bootstrap/supabase.json` payload.
2. Read saved runtime config from Tauri Store under `supabase.runtime.connection`.
3. In web-only or development mode, use `.env.local` values as fallback.

When the connection changes, the app resets the cached Supabase client with `resetSupabaseClient()` and emits an in-window config change event.

## Tauri Shell

The Rust shell in `src-tauri/src/lib.rs` is intentionally narrow. It:

- Registers Tauri Store, Updater, Process, and development Log plugins.
- Builds the main transparent window with macOS overlay title bar behavior.
- Provides `supabase_sign_in_with_password` as a native auth fallback for WebView network failures.
- Provides `consume_supabase_bootstrap_payload` for one-time runtime connection import.

The shell does not implement business CRUD and does not include SQLite, `sqlx`, or a Tauri SQL plugin.

## Update Flow

In production mode, `src/routes/__root.tsx` checks for updates after authentication. `src/lib/updater.ts` wraps the Tauri updater API. The Settings page lets the user check, download, install, and relaunch when an update is available.

`src-tauri/tauri.conf.json` configures the updater endpoint to read `latest.json` from GitHub Releases. `.github/workflows/release-macos.yml` creates macOS release assets and uploads the updater manifest.

## Architectural Constraints

- Business data access belongs in Supabase repositories, not in Rust.
- Critical state transitions should use Supabase RPCs.
- Client code must assume JWT and RLS enforcement.
- Local settings may use Tauri Store, but business state must not be persisted locally.
- Any new table surface should start from `src/types/database.ts` and `src/lib/schema-registry.ts`.
