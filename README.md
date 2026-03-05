# URU vNext (Supabase-only)

URU is now a single desktop app focused on managing the Dost project with a Supabase-only architecture.

## Core decisions

- Single app at repository root (no monorepo, no mobile app)
- Supabase only (`@supabase/supabase-js`) with JWT session
- Strict RLS for all business tables
- RPC-driven transactional operations for checkout/order/payment/inventory
- No SQLite runtime, no local CRUD via Tauri `invoke`

## Quick start

1. Install dependencies

```bash
pnpm install
```

2. Configure environment

```bash
cp .env.example .env
# fill VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
```

3. Reset/apply Supabase schema

```bash
./setup_database_and_data.sh
```

4. Run desktop app

```bash
pnpm dev
```

## Key paths

- Supabase client: `src/lib/supabase/client.ts`
- Auth/session layer: `src/lib/supabase/auth.ts`
- Repositories: `src/lib/db/repositories`
- SQL contract: `supabase/migrations`
- Desktop backend shell: `src-tauri/src/lib.rs`

See `docs/ARCHITECTURE.md` for architecture details.
