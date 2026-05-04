# Database

Ops uses Supabase as its external business data layer. The desktop app does not include a local business database, ORM, SQLite integration, `sqlx`, or Tauri SQL plugin.

## Source of Truth

The local codebase contains two important database-facing contracts:

- `src/types/database.ts`: generated TypeScript types for Supabase tables and functions.
- `src/lib/schema-registry.ts`: UI metadata that tells the schema-driven console how to display and edit tables.

The repository does not currently include SQL migrations, seed data, or reset scripts. The connected Supabase project must already provide the schema expected by these TypeScript contracts.

## Table Domains

`src/lib/schema-registry.ts` defines 31 table configs grouped into five product domains.

| Domain | Tables |
| --- | --- |
| Identity and access | `profiles`, `roles`, `user_roles` |
| Catalog | `categories`, `brands`, `lines`, `products`, `reviews`, `product_metrics`, `tags`, `product_tags` |
| CRM | `customers`, `customer_addresses`, `customer_groups`, `customer_group_memberships`, `inquiries`, `inquiry_messages` |
| Inventory and logistics | `locations`, `inventory_levels`, `inventory_movements`, `shipments`, `shipment_items`, `shipment_events` |
| Commerce | `checkouts`, `orders`, `order_items`, `transactions`, `transaction_items`, `payments`, `refunds`, `pos_sessions` |

## Schema Registry Responsibilities

The registry controls the data console behavior for each table:

- Human labels and descriptions.
- Sidebar grouping.
- Primary key name.
- Sort order.
- List columns.
- Editable fields.
- Field types and enum options.
- Required and nullable fields.
- Default values and auto values.
- Relation lookup configuration.
- Field grouping for complex forms such as products.
- Join editor mode for parent-child editing.
- Transactional action availability.

When the Supabase schema changes, update `src/types/database.ts` first, then adjust `src/lib/schema-registry.ts` and repository tests.

## Soft Delete Model

The current phase defaults every table config to soft delete. `TableCrudRepository.archive()` writes:

- `deleted_at` to the current timestamp.
- `lifecycle_status` to `archived`.

Generic list queries exclude archived records unless `includeArchived` is enabled. Hard delete exists in `TableCrudRepository.hardDelete()`, but the current registry defaults to soft delete for all configured tables.

## Identity and Authorization Assumptions

The frontend assumes Supabase Auth sessions, JWT claims, and RLS policies protect business data. The app reads roles through `user_roles` joined to `roles`, and the onboarding flow calls `bootstrap_first_admin`.

RLS policy SQL is not present in this repository, so policy behavior cannot be audited from this checkout alone.

## Join Tables

Some join tables are hidden from the sidebar and edited through parent forms:

| Join table | Parent route |
| --- | --- |
| `user_roles` | `profiles` |
| `customer_group_memberships` | `customers` |
| `order_items` | `orders` |
| `transaction_items` | `transactions` |
| `shipment_items` | `shipments` |

`product_tags` remains part of the catalog contract and is also edited through the product join editor. Product sizes are managed through product-specific join RPCs even though `product_sizes` is not hidden by `src/lib/schema-tables.ts`.

## Read Models and Fallbacks

The console uses read-model RPCs for selected tables:

- `console_profiles_list`
- `console_customers_list`
- `console_orders_list`
- `console_transactions_list`
- `console_shipments_list`

If one of these RPCs is missing with `42883`, `PGRST202`, or a "could not find the function" message, `ConsoleReadRepository` falls back to direct table listing. This fallback only applies to read-model list RPCs, not to join editor sync/detail RPCs or transactional RPCs.

## Transactional RPCs

Critical operations use Supabase RPCs:

- `update_order_status` for order, payment, and fulfillment status changes.
- `reserve_inventory_stock` for inventory reservation.
- `release_inventory_stock` for inventory release.
- `finalize_sale` exists in `OrdersRepository` for checkout finalization.

These operations should remain transactional in Supabase rather than being split across multiple client-side table mutations.

## Analytics Data Model

Analytics is backed by RPCs rather than client-side aggregation. The dashboard loads data for:

- Sales overview, time series, and order status breakdown.
- Payments overview and status breakdown.
- Checkout funnel and time series.
- Inventory overview, movement time series, and low-stock rows.
- Product revenue and conversion.
- Operations overview.

If one analytics domain fails, the dashboard preserves the other domains and shows a partial-data error for the failing domain.

## Change Precautions

- Do not add a local database for business state.
- Keep table names synchronized between Supabase, `src/types/database.ts`, and `src/lib/schema-registry.ts`.
- Keep relation fields aligned with lookup tables and label fields.
- Keep soft-delete fields available if a table remains in the generic console.
- Prefer RPCs for multi-row updates and critical status transitions.
- Regenerate Supabase types after schema changes.
- Add or update Vitest coverage when repository behavior, join editors, hidden route redirects, or schema registry contracts change.

## Current Unknowns

- TODO: not identified in the current codebase: SQL migrations for creating the Supabase schema.
- TODO: not identified in the current codebase: seed data for local or staging environments.
- TODO: not identified in the current codebase: the authoritative RLS policy definitions.
- TODO: not identified in the current codebase: the command used to regenerate `src/types/database.ts`.
