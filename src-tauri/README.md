# Ops Tauri Shell

`src-tauri/` contains the native desktop shell for Ops. It wraps the React/TanStack renderer, registers a small set of Tauri plugins, provides runtime Supabase bootstrap commands, and configures desktop bundling and updates.

Business CRUD does not belong in this package. The app's business data layer is Supabase, accessed by the renderer through `src/lib/db/repositories/`.

## Responsibilities

- Create the main desktop window.
- Register Tauri plugins used by the renderer.
- Provide a native fallback for Supabase password sign-in.
- Consume one-time Supabase bootstrap payloads.
- Configure bundle metadata and updater endpoints.

## Main Files

```text
src-tauri/
|-- Cargo.toml                    # Rust package and dependencies
|-- tauri.conf.json               # Tauri window, bundle, and updater config
|-- capabilities/default.json     # Runtime permissions
|-- src/
|   |-- main.rs                   # Native entry point
|   `-- lib.rs                    # Tauri builder, commands, plugins, window setup
`-- icons/                        # Desktop and mobile icon assets generated for Tauri
```

## Rust Stack

- Rust 2021.
- Tauri 2.
- `reqwest` for native Supabase Auth fallback requests.
- `serde` and `serde_json` for command payloads.
- Tauri Store, Updater, Process, and Log plugins.

## Registered Plugins

`src/lib.rs` registers:

- `tauri-plugin-store` for local desktop settings.
- `tauri-plugin-updater` for release updates.
- `tauri-plugin-process` for relaunch after update installation.
- `tauri-plugin-log` in debug builds only.

## Native Commands

### `supabase_sign_in_with_password`

Accepts Supabase URL, publishable key, email, and password. It calls the Supabase Auth token endpoint and returns the JSON auth response to the renderer. The renderer uses it only as a fallback when WebView sign-in requests fail due to network errors.

### `consume_supabase_bootstrap_payload`

Looks for a one-time `bootstrap/supabase.json` payload, parses it, deletes it, and returns the parsed config to the renderer.

The preferred payload path is resolved from Tauri's app config directory:

```text
<app config dir>/bootstrap/supabase.json
```

Legacy paths are still checked:

```text
macOS:   ~/Library/Application Support/uru/bootstrap/supabase.json
Windows: %APPDATA%/uru/bootstrap/supabase.json
Linux:   ~/.config/uru/bootstrap/supabase.json
```

## Window Setup

`tauri.conf.json` defines a main window with:

- Transparent background.
- Width `1280`, height `800`.
- Minimum width `1024`, minimum height `768`.
- Resizable window.
- Delayed creation through Rust setup.

On macOS, `src/lib.rs` applies `TitleBarStyle::Overlay`.

## Bundle and Updater

`tauri.conf.json` sets:

- Product name: `ops`.
- Identifier: `com.polterware.ops`.
- Frontend output: `../.output/public`.
- Updater artifacts enabled.
- GitHub Releases updater endpoint.

The macOS release workflow in `.github/workflows/release-macos.yml` builds updater artifacts and uploads `latest.json`.

## Constraints

- Do not add local database behavior here.
- Do not add SQLite, `sqlx`, or a Tauri SQL plugin.
- Do not move Supabase business CRUD into Rust commands.
- Keep new native permissions narrow and documented in `capabilities/default.json`.
