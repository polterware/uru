# API and Internal Contracts

Ops does not expose a first-party HTTP API server in this repository. Its runtime contracts are Supabase Auth calls, Supabase table/RPC calls, and Tauri commands consumed by the renderer.

## Supabase Client

`src/lib/supabase/client.ts` creates a cached Supabase client from resolved runtime config:

- URL from runtime config.
- Publishable/default key from runtime config.
- Auth auto refresh enabled.
- Session persistence enabled.
- URL session detection disabled.

When the runtime connection changes, callers reset the cached client with `resetSupabaseClient()`.

## Auth Calls

`src/lib/supabase/auth.ts` wraps:

| Function | Supabase contract |
| --- | --- |
| `getSession()` | `supabase.auth.getSession()` |
| `getUser()` | Reads the current user from the session. |
| `signInWithPassword()` | `supabase.auth.signInWithPassword()` with retry and Tauri native fallback. |
| `signOut()` | `supabase.auth.signOut()` |
| `getUserRoles(userId)` | `from("user_roles").select("roles(code)")` filtered by user and active rows. |
| `signUpWithPassword()` | `supabase.auth.signUp()` with `full_name` metadata. |
| `bootstrapFirstAdmin(email)` | RPC `bootstrap_first_admin` with `p_user_email`. |

The Tauri fallback for sign-in calls the native command `supabase_sign_in_with_password`, then sets the returned token pair into the Supabase client session.

## Generic Table Repository

`src/lib/db/repositories/table-crud-repository.ts` provides generic table operations:

| Method | Contract |
| --- | --- |
| `list(table, options)` | `from(table).select("*")`, excludes `deleted_at` rows unless archived rows are requested. |
| `create(table, payload, options)` | Normalizes nullable fields, inserts the row, and returns the inserted row. |
| `update(table, id, payload, options)` | Normalizes nullable fields, updates by `id`, and returns the updated row. |
| `archive(table, id)` | Sets `deleted_at` and `lifecycle_status = "archived"`. |
| `hardDelete(table, id)` | Deletes by `id`. |
| `lookup(table, options)` | Builds relation select options from value and label fields. |

## Console Read RPCs

`ConsoleReadRepository` uses read-model RPCs for selected tables:

| Table | RPC |
| --- | --- |
| `profiles` | `console_profiles_list` |
| `customers` | `console_customers_list` |
| `orders` | `console_orders_list` |
| `transactions` | `console_transactions_list` |
| `shipments` | `console_shipments_list` |

Each read RPC receives:

```ts
{
  p_include_archived: boolean
}
```

If the RPC is missing with an expected missing-function error, the repository falls back to direct table listing.

## Console Join RPCs

`ConsoleJoinsRepository` uses detail and sync RPCs for related-record editors:

| Area | Detail RPC | Sync RPC |
| --- | --- | --- |
| Profile roles | `console_profile_roles_detail` | `console_profile_roles_sync` |
| Customer groups | `console_customer_groups_detail` | `console_customer_groups_sync` |
| Product tags | `console_product_tags_detail` | `console_product_tags_sync` |
| Product sizes | `console_product_sizes_detail` | `console_product_sizes_sync` |
| Order items | `console_order_items_detail` | `console_order_items_sync` |
| Transaction items | `console_transaction_items_detail` | `console_transaction_items_sync` |
| Shipment items | `console_shipment_items_detail` | `console_shipment_items_sync` |

These RPCs are expected to handle relationship synchronization transactionally. The client normalizes IDs and numeric fields before sending payloads.

## Order and Inventory RPCs

| Repository method | RPC | Purpose |
| --- | --- | --- |
| `OrdersRepository.finalizeSale(checkoutId)` | `finalize_sale` | Finalize a sale from a checkout ID. |
| `OrdersRepository.updateStatus(...)` | `update_order_status` | Update order, payment, and fulfillment statuses. |
| `InventoryLevelsRepository.reserveStock(...)` | `reserve_inventory_stock` | Reserve product stock at a location. |
| `InventoryLevelsRepository.releaseStock(...)` | `release_inventory_stock` | Release reserved product stock at a location. |

The visible table console currently exposes order status and inventory reserve/release actions for tables marked in `src/lib/schema-registry.ts`.

## Analytics RPCs

Analytics repositories call these RPCs:

| Domain | RPCs |
| --- | --- |
| Sales | `analytics_sales_overview`, `analytics_sales_timeseries`, `analytics_orders_status_breakdown` |
| Payments | `analytics_payments_overview`, `analytics_payments_status_breakdown` |
| Checkout | `analytics_checkout_funnel`, `analytics_checkout_timeseries` |
| Inventory | `analytics_inventory_overview`, `analytics_inventory_movements_timeseries`, `analytics_inventory_low_stock` |
| Products | `analytics_products_top_revenue`, `analytics_products_conversion` |
| Operations | `analytics_operations_overview` |

Date-scoped analytics RPCs receive combinations of:

```ts
{
  p_start_date: string | null
  p_end_date: string | null
  p_bucket?: "day" | "month"
  p_timezone?: string
  p_limit?: number
}
```

`src/lib/analytics/analytics-range.ts` currently supports `7d`, `30d`, `90d`, and `all`, with default timezone `America/Sao_Paulo`.

## Tauri Commands

The Rust shell exposes two commands in `src-tauri/src/lib.rs`.

### `supabase_sign_in_with_password`

Used as a native fallback when WebView Auth requests fail.

Input:

```ts
{
  supabaseUrl: string
  publishableKey: string
  email: string
  password: string
}
```

Behavior:

- POSTs to `{supabaseUrl}/auth/v1/token?grant_type=password`.
- Sends `apikey` and `Authorization` headers with the publishable key.
- Returns the Supabase Auth JSON response.
- Converts request, response, HTTP, and JSON errors into string error codes.

### `consume_supabase_bootstrap_payload`

Used to import a one-time Supabase runtime config payload.

Behavior:

- Looks for `bootstrap/supabase.json` in the app config directory.
- Falls back to a legacy `uru/bootstrap/supabase.json` path.
- Parses URL, publishable key, optional project ref, optional timestamp, and optional source.
- Deletes the payload after reading it.
- Returns the parsed payload or `null`.

## Error Handling

`src/lib/supabase/errors.ts` wraps Supabase errors in `SupabaseRequestError`, preserving:

- `message`
- `code`
- `details`
- `hint`
- `status`

UI routes usually display the error message directly in page-level or form-level error surfaces.

## Current Unknowns

- TODO: not identified in the current codebase: public HTTP endpoints owned by Ops.
- TODO: not identified in the current codebase: OpenAPI, REST, or GraphQL schema.
- TODO: not identified in the current codebase: server-side API deployment target.
