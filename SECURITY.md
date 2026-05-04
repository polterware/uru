# Security Policy

## Reporting a Vulnerability

Please do not open public issues for security vulnerabilities.

Report vulnerabilities privately to:

- Email: TODO: not identified in the current codebase

## Supported Versions

| Version | Supported |
| --- | --- |
| `main` | Yes |

## Security Model

Ops is a desktop application that connects directly to Supabase. The desktop app is not a trusted backend. It must use publishable/default Supabase keys, authenticated user sessions, JWT claims, RLS policies, and RPC permissions to protect business data.

The Rust/Tauri shell is intentionally thin and must not become a privileged business backend.

## Supabase Credentials

- Use only publishable/default keys in `.env.local`, runtime config, bootstrap payloads, and frontend code.
- Never embed Supabase service-role keys in the desktop app.
- Treat `.env.local` as local-only development config.
- Runtime connection config is local desktop state, not a secret store for privileged credentials.

## Runtime Config Storage

Runtime Supabase config can be stored in:

- Tauri Store under `supabase.runtime.connection`.
- Browser localStorage under `ops.supabase.runtime.connection` in web-only development.
- A one-time bootstrap payload consumed and deleted by `consume_supabase_bootstrap_payload`.

The stored config includes the Supabase URL and publishable key. It should not include passwords, service-role credentials, or private signing material.

## Authentication and Authorization

The app uses Supabase Auth for sessions and reads user roles through `user_roles` joined to `roles`. Authorization must be enforced by Supabase RLS policies and RPC permissions.

Security-sensitive flows include:

- First admin bootstrap through `bootstrap_first_admin`.
- Role management through profile role join RPCs.
- Order status changes through `update_order_status`.
- Inventory reservation and release through inventory RPCs.
- Analytics RPC access.

RLS policy SQL is not present in this checkout, so those policies must be reviewed in the connected Supabase project.

## Native Auth Fallback

When WebView Auth requests fail due to network errors, the app can call the Tauri command `supabase_sign_in_with_password`. That command sends the user's email and password to the Supabase Auth token endpoint using `reqwest`.

Review this flow carefully when changing auth behavior:

- Do not log passwords or token responses.
- Keep error messages useful without exposing credentials.
- Keep the native command scoped to Supabase Auth sign-in only.

## Tauri Permissions

Current Tauri capabilities include:

- `core:default`
- `store:default`
- `core:window:default`
- `core:window:allow-start-dragging`
- `updater:default`
- `process:default`

Review `src-tauri/capabilities/default.json` before adding new native APIs. Do not add file-system, shell, SQL, or broad process permissions unless the product requirement is explicit and the risk is reviewed.

## Content Security Policy

`src-tauri/tauri.conf.json` currently sets:

```json
{
  "security": {
    "csp": null
  }
}
```

Before public release, review whether a stricter CSP can be applied without breaking the renderer, Supabase requests, images, charts, or Tauri integration.

## Updates and Release Signing

The Tauri updater uses signed `.app.tar.gz` artifacts and a public key in `src-tauri/tauri.conf.json`. Keep updater signing private keys only in GitHub Actions secrets:

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

Do not commit signing keys, generated private key files, or release credentials.

## Local Data Reset

Use `scripts/reset-config.sh` to remove local Supabase runtime config, bootstrap payloads, and `.env.local` during troubleshooting or handoff.

## Known Security Gaps

- TODO: not identified in the current codebase: responsible disclosure contact email.
- TODO: not identified in the current codebase: Apple notarization policy.
- TODO: not identified in the current codebase: audited Supabase RLS policy definitions.
