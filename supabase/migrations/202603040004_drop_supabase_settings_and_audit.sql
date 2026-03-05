-- Remove cloud-persisted settings and audit tables.
-- Settings are now local-only (Tauri Store) and audit should rely on Supabase platform logs.

-- Drop optional legacy tables if they exist
alter table if exists public.app_settings disable row level security;
alter table if exists public.audit_logs disable row level security;

drop table if exists public.app_settings cascade;
drop table if exists public.audit_logs cascade;

-- Ensure cancel RPC no longer writes to dropped audit table
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

  update public.orders as o
  set status = 'cancelled',
      payment_status = case when o.payment_status = 'paid' then 'partially_refunded' else o.payment_status end,
      fulfillment_status = 'cancelled'
  where o.id = v_order.id;

  return query
  select v_order.id, 'cancelled'::text;
end;
$$;

grant execute on function public.cancel_order_with_restock(uuid, text) to authenticated;
