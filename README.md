<p align="center">
  <img src="./docs/images/header.png" alt="URU header" />
</p>

# URU

Manage your business without relying on expensive SaaS. URU is an open-source desktop app that brings together product catalog, inventory, orders, sales, payments, and reports in a single interface powered by [Supabase](https://supabase.com).

## What URU Does

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

```bash
pnpm install
pnpm uru setup
```

The setup wizard will check prerequisites, create `.env.local` interactively, install dependencies, link your Supabase project, and push migrations.

Once setup is done:

```bash
pnpm uru dev
```

## CLI Commands

All project operations go through the `pnpm uru` CLI:

| Command                   | Description                                                 |
| ------------------------- | ----------------------------------------------------------- |
| `pnpm uru`                | Interactive menu                                            |
| `pnpm uru setup`          | First-time setup wizard                                     |
| `pnpm uru dev`            | Start dev server (web or desktop)                           |
| `pnpm uru db`             | Database operations menu                                    |
| `pnpm uru db push`        | Push migrations (non-destructive)                           |
| `pnpm uru db lint`        | Lint migrations                                             |
| `pnpm uru db reset`       | Reset linked remote DB (destructive, requires confirmation) |
| `pnpm uru db local-reset` | Reset local Docker stack                                    |
| `pnpm uru check`          | Run Prettier + ESLint fix                                   |
| `pnpm uru --help`         | Show all commands                                           |

### Database Flags

- `--relink` — force `supabase link` before running db commands
- `SUPABASE_DB_PASSWORD` env var — avoid password prompts during link/reset/push

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
cli/                 # Interactive CLI toolkit for setup and project operations
```

## Security Model

URU protects your data across multiple layers. Each user has a role (admin, operator, or analyst) that determines what they can see and do. Access rules are enforced directly in the database, so even if someone tries to hit the API directly, they can only access data allowed for their role.

- **Authentication**: Supabase Auth with JWT tokens
- **Roles**: `admin` (full access), `operator` (day-to-day operations), `analyst` (read-only)
- **Row Level Security (RLS)**: per-table policies that filter data based on the user's role
- **Transactional functions (RPC)**: critical operations like inventory reservation and sale finalization run server-side to guarantee consistency

## Contributing

1. Fork the repository
2. Create a branch for your feature or fix (`git checkout -b my-feature`)
3. Make your changes
4. Run `pnpm uru check` to ensure formatting and lint pass
5. Open a Pull Request

Found a bug or have a suggestion? [Open an issue](https://github.com/ericpbarcelos/uru/issues).

## Troubleshooting

- **`Supabase is not configured...`**
  - Make sure `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
  - Restart `pnpm dev` after editing env vars

- **Auth or network errors in the desktop app**
  - Check firewall/VPN/proxy rules
  - Confirm Supabase project URL and key are correct
  - Try restarting the app

- **Desktop build fails**
  - Confirm the Rust toolchain is installed (`rustc --version`)
  - Install [Tauri system dependencies](https://v2.tauri.app/start/prerequisites/) for your OS

- **`pnpm uru db push` fails**
  - Check if the Supabase project is linked (`pnpm uru db --relink`)
  - Confirm `SUPABASE_DB_PASSWORD` is set or enter the password when prompted

## License

This project is licensed under the [GNU General Public License v3.0 (GPL-3.0)](LICENSE) — a strong copyleft license that requires any derivatives to also be open-source.
