# CLAUDE.md - Polterstore vNext Assistant Guide

## Project scope

Polterstore is a desktop manager aligned to Dost project operations. The app is Supabase-only and single-context (no `shopId` runtime routing).

## Architectural rules

1. Use Supabase API (`from`, `rpc`, `auth`) for all business data access.
2. Do not add SQLite, `sqlx`, or Tauri SQL plugin paths.
3. Keep strict JWT + RLS assumptions in frontend and schema.
4. Prefer transactional RPCs for critical flows (inventory reservation, sale finalization, refunds, status transitions).
5. Keep desktop Rust backend thin; business CRUD belongs in Supabase.

## Directory map

- `src/routes`: flat app routes (`/login`, `/products`, `/orders`, `/inventory`, `/settings`)
- `src/lib/supabase`: Supabase client/auth/error handling
- `src/lib/db/repositories`: repository wrappers over Supabase API
- `supabase/migrations`: SQL contract (schema, RLS, RPC)
- `src-tauri/src/lib.rs`: desktop shell only (no local DB)

## Development commands

```bash
pnpm install
pnpm dev:web
pnpm dev
pnpm build
```

## Database workflow

1. Backup existing Supabase data before reset.
2. Apply/reset schema with `./setup_database_and_data.sh`.
3. Validate RLS and RPC behavior with authenticated users.

## Important constraints

- No `shop-store`, `use-shop`, `/shops/:shopId/*` routes.
- No mobile/pairing/offline-network architecture.
- No `@polterstore/types` workspace package; use local types in `src/types`.
