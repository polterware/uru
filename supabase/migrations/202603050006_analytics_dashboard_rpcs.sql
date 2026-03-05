-- Analytics dashboard RPCs for URU sidebar interface
-- Domain-oriented functions for sales, payments, checkout, inventory, products and operations.

-- DOMAIN: SALES
create or replace function public.analytics_sales_overview(
  p_start_date date default null,
  p_end_date date default null,
  p_timezone text default 'America/Sao_Paulo'
)
returns table (
  gross_sales numeric,
  paid_sales numeric,
  refunded_amount numeric,
  net_sales numeric,
  orders_count bigint,
  paid_orders_count bigint,
  avg_ticket numeric,
  cancelled_orders_count bigint,
  cancellation_rate numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  with filtered_orders as (
    select o.*
    from public.orders o
    where o.deleted_at is null
      and (
        p_start_date is null
        or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), o.created_at)) >= p_start_date
      )
      and (
        p_end_date is null
        or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), o.created_at)) <= p_end_date
      )
  ),
  filtered_refunds as (
    select r.*
    from public.refunds r
    where r.deleted_at is null
      and (
        p_start_date is null
        or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), r.created_at)) >= p_start_date
      )
      and (
        p_end_date is null
        or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), r.created_at)) <= p_end_date
      )
  ),
  orders_agg as (
    select
      coalesce(sum(o.total_amount), 0)::numeric as gross_sales,
      coalesce(sum(case when o.payment_status in ('paid', 'partially_refunded', 'refunded') then o.total_amount else 0 end), 0)::numeric as paid_sales,
      count(*)::bigint as orders_count,
      count(*) filter (where o.payment_status in ('paid', 'partially_refunded', 'refunded'))::bigint as paid_orders_count,
      count(*) filter (where o.status = 'cancelled')::bigint as cancelled_orders_count
    from filtered_orders o
  ),
  refunds_agg as (
    select coalesce(sum(r.amount), 0)::numeric as refunded_amount
    from filtered_refunds r
  )
  select
    o.gross_sales,
    o.paid_sales,
    r.refunded_amount,
    (o.paid_sales - r.refunded_amount)::numeric as net_sales,
    o.orders_count,
    o.paid_orders_count,
    (case when o.orders_count = 0 then 0 else (o.gross_sales / o.orders_count) end)::numeric as avg_ticket,
    o.cancelled_orders_count,
    (case when o.orders_count = 0 then 0 else (o.cancelled_orders_count::numeric / o.orders_count::numeric) end)::numeric as cancellation_rate
  from orders_agg o
  cross join refunds_agg r;
$$;

grant execute on function public.analytics_sales_overview(date, date, text) to authenticated;

create or replace function public.analytics_sales_timeseries(
  p_start_date date default null,
  p_end_date date default null,
  p_bucket text default 'day',
  p_timezone text default 'America/Sao_Paulo'
)
returns table (
  bucket_date date,
  gross_sales numeric,
  paid_sales numeric,
  refunded_amount numeric,
  net_sales numeric,
  orders_count bigint
)
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_bucket text := lower(coalesce(p_bucket, 'day'));
  v_timezone text := coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo');
begin
  if v_bucket not in ('day', 'month') then
    raise exception 'Unsupported bucket: %. Allowed values are day or month.', p_bucket;
  end if;

  return query
  with orders_agg as (
    select
      date_trunc(v_bucket, timezone(v_timezone, o.created_at))::date as bucket_date,
      coalesce(sum(o.total_amount), 0)::numeric as gross_sales,
      coalesce(sum(case when o.payment_status in ('paid', 'partially_refunded', 'refunded') then o.total_amount else 0 end), 0)::numeric as paid_sales,
      count(*)::bigint as orders_count
    from public.orders o
    where o.deleted_at is null
      and (
        p_start_date is null
        or date(timezone(v_timezone, o.created_at)) >= p_start_date
      )
      and (
        p_end_date is null
        or date(timezone(v_timezone, o.created_at)) <= p_end_date
      )
    group by 1
  ),
  refunds_agg as (
    select
      date_trunc(v_bucket, timezone(v_timezone, r.created_at))::date as bucket_date,
      coalesce(sum(r.amount), 0)::numeric as refunded_amount
    from public.refunds r
    where r.deleted_at is null
      and (
        p_start_date is null
        or date(timezone(v_timezone, r.created_at)) >= p_start_date
      )
      and (
        p_end_date is null
        or date(timezone(v_timezone, r.created_at)) <= p_end_date
      )
    group by 1
  )
  select
    coalesce(o.bucket_date, r.bucket_date) as bucket_date,
    coalesce(o.gross_sales, 0)::numeric as gross_sales,
    coalesce(o.paid_sales, 0)::numeric as paid_sales,
    coalesce(r.refunded_amount, 0)::numeric as refunded_amount,
    (coalesce(o.paid_sales, 0) - coalesce(r.refunded_amount, 0))::numeric as net_sales,
    coalesce(o.orders_count, 0)::bigint as orders_count
  from orders_agg o
  full outer join refunds_agg r on r.bucket_date = o.bucket_date
  order by 1;
end;
$$;

grant execute on function public.analytics_sales_timeseries(date, date, text, text) to authenticated;

create or replace function public.analytics_orders_status_breakdown(
  p_start_date date default null,
  p_end_date date default null,
  p_timezone text default 'America/Sao_Paulo'
)
returns table (
  status text,
  orders_count bigint,
  total_amount numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    o.status,
    count(*)::bigint as orders_count,
    coalesce(sum(o.total_amount), 0)::numeric as total_amount
  from public.orders o
  where o.deleted_at is null
    and (
      p_start_date is null
      or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), o.created_at)) >= p_start_date
    )
    and (
      p_end_date is null
      or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), o.created_at)) <= p_end_date
    )
  group by o.status
  order by orders_count desc, o.status;
$$;

grant execute on function public.analytics_orders_status_breakdown(date, date, text) to authenticated;

-- DOMAIN: PAYMENTS
create or replace function public.analytics_payments_overview(
  p_start_date date default null,
  p_end_date date default null,
  p_timezone text default 'America/Sao_Paulo'
)
returns table (
  captured_amount numeric,
  pending_amount numeric,
  failed_amount numeric,
  refunded_amount numeric,
  net_collected_amount numeric,
  payments_count bigint,
  captured_payments_count bigint,
  failed_payments_count bigint,
  payment_success_rate numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  with filtered_payments as (
    select p.*
    from public.payments p
    where p.deleted_at is null
      and (
        p_start_date is null
        or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), p.created_at)) >= p_start_date
      )
      and (
        p_end_date is null
        or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), p.created_at)) <= p_end_date
      )
  ),
  filtered_refunds as (
    select r.*
    from public.refunds r
    where r.deleted_at is null
      and (
        p_start_date is null
        or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), r.created_at)) >= p_start_date
      )
      and (
        p_end_date is null
        or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), r.created_at)) <= p_end_date
      )
  ),
  payments_agg as (
    select
      coalesce(sum(case when p.status = 'captured' then p.amount else 0 end), 0)::numeric as captured_amount,
      coalesce(sum(case when p.status in ('pending', 'authorized') then p.amount else 0 end), 0)::numeric as pending_amount,
      coalesce(sum(case when p.status in ('failed', 'cancelled') then p.amount else 0 end), 0)::numeric as failed_amount,
      count(*)::bigint as payments_count,
      count(*) filter (where p.status = 'captured')::bigint as captured_payments_count,
      count(*) filter (where p.status in ('failed', 'cancelled'))::bigint as failed_payments_count
    from filtered_payments p
  ),
  refunds_agg as (
    select coalesce(sum(r.amount), 0)::numeric as refunded_amount
    from filtered_refunds r
  )
  select
    p.captured_amount,
    p.pending_amount,
    p.failed_amount,
    r.refunded_amount,
    (p.captured_amount - r.refunded_amount)::numeric as net_collected_amount,
    p.payments_count,
    p.captured_payments_count,
    p.failed_payments_count,
    (case when p.payments_count = 0 then 0 else (p.captured_payments_count::numeric / p.payments_count::numeric) end)::numeric as payment_success_rate
  from payments_agg p
  cross join refunds_agg r;
$$;

grant execute on function public.analytics_payments_overview(date, date, text) to authenticated;

create or replace function public.analytics_payments_status_breakdown(
  p_start_date date default null,
  p_end_date date default null,
  p_timezone text default 'America/Sao_Paulo'
)
returns table (
  status text,
  payments_count bigint,
  total_amount numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    p.status,
    count(*)::bigint as payments_count,
    coalesce(sum(p.amount), 0)::numeric as total_amount
  from public.payments p
  where p.deleted_at is null
    and (
      p_start_date is null
      or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), p.created_at)) >= p_start_date
    )
    and (
      p_end_date is null
      or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), p.created_at)) <= p_end_date
    )
  group by p.status
  order by payments_count desc, p.status;
$$;

grant execute on function public.analytics_payments_status_breakdown(date, date, text) to authenticated;

-- DOMAIN: CHECKOUT
create or replace function public.analytics_checkout_funnel(
  p_start_date date default null,
  p_end_date date default null,
  p_timezone text default 'America/Sao_Paulo'
)
returns table (
  stage text,
  stage_order integer,
  sessions_count bigint,
  conversion_rate numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  with filtered_checkouts as (
    select c.*
    from public.checkouts c
    where c.deleted_at is null
      and (
        p_start_date is null
        or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), c.created_at)) >= p_start_date
      )
      and (
        p_end_date is null
        or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), c.created_at)) <= p_end_date
      )
  ),
  counts as (
    select
      count(*)::bigint as opened_count,
      count(*) filter (where status = 'completed')::bigint as completed_count,
      count(*) filter (where status = 'expired')::bigint as expired_count,
      count(*) filter (where status = 'abandoned')::bigint as abandoned_count
    from filtered_checkouts
  )
  select
    x.stage,
    x.stage_order,
    x.sessions_count,
    (case when c.opened_count = 0 then 0 else (x.sessions_count::numeric / c.opened_count::numeric) end)::numeric as conversion_rate
  from counts c
  cross join lateral (
    values
      ('opened'::text, 1, c.opened_count),
      ('completed'::text, 2, c.completed_count),
      ('expired'::text, 3, c.expired_count),
      ('abandoned'::text, 4, c.abandoned_count)
  ) as x(stage, stage_order, sessions_count)
  order by x.stage_order;
$$;

grant execute on function public.analytics_checkout_funnel(date, date, text) to authenticated;

create or replace function public.analytics_checkout_timeseries(
  p_start_date date default null,
  p_end_date date default null,
  p_bucket text default 'day',
  p_timezone text default 'America/Sao_Paulo'
)
returns table (
  bucket_date date,
  opened_count bigint,
  completed_count bigint,
  completion_rate numeric,
  completed_amount numeric
)
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_bucket text := lower(coalesce(p_bucket, 'day'));
  v_timezone text := coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo');
begin
  if v_bucket not in ('day', 'month') then
    raise exception 'Unsupported bucket: %. Allowed values are day or month.', p_bucket;
  end if;

  return query
  select
    date_trunc(v_bucket, timezone(v_timezone, c.created_at))::date as bucket_date,
    count(*)::bigint as opened_count,
    count(*) filter (where c.status = 'completed')::bigint as completed_count,
    (case
      when count(*) = 0 then 0
      else (count(*) filter (where c.status = 'completed'))::numeric / count(*)::numeric
    end)::numeric as completion_rate,
    coalesce(sum(case when c.status = 'completed' then c.total_amount else 0 end), 0)::numeric as completed_amount
  from public.checkouts c
  where c.deleted_at is null
    and (
      p_start_date is null
      or date(timezone(v_timezone, c.created_at)) >= p_start_date
    )
    and (
      p_end_date is null
      or date(timezone(v_timezone, c.created_at)) <= p_end_date
    )
  group by 1
  order by 1;
end;
$$;

grant execute on function public.analytics_checkout_timeseries(date, date, text, text) to authenticated;

-- DOMAIN: INVENTORY
create or replace function public.analytics_inventory_overview()
returns table (
  total_skus bigint,
  out_of_stock_skus bigint,
  low_stock_skus bigint,
  healthy_skus bigint,
  total_available_units bigint,
  total_reserved_units bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  with levels as (
    select l.*
    from public.inventory_levels l
    where l.deleted_at is null
  )
  select
    count(distinct l.product_id)::bigint as total_skus,
    count(distinct case when l.quantity_available <= 0 then l.product_id end)::bigint as out_of_stock_skus,
    count(distinct case when l.quantity_available > 0 and l.quantity_available <= l.reorder_point then l.product_id end)::bigint as low_stock_skus,
    count(distinct case when l.quantity_available > l.reorder_point then l.product_id end)::bigint as healthy_skus,
    coalesce(sum(l.quantity_available), 0)::bigint as total_available_units,
    coalesce(sum(l.quantity_reserved), 0)::bigint as total_reserved_units
  from levels l;
$$;

grant execute on function public.analytics_inventory_overview() to authenticated;

create or replace function public.analytics_inventory_movements_timeseries(
  p_start_date date default null,
  p_end_date date default null,
  p_bucket text default 'day',
  p_timezone text default 'America/Sao_Paulo'
)
returns table (
  bucket_date date,
  inbound_qty bigint,
  outbound_qty bigint,
  reservation_qty bigint,
  release_qty bigint,
  adjustment_qty bigint
)
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_bucket text := lower(coalesce(p_bucket, 'day'));
  v_timezone text := coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo');
begin
  if v_bucket not in ('day', 'month') then
    raise exception 'Unsupported bucket: %. Allowed values are day or month.', p_bucket;
  end if;

  return query
  select
    date_trunc(v_bucket, timezone(v_timezone, m.created_at))::date as bucket_date,
    coalesce(sum(case when m.movement_type = 'inbound' then m.quantity else 0 end), 0)::bigint as inbound_qty,
    coalesce(sum(case when m.movement_type = 'outbound' then m.quantity else 0 end), 0)::bigint as outbound_qty,
    coalesce(sum(case when m.movement_type = 'reservation' then m.quantity else 0 end), 0)::bigint as reservation_qty,
    coalesce(sum(case when m.movement_type = 'release' then m.quantity else 0 end), 0)::bigint as release_qty,
    coalesce(sum(case when m.movement_type = 'adjustment' then m.quantity else 0 end), 0)::bigint as adjustment_qty
  from public.inventory_movements m
  where m.deleted_at is null
    and (
      p_start_date is null
      or date(timezone(v_timezone, m.created_at)) >= p_start_date
    )
    and (
      p_end_date is null
      or date(timezone(v_timezone, m.created_at)) <= p_end_date
    )
  group by 1
  order by 1;
end;
$$;

grant execute on function public.analytics_inventory_movements_timeseries(date, date, text, text) to authenticated;

create or replace function public.analytics_inventory_low_stock(
  p_limit integer default 10
)
returns table (
  product_id uuid,
  sku text,
  title text,
  quantity_available integer,
  reorder_point integer,
  location_name text
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    p.id as product_id,
    p.sku,
    p.title,
    l.quantity_available,
    l.reorder_point,
    loc.name as location_name
  from public.inventory_levels l
  join public.products p on p.id = l.product_id
  join public.locations loc on loc.id = l.location_id
  where l.deleted_at is null
    and p.deleted_at is null
    and loc.deleted_at is null
    and l.quantity_available <= l.reorder_point
  order by (l.reorder_point - l.quantity_available) desc, l.quantity_available asc, p.title asc
  limit greatest(coalesce(p_limit, 10), 1);
$$;

grant execute on function public.analytics_inventory_low_stock(integer) to authenticated;

-- DOMAIN: PRODUCTS
create or replace function public.analytics_products_top_revenue(
  p_start_date date default null,
  p_end_date date default null,
  p_limit integer default 10,
  p_timezone text default 'America/Sao_Paulo'
)
returns table (
  product_id uuid,
  sku text,
  title text,
  units_sold bigint,
  revenue numeric,
  orders_count bigint,
  avg_unit_price numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    p.id as product_id,
    p.sku,
    p.title,
    coalesce(sum(oi.quantity), 0)::bigint as units_sold,
    coalesce(sum(oi.line_total), 0)::numeric as revenue,
    count(distinct oi.order_id)::bigint as orders_count,
    (case
      when coalesce(sum(oi.quantity), 0) = 0 then 0
      else (coalesce(sum(oi.line_total), 0)::numeric / coalesce(sum(oi.quantity), 0)::numeric)
    end)::numeric as avg_unit_price
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  join public.products p on p.id = oi.product_id
  where oi.deleted_at is null
    and o.deleted_at is null
    and p.deleted_at is null
    and o.status <> 'cancelled'
    and (
      p_start_date is null
      or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), o.created_at)) >= p_start_date
    )
    and (
      p_end_date is null
      or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), o.created_at)) <= p_end_date
    )
  group by p.id, p.sku, p.title
  order by revenue desc, units_sold desc
  limit greatest(coalesce(p_limit, 10), 1);
$$;

grant execute on function public.analytics_products_top_revenue(date, date, integer, text) to authenticated;

create or replace function public.analytics_products_conversion(
  p_start_date date default null,
  p_end_date date default null,
  p_limit integer default 10
)
returns table (
  product_id uuid,
  sku text,
  title text,
  views bigint,
  add_to_cart bigint,
  sales_count bigint,
  view_to_cart_rate numeric,
  cart_to_sale_rate numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    p.id as product_id,
    p.sku,
    p.title,
    coalesce(sum(pm.views), 0)::bigint as views,
    coalesce(sum(pm.add_to_cart), 0)::bigint as add_to_cart,
    coalesce(sum(pm.sales_count), 0)::bigint as sales_count,
    (case
      when coalesce(sum(pm.views), 0) = 0 then 0
      else (coalesce(sum(pm.add_to_cart), 0)::numeric / coalesce(sum(pm.views), 0)::numeric)
    end)::numeric as view_to_cart_rate,
    (case
      when coalesce(sum(pm.add_to_cart), 0) = 0 then 0
      else (coalesce(sum(pm.sales_count), 0)::numeric / coalesce(sum(pm.add_to_cart), 0)::numeric)
    end)::numeric as cart_to_sale_rate
  from public.product_metrics pm
  join public.products p on p.id = pm.product_id
  where pm.deleted_at is null
    and p.deleted_at is null
    and (
      p_start_date is null
      or pm.metric_date >= p_start_date
    )
    and (
      p_end_date is null
      or pm.metric_date <= p_end_date
    )
  group by p.id, p.sku, p.title
  order by sales_count desc, views desc
  limit greatest(coalesce(p_limit, 10), 1);
$$;

grant execute on function public.analytics_products_conversion(date, date, integer) to authenticated;

-- DOMAIN: OPERATIONS
create or replace function public.analytics_operations_overview(
  p_start_date date default null,
  p_end_date date default null,
  p_timezone text default 'America/Sao_Paulo'
)
returns table (
  open_inquiries_count bigint,
  pending_inquiries_count bigint,
  resolved_inquiries_count bigint,
  pending_reviews_count bigint,
  approved_reviews_count bigint,
  avg_rating numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  with filtered_inquiries as (
    select i.*
    from public.inquiries i
    where i.deleted_at is null
      and (
        p_start_date is null
        or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), i.created_at)) >= p_start_date
      )
      and (
        p_end_date is null
        or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), i.created_at)) <= p_end_date
      )
  ),
  filtered_reviews as (
    select r.*
    from public.reviews r
    where r.deleted_at is null
      and (
        p_start_date is null
        or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), r.created_at)) >= p_start_date
      )
      and (
        p_end_date is null
        or date(timezone(coalesce(nullif(p_timezone, ''), 'America/Sao_Paulo'), r.created_at)) <= p_end_date
      )
  )
  select
    count(*) filter (where i.status = 'open')::bigint as open_inquiries_count,
    count(*) filter (where i.status = 'pending')::bigint as pending_inquiries_count,
    count(*) filter (where i.status in ('resolved', 'closed'))::bigint as resolved_inquiries_count,
    (select count(*)::bigint from filtered_reviews r where r.status = 'pending') as pending_reviews_count,
    (select count(*)::bigint from filtered_reviews r where r.status = 'approved') as approved_reviews_count,
    (select coalesce(avg(r.rating), 0)::numeric from filtered_reviews r where r.status = 'approved') as avg_rating
  from filtered_inquiries i;
$$;

grant execute on function public.analytics_operations_overview(date, date, text) to authenticated;
