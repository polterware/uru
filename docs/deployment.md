# Deployment

Ops is distributed as a Tauri desktop app. The current repository contains macOS release automation and Tauri updater configuration. It does not contain a web hosting deployment target or a production server deployment process.

## Release Configuration

The desktop release configuration lives in:

- `src-tauri/tauri.conf.json`
- `.github/workflows/release-macos.yml`
- `install.sh`

`src-tauri/tauri.conf.json` defines:

- Product name: `ops`.
- App identifier: `com.polterware.ops`.
- Current version: `0.1.0`.
- Renderer output: `../.output/public`.
- Development URL: `http://localhost:3000`.
- Bundle targets: `all`.
- Updater artifacts: enabled.
- Updater endpoint: `https://github.com/polterware/ops/releases/latest/download/latest.json`.

## macOS GitHub Actions Workflow

`.github/workflows/release-macos.yml` runs on:

- Tags matching `v*`.
- Manual `workflow_dispatch`.

It builds two macOS targets:

| Runner | Target | Release asset arch |
| --- | --- | --- |
| `macos-14` | `aarch64-apple-darwin` | `aarch64` |
| `macos-13` | `x86_64-apple-darwin` | `x64` |

The workflow:

1. Checks out the repository.
2. Installs pnpm and Node.js 20.
3. Installs the Rust toolchain and target.
4. Installs dependencies with `pnpm install --frozen-lockfile`.
5. Builds Tauri bundles with `pnpm exec tauri build --target ... --bundles app,updater`.
6. Creates `.zip` app downloads.
7. Copies `.app.tar.gz` and `.app.tar.gz.sig` updater artifacts.
8. Creates or updates a GitHub Release.
9. Uploads assets.
10. Builds and uploads `latest.json` for the Tauri updater.

## Required Release Secrets

The workflow references:

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- `GITHUB_TOKEN` provided by GitHub Actions.

The Tauri updater public key is stored in `src-tauri/tauri.conf.json`. The private signing key must stay in GitHub Actions secrets and must never be committed.

## Installer

`install.sh` is a macOS installer script for GitHub Release assets. It:

- Supports latest release installation.
- Supports pinned version installation with `--version`.
- Supports private repositories or rate-limit avoidance through `GITHUB_TOKEN`.
- Detects macOS architecture.
- Selects a compatible `.app.tar.gz` or `.zip` asset.
- Installs the `.app` bundle into `/Applications`.
- Removes the quarantine attribute from the installed app.

Example documented by the script:

```bash
curl -fsSL https://raw.githubusercontent.com/polterware/ops/main/install.sh | bash
```

## Build Commands

The repository scripts expose:

```bash
pnpm build
pnpm dev
```

`pnpm build` builds the renderer output used by Tauri packaging. `pnpm dev` is for local desktop development, not production release.

This documentation update did not run build or release commands.

## Production Configuration

Installed users configure Supabase through the app onboarding flow or an imported bootstrap payload. Production builds should not rely on Vite environment fallback values.

Required runtime values:

- Supabase URL.
- Supabase publishable key.
- Optional Supabase project ref.

The connected Supabase project must provide the tables and RPC functions used by `src/types/database.ts` and `src/lib/db/repositories/`.

## Current Unknowns

- TODO: not identified in the current codebase: Apple Developer ID signing and notarization process.
- TODO: not identified in the current codebase: release promotion policy between staging and production channels.
- TODO: not identified in the current codebase: rollback procedure beyond installing a previous GitHub Release asset.
- TODO: not identified in the current codebase: Windows or Linux release workflow, despite `bundle.targets` being set to `all`.
