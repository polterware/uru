<p align="center">
  <img src="./header.png" alt="URU header" />
</p>

# URU

Projeto open source para ajudar pessoas a gerirem seus negocios com um app desktop (Tauri + React) integrado ao Supabase.

## Overview

- Open source, foco em operacoes de negocio (catalogo, CRM, vendas, pagamentos, inventario e governanca)
- Arquitetura pensada para operacao real: app desktop unico + Supabase como backend
- Modelo seguro por padrao: JWT, RLS estrita e RPC para fluxos transacionais criticos
- Sem SQLite local para dados de negocio e sem CRUD de dominio no backend Tauri
- Escopo atual orientado ao contexto Dost, com schema projetado para ser generalizavel

## Prerequisites

- Node.js 20+
- `pnpm`
- Rust toolchain (for Tauri desktop build)
- Tauri system dependencies (see Tauri docs for your OS)
- Supabase CLI (`supabase`)
- Docker (optional, only for `local-reset` mode)

## Recommended Knowledge

It is extremely recommended to have solid software engineering knowledge before changing this app's architecture, schema, RLS policies, or transactional RPC flows.

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment in `.env.local`:

```bash
cat <<'EOF' > .env.local
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=YOUR_PUBLISHABLE_KEY
EOF
```

3. Link and reset/apply schema on the linked Supabase project:

```bash
./setup_database_and_data.sh linked-reset
```

4. Run desktop app:

```bash
pnpm dev
```

5. Optional web-only development mode:

```bash
pnpm dev:web
```

## Database Workflow

`setup_database_and_data.sh` supports:

- `linked-reset` (default): reset linked remote DB and reapply local migrations
- `linked-push`: push pending migrations to linked remote DB (no full reset)
- `linked-lint`: run migration lint checks in linked project
- `local-reset`: reset local Supabase stack (`supabase start`/Docker required)

Useful flags and env vars:

- `--relink` or `URU_FORCE_RELINK=YES`: force `supabase link`
- `SUPABASE_DB_PASSWORD`: avoid repeated password prompts
- `URU_CONFIRM_RESET=YES`: skip interactive reset confirmation (CI/automation only)

## Scripts

- `pnpm dev`: run desktop app (Tauri)
- `pnpm dev:web`: run web app only on port `3000`
- `pnpm build`: production web build
- `pnpm preview`: preview build output
- `pnpm test`: run tests via Vitest
- `pnpm lint`: run ESLint
- `pnpm format`: run Prettier
- `pnpm check`: format and auto-fix lint issues

## Project Structure

- `src/routes`: app routes (`/login`, `/products`, `/orders`, `/inventory`, `/settings`)
- `src/lib/supabase`: Supabase client, auth, and error handling
- `src/lib/db/repositories`: data-access layer over Supabase
- `supabase/migrations`: schema, RLS policies, and RPC contract
- `src-tauri/src/lib.rs`: desktop shell (no business DB ownership)

## Security Model

- Authentication source: Supabase Auth
- Role model: `admin`, `operator`, `analyst`
- RLS enabled for business tables
- Critical state transitions implemented as server-side RPC

## Troubleshooting

- `Supabase is not configured...`:
  - Ensure `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
  - Restart `pnpm dev` after editing env vars
- Auth/network errors in desktop app:
  - Check firewall/VPN/proxy rules
  - Confirm Supabase project URL/key validity
  - Retry after restarting the app

## Docs

- `docs/ARCHITECTURE.md`
- `docs/SCHEMA.md`
