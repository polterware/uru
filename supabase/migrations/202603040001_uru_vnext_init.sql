-- URU Supabase-only vNext schema
-- Reset baseline focused on Dost manager flows

create extension if not exists "pgcrypto";

create schema if not exists app_private;

create or replace function app_private.auth_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function app_private.require_authenticated()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
end;
$$;

create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code in ('admin', 'operator', 'analyst')),
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived')),
  unique (user_id, role_id)
);

create or replace function app_private.has_role(required_roles text[])
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and ur.deleted_at is null
      and ur.lifecycle_status = 'active'
      and r.deleted_at is null
      and r.lifecycle_status = 'active'
      and r.code = any(required_roles)
  );
$$;

create or replace function app_private.require_operator()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform app_private.require_authenticated();

  if not app_private.has_role(array['admin', 'operator']) then
    raise exception 'Operator or admin role required';
  end if;
end;
$$;

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  title text not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  price numeric(12,2) not null default 0,
  cost numeric(12,2),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  notes text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.customer_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived')),
  unique(name)
);

create table if not exists public.customer_group_memberships (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  customer_group_id uuid not null references public.customer_groups(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived')),
  unique (customer_id, customer_group_id)
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  type text not null default 'warehouse' check (type in ('warehouse', 'store', 'transit')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.inventory_levels (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  quantity_on_hand integer not null default 0,
  quantity_reserved integer not null default 0,
  quantity_available integer not null default 0,
  reorder_point integer not null default 0,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived')),
  unique (product_id, location_id)
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_level_id uuid not null references public.inventory_levels(id) on delete cascade,
  movement_type text not null check (movement_type in ('inbound', 'outbound', 'adjustment', 'reservation', 'release')),
  quantity integer not null,
  reason text,
  reference_type text,
  reference_id uuid,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.checkouts (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'completed', 'expired', 'abandoned')),
  total_amount numeric(12,2) not null default 0,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  checkout_id uuid references public.checkouts(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'fulfilled', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded', 'partially_refunded')),
  fulfillment_status text not null default 'unfulfilled' check (fulfillment_status in ('unfulfilled', 'partial', 'fulfilled', 'cancelled')),
  subtotal_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  shipping_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null,
  line_total numeric(12,2) not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  checkout_id uuid references public.checkouts(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'authorized', 'captured', 'failed', 'cancelled', 'refunded')),
  total_amount numeric(12,2) not null default 0,
  currency text not null default 'BRL',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  kind text not null check (kind in ('product', 'shipping', 'discount', 'tax', 'fee')),
  reference_id uuid,
  amount numeric(12,2) not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  transaction_id uuid references public.transactions(id) on delete set null,
  method text not null,
  status text not null default 'pending' check (status in ('pending', 'authorized', 'captured', 'failed', 'cancelled', 'refunded')),
  amount numeric(12,2) not null,
  currency text not null default 'BRL',
  provider_reference text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'processed')),
  amount numeric(12,2) not null,
  reason text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'packed', 'shipped', 'delivered', 'cancelled')),
  carrier text,
  tracking_number text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.shipment_items (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.shipment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  subject text not null,
  status text not null default 'open' check (status in ('open', 'pending', 'resolved', 'closed')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.inquiry_messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete restrict,
  message text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

create table if not exists public.product_metrics (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  metric_date date not null,
  views integer not null default 0,
  add_to_cart integer not null default 0,
  sales_count integer not null default 0,
  revenue_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived')),
  unique (product_id, metric_date)
);

create table if not exists public.pos_sessions (
  id uuid primary key default gen_random_uuid(),
  opened_by uuid not null references auth.users(id) on delete restrict,
  opened_at timestamptz not null default timezone('utc', now()),
  closed_at timestamptz,
  opening_amount numeric(12,2) not null default 0,
  closing_amount numeric(12,2),
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  lifecycle_status text not null default 'active' check (lifecycle_status in ('active', 'inactive', 'archived'))
);

-- Performance indexes for checkout/payment/inventory/analytics flows
create index if not exists idx_orders_status_created_at on public.orders(status, created_at desc);
create index if not exists idx_orders_payment_status on public.orders(payment_status, created_at desc);
create index if not exists idx_orders_fulfillment_status on public.orders(fulfillment_status, created_at desc);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_product on public.order_items(product_id);
create index if not exists idx_transactions_order on public.transactions(order_id, status);
create index if not exists idx_transactions_checkout on public.transactions(checkout_id, status);
create index if not exists idx_payments_order_status on public.payments(order_id, status);
create index if not exists idx_refunds_payment_status on public.refunds(payment_id, status);
create index if not exists idx_inventory_levels_product_location on public.inventory_levels(product_id, location_id);
create index if not exists idx_inventory_movements_level_created on public.inventory_movements(inventory_level_id, created_at desc);
create index if not exists idx_inventory_movements_reference on public.inventory_movements(reference_type, reference_id);
create index if not exists idx_checkouts_status_created on public.checkouts(status, created_at desc);
create index if not exists idx_product_metrics_product_date on public.product_metrics(product_id, metric_date desc);
create index if not exists idx_shipment_events_shipment_created on public.shipment_events(shipment_id, created_at desc);
-- Updated-at triggers
create trigger trg_profiles_updated_at before update on public.profiles for each row execute function app_private.set_updated_at();
create trigger trg_roles_updated_at before update on public.roles for each row execute function app_private.set_updated_at();
create trigger trg_user_roles_updated_at before update on public.user_roles for each row execute function app_private.set_updated_at();
create trigger trg_modules_updated_at before update on public.modules for each row execute function app_private.set_updated_at();
create trigger trg_categories_updated_at before update on public.categories for each row execute function app_private.set_updated_at();
create trigger trg_brands_updated_at before update on public.brands for each row execute function app_private.set_updated_at();
create trigger trg_products_updated_at before update on public.products for each row execute function app_private.set_updated_at();
create trigger trg_customers_updated_at before update on public.customers for each row execute function app_private.set_updated_at();
create trigger trg_customer_addresses_updated_at before update on public.customer_addresses for each row execute function app_private.set_updated_at();
create trigger trg_customer_groups_updated_at before update on public.customer_groups for each row execute function app_private.set_updated_at();
create trigger trg_customer_group_memberships_updated_at before update on public.customer_group_memberships for each row execute function app_private.set_updated_at();
create trigger trg_locations_updated_at before update on public.locations for each row execute function app_private.set_updated_at();
create trigger trg_inventory_levels_updated_at before update on public.inventory_levels for each row execute function app_private.set_updated_at();
create trigger trg_inventory_movements_updated_at before update on public.inventory_movements for each row execute function app_private.set_updated_at();
create trigger trg_checkouts_updated_at before update on public.checkouts for each row execute function app_private.set_updated_at();
create trigger trg_orders_updated_at before update on public.orders for each row execute function app_private.set_updated_at();
create trigger trg_order_items_updated_at before update on public.order_items for each row execute function app_private.set_updated_at();
create trigger trg_transactions_updated_at before update on public.transactions for each row execute function app_private.set_updated_at();
create trigger trg_transaction_items_updated_at before update on public.transaction_items for each row execute function app_private.set_updated_at();
create trigger trg_payments_updated_at before update on public.payments for each row execute function app_private.set_updated_at();
create trigger trg_refunds_updated_at before update on public.refunds for each row execute function app_private.set_updated_at();
create trigger trg_shipments_updated_at before update on public.shipments for each row execute function app_private.set_updated_at();
create trigger trg_shipment_items_updated_at before update on public.shipment_items for each row execute function app_private.set_updated_at();
create trigger trg_shipment_events_updated_at before update on public.shipment_events for each row execute function app_private.set_updated_at();
create trigger trg_inquiries_updated_at before update on public.inquiries for each row execute function app_private.set_updated_at();
create trigger trg_inquiry_messages_updated_at before update on public.inquiry_messages for each row execute function app_private.set_updated_at();
create trigger trg_reviews_updated_at before update on public.reviews for each row execute function app_private.set_updated_at();
create trigger trg_product_metrics_updated_at before update on public.product_metrics for each row execute function app_private.set_updated_at();
create trigger trg_pos_sessions_updated_at before update on public.pos_sessions for each row execute function app_private.set_updated_at();

insert into public.roles (code, name)
values
  ('admin', 'Administrator'),
  ('operator', 'Operator'),
  ('analyst', 'Analyst')
on conflict (code) do update set
  name = excluded.name,
  updated_at = timezone('utc', now()),
  lifecycle_status = 'active',
  deleted_at = null;

insert into public.modules (code, name, description, enabled)
values
  ('catalog', 'Catalog', 'Products, categories and brands', true),
  ('orders', 'Orders', 'Order and checkout lifecycle', true),
  ('inventory', 'Inventory', 'Stock movements and availability', true),
  ('payments', 'Payments', 'Payments and refunds', true),
  ('analytics', 'Analytics', 'Metrics and dashboards', true)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  enabled = excluded.enabled,
  updated_at = timezone('utc', now()),
  lifecycle_status = 'active',
  deleted_at = null;

-- RPCs for transactional business operations
create or replace function public.reserve_inventory_stock(
  p_product_id uuid,
  p_location_id uuid,
  p_quantity integer,
  p_reason text default null
)
returns table(inventory_level_id uuid, quantity_reserved integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_level public.inventory_levels%rowtype;
begin
  perform app_private.require_operator();

  if p_quantity <= 0 then
    raise exception 'Quantity must be positive';
  end if;

  select *
  into v_level
  from public.inventory_levels
  where product_id = p_product_id
    and location_id = p_location_id
    and deleted_at is null
  for update;

  if not found then
    raise exception 'Inventory level not found for product/location';
  end if;

  if v_level.quantity_available < p_quantity then
    raise exception 'Insufficient inventory available';
  end if;

  update public.inventory_levels as il
  set quantity_reserved = il.quantity_reserved + p_quantity,
      quantity_available = il.quantity_available - p_quantity
  where il.id = v_level.id;

  insert into public.inventory_movements (
    inventory_level_id,
    movement_type,
    quantity,
    reason,
    reference_type,
    created_by
  ) values (
    v_level.id,
    'reservation',
    p_quantity,
    coalesce(p_reason, 'reserved via rpc'),
    'reservation',
    auth.uid()
  );

  return query
  select v_level.id, (v_level.quantity_reserved + p_quantity)::integer;
end;
$$;

grant execute on function public.reserve_inventory_stock(uuid, uuid, integer, text) to authenticated;

create or replace function public.release_inventory_stock(
  p_product_id uuid,
  p_location_id uuid,
  p_quantity integer,
  p_reason text default null
)
returns table(inventory_level_id uuid, quantity_available integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_level public.inventory_levels%rowtype;
begin
  perform app_private.require_operator();

  if p_quantity <= 0 then
    raise exception 'Quantity must be positive';
  end if;

  select *
  into v_level
  from public.inventory_levels
  where product_id = p_product_id
    and location_id = p_location_id
    and deleted_at is null
  for update;

  if not found then
    raise exception 'Inventory level not found for product/location';
  end if;

  if v_level.quantity_reserved < p_quantity then
    raise exception 'Not enough reserved quantity to release';
  end if;

  update public.inventory_levels as il
  set quantity_reserved = il.quantity_reserved - p_quantity,
      quantity_available = il.quantity_available + p_quantity
  where il.id = v_level.id;

  insert into public.inventory_movements (
    inventory_level_id,
    movement_type,
    quantity,
    reason,
    reference_type,
    created_by
  ) values (
    v_level.id,
    'release',
    p_quantity,
    coalesce(p_reason, 'released via rpc'),
    'release',
    auth.uid()
  );

  return query
  select v_level.id, (v_level.quantity_available + p_quantity)::integer;
end;
$$;

grant execute on function public.release_inventory_stock(uuid, uuid, integer, text) to authenticated;

create or replace function public.create_order_with_items(
  p_customer_id uuid default null,
  p_items jsonb default '[]'::jsonb
)
returns table(order_id uuid, order_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(12,2) := 0;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_unit_price numeric(12,2);
  v_line_total numeric(12,2);
  v_location_id uuid;
begin
  perform app_private.require_operator();

  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'p_items must be a JSON array';
  end if;

  v_order_number := format('ORD-%s', to_char(timezone('utc', now()), 'YYYYMMDDHH24MISSMS'));

  insert into public.orders (
    order_number,
    customer_id,
    status,
    payment_status,
    fulfillment_status,
    created_by
  ) values (
    v_order_number,
    p_customer_id,
    'pending',
    'pending',
    'unfulfilled',
    auth.uid()
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := greatest((v_item->>'quantity')::integer, 1);
    v_unit_price := coalesce((v_item->>'unit_price')::numeric, 0);
    v_line_total := v_unit_price * v_quantity;
    v_location_id := nullif(v_item->>'location_id', '')::uuid;

    insert into public.order_items (
      order_id,
      product_id,
      quantity,
      unit_price,
      line_total,
      created_by
    ) values (
      v_order_id,
      v_product_id,
      v_quantity,
      v_unit_price,
      v_line_total,
      auth.uid()
    );

    v_subtotal := v_subtotal + v_line_total;

    if v_location_id is not null then
      perform * from public.reserve_inventory_stock(v_product_id, v_location_id, v_quantity, 'order created');
    end if;
  end loop;

  update public.orders
  set subtotal_amount = v_subtotal,
      total_amount = v_subtotal,
      status = 'confirmed'
  where id = v_order_id;

  return query
  select v_order_id, v_order_number;
end;
$$;

grant execute on function public.create_order_with_items(uuid, jsonb) to authenticated;

create or replace function public.finalize_sale(
  p_checkout_id uuid
)
returns table(order_id uuid, transaction_id uuid, payment_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_checkout public.checkouts%rowtype;
  v_order_id uuid;
  v_transaction_id uuid;
  v_payment_id uuid;
  v_order_number text;
begin
  perform app_private.require_operator();

  select * into v_checkout
  from public.checkouts
  where id = p_checkout_id
    and deleted_at is null
  for update;

  if not found then
    raise exception 'Checkout not found';
  end if;

  if v_checkout.status <> 'open' then
    raise exception 'Checkout is not open';
  end if;

  v_order_number := format('ORD-%s', to_char(timezone('utc', now()), 'YYYYMMDDHH24MISSMS'));

  insert into public.orders (
    order_number,
    customer_id,
    checkout_id,
    status,
    payment_status,
    fulfillment_status,
    subtotal_amount,
    total_amount,
    created_by
  ) values (
    v_order_number,
    v_checkout.customer_id,
    v_checkout.id,
    'confirmed',
    'paid',
    'unfulfilled',
    v_checkout.total_amount,
    v_checkout.total_amount,
    auth.uid()
  ) returning id into v_order_id;

  insert into public.transactions (
    order_id,
    checkout_id,
    status,
    total_amount,
    currency,
    created_by
  ) values (
    v_order_id,
    v_checkout.id,
    'captured',
    v_checkout.total_amount,
    'BRL',
    auth.uid()
  ) returning id into v_transaction_id;

  insert into public.payments (
    order_id,
    transaction_id,
    method,
    status,
    amount,
    currency,
    created_by
  ) values (
    v_order_id,
    v_transaction_id,
    'cash',
    'captured',
    v_checkout.total_amount,
    'BRL',
    auth.uid()
  ) returning id into v_payment_id;

  update public.checkouts
  set status = 'completed'
  where id = v_checkout.id;

  return query
  select v_order_id, v_transaction_id, v_payment_id;
end;
$$;

grant execute on function public.finalize_sale(uuid) to authenticated;

create or replace function public.cancel_order_with_restock(
  p_order_id uuid,
  p_reason text default null
)
returns table(order_id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  perform app_private.require_operator();

  select * into v_order
  from public.orders
  where id = p_order_id
    and deleted_at is null
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  update public.orders
  set status = 'cancelled',
      payment_status = case when payment_status = 'paid' then 'partially_refunded' else payment_status end,
      fulfillment_status = 'cancelled'
  where id = v_order.id;

  return query
  select v_order.id, 'cancelled'::text;
end;
$$;

grant execute on function public.cancel_order_with_restock(uuid, text) to authenticated;

create or replace function public.request_refund(
  p_payment_id uuid,
  p_amount numeric,
  p_reason text default null
)
returns table(refund_id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments%rowtype;
  v_refund_id uuid;
begin
  perform app_private.require_operator();

  if p_amount <= 0 then
    raise exception 'Refund amount must be positive';
  end if;

  select * into v_payment
  from public.payments
  where id = p_payment_id
    and deleted_at is null
  for update;

  if not found then
    raise exception 'Payment not found';
  end if;

  insert into public.refunds (
    payment_id,
    order_id,
    status,
    amount,
    reason,
    created_by
  ) values (
    v_payment.id,
    v_payment.order_id,
    'pending',
    p_amount,
    p_reason,
    auth.uid()
  ) returning id into v_refund_id;

  return query
  select v_refund_id, 'pending'::text;
end;
$$;

grant execute on function public.request_refund(uuid, numeric, text) to authenticated;

create or replace function public.update_order_status(
  p_order_id uuid,
  p_status text,
  p_payment_status text default null,
  p_fulfillment_status text default null
)
returns table(order_id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  perform app_private.require_operator();

  select * into v_order
  from public.orders
  where id = p_order_id
    and deleted_at is null
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  update public.orders as o
  set status = coalesce(p_status, o.status),
      payment_status = coalesce(p_payment_status, o.payment_status),
      fulfillment_status = coalesce(p_fulfillment_status, o.fulfillment_status)
  where o.id = v_order.id;

  return query
  select v_order.id, coalesce(p_status, v_order.status);
end;
$$;

grant execute on function public.update_order_status(uuid, text, text, text) to authenticated;

-- Enable RLS everywhere
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.modules enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.customers enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.customer_groups enable row level security;
alter table public.customer_group_memberships enable row level security;
alter table public.locations enable row level security;
alter table public.inventory_levels enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.checkouts enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;
alter table public.payments enable row level security;
alter table public.refunds enable row level security;
alter table public.shipments enable row level security;
alter table public.shipment_items enable row level security;
alter table public.shipment_events enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_messages enable row level security;
alter table public.reviews enable row level security;
alter table public.product_metrics enable row level security;
alter table public.pos_sessions enable row level security;

-- Profiles: self-service + admin
create policy profiles_select on public.profiles
for select using (id = auth.uid() or app_private.has_role(array['admin']));
create policy profiles_insert on public.profiles
for insert with check (id = auth.uid() or app_private.has_role(array['admin']));
create policy profiles_update on public.profiles
for update using (id = auth.uid() or app_private.has_role(array['admin']))
with check (id = auth.uid() or app_private.has_role(array['admin']));

-- Roles/user_roles: read all authenticated, write admin only
create policy roles_select on public.roles
for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy roles_write on public.roles
for all using (app_private.has_role(array['admin']))
with check (app_private.has_role(array['admin']));

create policy user_roles_select on public.user_roles
for select using (app_private.has_role(array['admin', 'operator', 'analyst']) or user_id = auth.uid());
create policy user_roles_write on public.user_roles
for all using (app_private.has_role(array['admin']))
with check (app_private.has_role(array['admin']));

-- Generic business tables
create policy modules_select on public.modules for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy modules_write on public.modules for all using (app_private.has_role(array['admin'])) with check (app_private.has_role(array['admin']));

create policy categories_select on public.categories for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy categories_write on public.categories for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy brands_select on public.brands for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy brands_write on public.brands for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy products_select on public.products for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy products_write on public.products for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy customers_select on public.customers for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy customers_write on public.customers for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy customer_addresses_select on public.customer_addresses for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy customer_addresses_write on public.customer_addresses for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy customer_groups_select on public.customer_groups for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy customer_groups_write on public.customer_groups for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy customer_group_memberships_select on public.customer_group_memberships for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy customer_group_memberships_write on public.customer_group_memberships for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy locations_select on public.locations for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy locations_write on public.locations for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy inventory_levels_select on public.inventory_levels for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy inventory_levels_write on public.inventory_levels for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy inventory_movements_select on public.inventory_movements for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy inventory_movements_write on public.inventory_movements for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy checkouts_select on public.checkouts for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy checkouts_write on public.checkouts for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy orders_select on public.orders for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy orders_write on public.orders for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy order_items_select on public.order_items for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy order_items_write on public.order_items for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy transactions_select on public.transactions for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy transactions_write on public.transactions for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy transaction_items_select on public.transaction_items for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy transaction_items_write on public.transaction_items for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy payments_select on public.payments for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy payments_write on public.payments for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy refunds_select on public.refunds for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy refunds_write on public.refunds for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy shipments_select on public.shipments for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy shipments_write on public.shipments for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy shipment_items_select on public.shipment_items for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy shipment_items_write on public.shipment_items for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy shipment_events_select on public.shipment_events for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy shipment_events_write on public.shipment_events for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy inquiries_select on public.inquiries for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy inquiries_write on public.inquiries for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy inquiry_messages_select on public.inquiry_messages for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy inquiry_messages_write on public.inquiry_messages for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy reviews_select on public.reviews for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy reviews_write on public.reviews for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy product_metrics_select on public.product_metrics for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy product_metrics_write on public.product_metrics for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));

create policy pos_sessions_select on public.pos_sessions for select using (app_private.has_role(array['admin', 'operator', 'analyst']));
create policy pos_sessions_write on public.pos_sessions for all using (app_private.has_role(array['admin', 'operator'])) with check (app_private.has_role(array['admin', 'operator']));
