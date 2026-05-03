# Ops Tauri Backend

> **Status:** Active
> Rust-side backend package for the DOST Ops desktop app.

## Summary

- Rust/Tauri native backend for the DOST Ops desktop app.
- Solves native window setup, Supabase auth bootstrap, plugin registration, and commands consumed by the React/TanStack frontend.
- Main stack: Rust 2021, Tauri 2, reqwest, serde, serde_json, and Tauri Store/Updater/Process/Log plugins.
- Current status: active native package inside `dost-ops/ops`.
- Technical value: keeps native capabilities narrow while product behavior stays in the frontend.

Tauri package for `dost-ops/ops`. It provides native window setup, Supabase auth bootstrap helpers, Tauri plugins, and commands consumed by the React/TanStack frontend.

## Features

- Supabase password sign-in command.
- Supabase bootstrap payload discovery and one-time consumption.
- Tauri Store, Updater, Process, and Log plugin setup.
- Transparent window creation with macOS overlay title bar.

## Tech Stack

- Rust 2021
- Tauri 2
- reqwest
- serde / serde_json
- Tauri Store, Updater, Process, and Log plugins

## Project Structure

```text
src-tauri/
├── Cargo.toml
└── src/
    ├── lib.rs
    └── main.rs
```

## Architecture

`src/lib.rs` registers the native commands and creates the app window. The Rust package is intentionally small; most product UI and operations behavior lives in the frontend package.
