# Ops

> **Status:** Active
> This project is currently maintained as a Tauri desktop operations app inside the DOST/Ops workspace.

Ops is an open-source desktop operations app for product catalog, inventory, orders, sales, payments, and reports, backed by Supabase.

## Summary

- Tauri desktop operations app for product catalog, inventory, orders, sales, payments, analytics, and role-based access.
- Solves a small-business operations workspace backed by Supabase Auth, database, RLS, RPC functions, and native desktop packaging.
- Main stack: React 19, TanStack Router/Table, Tailwind CSS 4, Radix/shadcn-style UI, Zustand, Recharts, Tauri 2, Vite, TypeScript, Rust, and Supabase.
- Current status: active desktop app inside the DOST/Ops workspace.
- Technical value: combines a native shell with Supabase-backed business rules and transactional server-side functions.

## Overview

Ops brings common commerce and operations workflows into one desktop interface: catalog management, inventory tracking, orders, sales, payments, reporting, and user roles. The application is native-packaged with Tauri, while data, authentication, access control, and critical business rules live in Supabase.

## Motivation

- Give small teams a desktop operations workspace without forcing them into expensive SaaS suites.
- Centralize catalog, inventory, orders, sales, payments, and analytics in one app.
- Keep critical business operations protected by database rules and explicit role-based access.
- Make the app practical for local desktop use while still relying on a shared backend source of truth.

## Features

- Product catalog editing and organization.
- Inventory quantities, movements, and low-stock tracking.
- Orders, sales, status tracking, and transaction history.
- Analytics dashboard for revenue, product, and trend views.
- Role-based access for `admin`, `operator`, and `analyst` users.
- Runtime Supabase connection flow for installed desktop builds.
- Native desktop shell through Tauri with web-only development fallback.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TanStack Router, TanStack Table |
| Styling | Tailwind CSS 4, Radix UI, shadcn-style components |
| State | Zustand |
| Charts | Recharts |
| Desktop | Tauri 2 |
| Backend | Supabase Auth, Database, RLS, RPC |
| Build | Vite, TypeScript, Rust |

## Screenshots / Demo

<p align="center">
  <img src="./docs/images/example.png" alt="Data console with table navigation" width="700" />
  <br />
  <em>Data console with table navigation</em>
</p>

<p align="center">
  <img src="./docs/images/example2.png" alt="Analytics dashboard" width="700" />
  <br />
  <em>Analytics dashboard with business metrics</em>
</p>

## Getting Started

### Requirements

- Node.js 20+
- pnpm
- Supabase CLI
- Rust toolchain
- Tauri system dependencies for your OS
- Docker only when using the local database reset flow

### Installation

```bash
pnpm install
```

For an installed build, the historical installer is documented as:

```bash
curl -fsSL https://raw.githubusercontent.com/polterware/ops/main/install.sh | bash
```

### Environment Variables

Create `.env.local` with:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

Installed desktop apps can also load runtime Supabase settings after importing a bootstrap payload or saving the connection in Settings.

### Running Locally

1. Link your Supabase project with `supabase link`.
2. Push migrations with `supabase db push`.
3. Start the desktop or web-only flow:

```bash
pnpm dev
pnpm dev:web
```

### Running Tests

```bash
pnpm test
```

## Usage

- `pnpm dev` starts the desktop app via Tauri.
- `pnpm dev:web` starts the web dev server only.
- `pnpm build` creates a production web build.
- `pnpm preview` previews build output.
- `pnpm test` runs tests via Vitest.

The app expects users to authenticate through Supabase, then work through operational routes such as login, products, orders, inventory, reports, and settings.

## Project Structure

```text
ops/
├── src/
│   ├── routes/       # App routes such as login, products, orders, inventory, settings
│   └── lib/
│       ├── supabase/ # Supabase client, authentication, and error handling
│       └── db/       # Repository-style data access
├── supabase/
│   └── migrations/   # Schema, RLS policies, and RPC functions
└── src-tauri/
    └── src/lib.rs    # Native desktop shell
```

## Architecture

### Main Components

- React/TanStack UI routes own the operator-facing workflows.
- Supabase owns authentication, data storage, row-level security, and RPC functions.
- Tauri owns the native desktop shell and runtime configuration storage.
- Repository helpers in `src/lib/db` centralize Supabase queries and mutations.

### Data Flow

Users authenticate through Supabase Auth. UI routes call repository helpers, repository helpers call Supabase tables or RPC functions, and database-side RLS/roles determine what the user may read or mutate. Installed desktop builds can load Supabase connection settings from runtime config instead of relying only on build-time Vite environment variables.

### Key Design Choices

- No local database stores business state.
- Critical operations such as inventory reservation, sale finalization, and refunds are designed to run through transactional Supabase RPC functions.
- Roles are enforced in the database so API-level access is still constrained.
- The Tauri shell is intentionally thin and does not own business rules.

## Technical Highlights

- Combines a native desktop packaging layer with hosted Supabase business rules.
- Uses RLS and RPC to keep permissions and transactional behavior close to the data.
- Keeps runtime connection settings available for installed desktop usage.
- Separates UI routing, data repositories, and native shell responsibilities.

## Current Status

This is the active Ops desktop app inside the DOST/Ops workspace.

## Known Limitations

- Source checkout usage requires valid Supabase environment variables.
- Installed desktop apps need runtime connection settings or an imported bootstrap payload.
- Tauri may preserve app data between uninstall/reinstall; stale runtime config can require a config reset.
- Desktop build failures usually come from missing Rust or Tauri system dependencies.

## License

This project is licensed under the [GNU General Public License v3.0 (GPL-3.0)](LICENSE).
