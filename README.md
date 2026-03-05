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
- [Polterbase](https://www.npmjs.com/package/@polterware/polterbase) for setup, link, migration, and installation workflows

### For Desktop Builds

- [Rust toolchain](https://rustup.rs)
- [Tauri system dependencies](https://v2.tauri.app/start/prerequisites/) (varies by OS)

### Optional

- [Docker](https://www.docker.com) — only needed for the `db local-reset` command

## Quick Start

```bash
pnpm install
npx polterbase app setup uru --path .
```

The Polterbase workflow checks prerequisites, creates or updates `.env.local`, installs dependencies, links your Supabase project, pushes migrations, and prepares the runtime bootstrap payload used by the desktop app.

Once setup is done:

```bash
pnpm uru dev
```

## Using Polterbase With Uru

Polterbase is the recommended workflow manager for Uru Supabase operations.

- npm: [@polterware/polterbase](https://www.npmjs.com/package/@polterware/polterbase)
- GitHub: [polterware/polterbase](https://github.com/polterware/polterbase)

### 1. Install dependencies

Uru includes Polterbase as a development dependency, so the normal project install is enough:

```bash
pnpm install
```

### 2. Bootstrap a source checkout

From the `uru` directory:

```bash
npx polterbase app setup uru --path .
```

This flow:

- validates Node.js, pnpm, and Supabase CLI;
- creates or updates `.env.local`;
- installs project dependencies;
- links the Supabase project;
- pushes migrations;
- writes the runtime bootstrap payload for the desktop app.

### 3. Common day-to-day commands

Link or relink the project:

```bash
npx polterbase app link uru --path .
```

Push migrations:

```bash
npx polterbase app migrate uru push --path .
```

Lint migrations:

```bash
npx polterbase app migrate uru lint --path .
```

Reset the linked remote database:

```bash
npx polterbase app migrate uru reset --path .
```

Reset the local Docker database:

```bash
npx polterbase app migrate uru local-reset --path .
```

Rewrite runtime connection/bootstrap data:

```bash
npx polterbase app configure uru --path .
```

### 4. Install the macOS app

If you have a packaged Uru artifact:

```bash
npx polterbase app install uru --platform macos --artifact-url <url>
```

Polterbase downloads the artifact, installs the `.app`, writes the Supabase bootstrap payload, and can open the app after installation.

## CLI Commands

The `pnpm uru` CLI is now intentionally minimal and only starts local development:

| Command                   | Description                                                 |
| ------------------------- | ----------------------------------------------------------- |
| `pnpm uru`                | Show help and point to Polterbase workflows                 |
| `pnpm uru dev`            | Start dev server (web or desktop)                           |
| `pnpm uru --help`         | Show all commands                                           |

### Polterbase Workflows

- `npx polterbase app setup uru --path .` — full source checkout bootstrap
- `npx polterbase app link uru --path .` — link or relink the current project
- `npx polterbase app migrate uru push --path .` — push migrations
- `npx polterbase app migrate uru lint --path .` — lint migrations
- `npx polterbase app migrate uru reset --path .` — reset linked remote DB
- `npx polterbase app migrate uru local-reset --path .` — reset the local Docker stack
- `npx polterbase app configure uru --path .` — rewrite `.env.local` and runtime bootstrap payload
- `npx polterbase app install uru --platform macos --artifact-url <url>` — install the macOS `.app`, then configure runtime Supabase connection

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
cli/                 # Local development launcher (`pnpm uru dev`)
```

Runtime Supabase connection can now come from either:

- build-time env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`) for development and compatibility;
- runtime config stored by the desktop app after importing the bootstrap payload written by Polterbase.

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
4. Run your formatting and lint commands before opening a PR
5. Open a Pull Request

Found a bug or have a suggestion? [Open an issue](https://github.com/ericpbarcelos/uru/issues).

## Troubleshooting

- **`Supabase is not configured...`**
  - For source checkout, make sure `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
  - For an installed desktop app, run `polterbase app configure uru` or fill the connection form shown on first launch

- **Auth or network errors in the desktop app**
  - Check firewall/VPN/proxy rules
  - Confirm Supabase project URL and key are correct
  - Try restarting the app so it can reload runtime connection settings

- **Desktop build fails**
  - Confirm the Rust toolchain is installed (`rustc --version`)
  - Install [Tauri system dependencies](https://v2.tauri.app/start/prerequisites/) for your OS

- **`polterbase app migrate uru push` fails**
  - Check if the Supabase project is linked (`polterbase app link uru --path .`)
  - Confirm `SUPABASE_DB_PASSWORD` is set or enter the password when prompted

## License

This project is licensed under the [GNU General Public License v3.0 (GPL-3.0)](LICENSE) — a strong copyleft license that requires any derivatives to also be open-source.
