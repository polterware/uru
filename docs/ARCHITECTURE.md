# URU Supabase-only Architecture

## Runtime model

- Single desktop app (Tauri + React)
- Supabase as only data backend
- App preferences stored locally via Tauri Store (`settings.json`)
- JWT session required for all business writes
- RLS enabled in all sensitive tables

## Data access boundaries

- Frontend repositories call Supabase client directly:
  - `from(...).select/insert/update`
  - `rpc(...)` for transactions and state transitions
- Tauri backend does not own business CRUD

## Security model

- Auth source: Supabase Auth
- Roles: `admin`, `operator`, `analyst`
- RLS policy matrix:
  - read: `admin`, `operator`, `analyst`
  - write: `admin`, `operator`
  - admin-only tables/actions: `admin`
- Critical actions exposed via `SECURITY DEFINER` RPC with explicit checks

## Domain scope

Primary focus is Dost operations while keeping a schema that can be generalized:

- Catalog: products, categories, brands
- CRM: customers, groups, addresses
- Commerce: checkouts, orders, order_items
- Payments: transactions, payments, refunds
- Fulfillment: shipments, shipment_items, shipment_events
- Inventory: inventory_levels, inventory_movements, locations
- Governance: profiles, roles, user_roles, modules

## Removed architecture

- No SQLite/local multi-database routing
- No `database_type` / `database_config`
- No mobile satellite protocol or pairing flows
- No shop-scoped runtime (`shopId`)
