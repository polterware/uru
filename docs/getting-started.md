# Getting Started

This guide covers local setup for the current Ops repository. Ops is a Tauri desktop app with a React/TanStack renderer and Supabase as the external backend.

## Prerequisites

- Node.js 20 or newer.
- pnpm.
- Rust toolchain compatible with Tauri 2.
- Tauri system dependencies for your operating system.
- A Supabase project that matches the local type contract in `src/types/database.ts`.

The repository does not include a root-level Supabase project directory, migration files, seed files, or a schema reset script. Database setup must be handled outside this checkout unless those files are added later.

## Install Dependencies

From the repository root:

```bash
pnpm install
```

## Configure Supabase

Ops resolves its Supabase connection from runtime configuration first, then development fallback variables.

### Runtime connection

The preferred desktop flow is the onboarding UI at `/onboarding`. It asks for:

- Supabase URL.
- Publishable key.
- Optional project ref.

Saved runtime config is persisted locally through Tauri Store. In browser-only development, the same runtime connection is stored in localStorage.

### Development fallback

For source checkout development, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
```

Use only publishable/default client keys. Never use a Supabase service-role key in `.env.local`, runtime config, installer payloads, or frontend code.

## Runtime Config Sources

The resolver in `src/lib/supabase/runtime-config.ts` checks:

1. A one-time bootstrap payload consumed by the Tauri command `consume_supabase_bootstrap_payload`.
2. Saved Tauri Store runtime config under `supabase.runtime.connection`.
3. Development-only Vite environment fallback from `.env.local`.

The Rust command in `src-tauri/src/lib.rs` looks for the preferred bootstrap payload under the app config directory at `bootstrap/supabase.json`, then checks a legacy `uru/bootstrap/supabase.json` location.

## Run Locally

The package defines two development scripts:

```bash
pnpm dev:web
pnpm dev
```

- `pnpm dev:web` starts the renderer only on port `3000`.
- `pnpm dev` starts the Tauri app and uses the frontend command configured in `src-tauri/tauri.conf.json`.

## Available Scripts

| Script | Description |
| --- | --- |
| `pnpm install` | Install dependencies. |
| `pnpm dev:web` | Start the renderer development server. |
| `pnpm dev` | Start the desktop app through Tauri. |
| `pnpm build` | Build the renderer output used by Tauri packaging. |
| `pnpm preview` | Preview the built renderer. |
| `pnpm test` | Run Vitest tests. |
| `pnpm lint` | Run ESLint. |
| `pnpm format` | Run the configured Prettier command. |
| `pnpm check` | Run `prettier --write .` and `eslint --fix`; this mutates files. |

## Tests

Run the test suite with:

```bash
pnpm test
```

The current tests focus on configuration, Supabase client behavior, repository helpers, schema registry coverage, hidden join routes, and CSV utilities.

## Reset Local Runtime Config

If the app keeps using stale Supabase settings, run:

```bash
./scripts/reset-config.sh
```

On macOS, this removes:

- Tauri Store settings under `~/Library/Application Support/com.polterware.ops/settings.json`.
- Preferred bootstrap payload under `~/Library/Application Support/com.polterware.ops/bootstrap/supabase.json`.
- Legacy bootstrap payload under `~/Library/Application Support/uru/bootstrap/supabase.json`.
- Local development fallback file `.env.local`.

Restart the renderer or desktop app after resetting.

## Notes

- This documentation update did not run install, dev, build, preview, lint, or test commands.
- The local app expects Supabase Auth, table permissions, RLS policies, and RPC functions to exist in the connected Supabase project.
- TODO: not identified in the current codebase: the authoritative Supabase migration/reset workflow for recreating the database schema.
