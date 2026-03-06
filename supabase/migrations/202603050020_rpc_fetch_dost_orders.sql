-- RPC for Dost to fetch orders in its expected format
-- Normalizes Polterstore's multi-table order structure into Dost's single IOrder structure

create or replace function public.fetch_dost_orders()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_result jsonb;
begin
    select jsonb_agg(o_data)
    into v_result
    from (
        select 
            o.id,
            o.order_number, -- New field from Polterstore
            o.status as status,
            o.payment_status,
            o.fulfillment_status,
            -- Dost expects total_amount in cents (Stripe standard)
            (o.total_amount * 100)::integer as total_amount,
            o.created_at,
            o.updated_at,
            -- Subtotal, tax, shipping (Dost expects cents)
            (o.subtotal_amount * 100)::integer as subtotal_amount,
            (o.shipping_amount * 100)::integer as shipping_amount,
            (o.tax_amount * 100)::integer as tax_amount,
            -- Map order items
            (
                select jsonb_agg(oi_data)
                from (
                    select 
                        oi.id,
                        oi.product_id,
                        p.title as name, -- Map Polterstore product title to Dost item name
                        (oi.unit_price * 100)::integer as price, -- Cents
                        oi.quantity,
                        (oi.line_total * 100)::integer as line_total -- Cents
                    from public.order_items oi
                    join public.products p on p.id = oi.product_id
                    where oi.order_id = o.id
                      and oi.deleted_at is null
                ) oi_data
            ) as order_items
        from public.orders o
        where o.customer_id in (select id from public.customers where email = (select email from auth.users where id = auth.uid()))
           or o.created_by = auth.uid()
        order by o.created_at desc
    ) o_data;

    return coalesce(v_result, '[]'::jsonb);
end;
$$;

grant execute on function public.fetch_dost_orders() to authenticated;
