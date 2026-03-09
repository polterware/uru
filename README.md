# Ops

Manage your business without relying on expensive SaaS. Ops is an open-source desktop app that brings together product catalog, inventory, orders, sales, payments, and reports in a single interface powered by [Supabase](https://supabase.com).

## What Ops Does

- **Product catalog** — create, edit, and organize items with flexible fields
- **Inventory management** — track quantities, movements, and low-stock alerts
- **Orders and sales** — record sales, track status, and view transaction history
- **Analytics** — visual dashboards with business metrics (revenue, top products, trends)
- **Access control** — three roles (admin, operator, analyst) with different permissions
- **Native desktop app** — runs as a native application on Windows, macOS, and Linux via Tauri

### For the Technically Curious

- All business logic runs on Supabase (no local database)
- Data protected by row-level access rules in the database (Row Level Security)
- Critical operations (inventory reservation, sale finalization, refunds) use transactional server-side functions
- JWT-based authentication via Supabase Auth

## Screenshots

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

## Tech Stack

| Layer    | Technology                                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Frontend | [React 19](https://react.dev) · [TanStack Router](https://tanstack.com/router) · [TanStack Table](https://tanstack.com/table) |
| Styling  | [Tailwind CSS 4](https://tailwindcss.com) · [Radix UI](https://www.radix-ui.com) · [shadcn/ui](https://ui.shadcn.com)         |
| State    | [Zustand](https://zustand.docs.pmnd.rs)                                                                                       |
| Charts   | [Recharts](https://recharts.org)                                                                                              |
| Desktop  | [Tauri 2](https://v2.tauri.app)                                                                                               |
| Backend  | [Supabase](https://supabase.com) (Auth, Database, RLS, RPC)                                                                   |
| Build    | [Vite](https://vite.dev) · [TypeScript](https://www.typescriptlang.org)                                                       |

## Prerequisites

### Required

- [Node.js 20+](https://nodejs.org)
- [pnpm](https://pnpm.io/installation)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)
### For Desktop Builds

- [Rust toolchain](https://rustup.rs)
- [Tauri system dependencies](https://v2.tauri.app/start/prerequisites/) (varies by OS)

### Optional

- [Docker](https://www.docker.com) — only needed for the `db local-reset` command

## Quick Start

### Install via script

```bash
curl -fsSL https://raw.githubusercontent.com/polterware/ops/main/install.sh | bash
```

### Manual setup

```bash
pnpm install
```

1. Create `.env.local` with your Supabase credentials (`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`)
2. Link your Supabase project: `supabase link`
3. Push migrations: `supabase db push`
4. Start the dev server:

```bash
pnpm ops dev
```

## CLI Commands

| Command            | Description                       |
| ------------------ | --------------------------------- |
| `pnpm ops`         | Show help                         |
| `pnpm ops dev`     | Start dev server (web or desktop) |
| `pnpm ops --help`  | Show all commands                 |

## Other Scripts

- `pnpm build` — production web build
- `pnpm preview` — preview build output
- `pnpm test` — run tests via Vitest

## Project Structure

```
src/
  routes/            # App routes (/login, /products, /orders, /inventory, /settings)
  lib/
    supabase/        # Supabase client, authentication, and error handling
    db/
      repositories/  # Data access layer (queries and mutations via Supabase)
supabase/
  migrations/        # Database contract: schema, access policies (RLS), and functions (RPC)
src-tauri/
  src/lib.rs         # Desktop shell (no business logic)
cli/                 # Local development launcher (`pnpm ops dev`)
```

Runtime Supabase connection can now come from either:

- build-time env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`) for development and compatibility;
- runtime config stored by the desktop app after importing the bootstrap payload.

## Security Model

Ops protects your data across multiple layers. Each user has a role (admin, operator, or analyst) that determines what they can see and do. Access rules are enforced directly in the database, so even if someone tries to hit the API directly, they can only access data allowed for their role.

- **Authentication**: Supabase Auth with JWT tokens
- **Roles**: `admin` (full access), `operator` (day-to-day operations), `analyst` (read-only)
- **Row Level Security (RLS)**: per-table policies that filter data based on the user's role
- **Transactional functions (RPC)**: critical operations like inventory reservation and sale finalization run server-side to guarantee consistency

## Contributing

1. Fork the repository
2. Create a branch for your feature or fix (`git checkout -b my-feature`)
3. Make your changes
4. Run your formatting and lint commands before opening a PR
5. Open a Pull Request

Found a bug or have a suggestion? [Open an issue](https://github.com/polterware/ops/issues).

## Troubleshooting

- **`Supabase is not configured...`**
  - For source checkout, make sure `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
  - For an installed desktop app, fill the connection form shown on first launch

- **Auth or network errors in the desktop app**
  - Check firewall/VPN/proxy rules
  - Confirm Supabase project URL and key are correct
  - Try restarting the app so it can reload runtime connection settings

- **Desktop build fails**
  - Confirm the Rust toolchain is installed (`rustc --version`)
  - Install [Tauri system dependencies](https://v2.tauri.app/start/prerequisites/) for your OS

## License

This project is licensed under the [GNU General Public License v3.0 (GPL-3.0)](LICENSE) — a strong copyleft license that requires any derivatives to also be open-source.
