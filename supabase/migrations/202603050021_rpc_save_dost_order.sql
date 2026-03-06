-- RPC to save a Dost order into Polterstore's normalized schema
-- Called by the Stripe Webhook in the Dost Client

create or replace function public.save_dost_order(
    p_user_id uuid,
    p_email text,
    p_customer_name text,
    p_total_cents integer,
    p_shipping_cents integer,
    p_tax_cents integer,
    p_payment_intent_id text,
    p_checkout_id text,
    p_items jsonb -- Array of {product_id, quantity, unit_price_cents}
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_customer_id uuid;
    v_order_id uuid;
    v_order_number text;
    v_item record;
    v_total_amount numeric;
    v_shipping_amount numeric;
    v_tax_amount numeric;
    v_subtotal_amount numeric;
begin
    -- 1. Convert cents to numeric (BRL standard in Polterstore)
    v_total_amount := p_total_cents::numeric / 100;
    v_shipping_amount := p_shipping_cents::numeric / 100;
    v_tax_amount := p_tax_cents::numeric / 100;
    v_subtotal_amount := v_total_amount - v_shipping_amount - v_tax_amount;

    -- 2. Ensure customer exists in Polterstore's table
    insert into public.customers (full_name, email, created_by)
    values (p_customer_name, p_email, coalesce(p_user_id, '00000000-0000-0000-0000-000000000000'::uuid))
    on conflict (email) do update set 
        full_name = excluded.full_name,
        updated_at = now()
    returning id into v_customer_id;

    -- 3. Generate a unique order number (DOST-XXXXX)
    v_order_number := 'DOST-' || upper(substr(md5(random()::text), 1, 8));

    -- 4. Create the Order
    insert into public.orders (
        order_number,
        customer_id,
        status,
        payment_status,
        fulfillment_status,
        subtotal_amount,
        shipping_amount,
        tax_amount,
        total_amount,
        created_by
    )
    values (
        v_order_number,
        v_customer_id,
        'confirmed', -- Webhook means paid
        'paid',
        'unfulfilled',
        v_subtotal_amount,
        v_shipping_amount,
        v_tax_amount,
        v_total_amount,
        coalesce(p_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
    )
    returning id into v_order_id;

    -- 5. Create Order Items
    for v_item in select * from jsonb_to_recordset(p_items) as x(product_id uuid, quantity integer, unit_price_cents integer)
    loop
        insert into public.order_items (
            order_id,
            product_id,
            quantity,
            unit_price,
            line_total,
            created_by
        )
        values (
            v_order_id,
            v_item.product_id,
            v_item.quantity,
            v_item.unit_price_cents::numeric / 100,
            (v_item.unit_price_cents::numeric / 100) * v_item.quantity,
            coalesce(p_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
        );
    end loop;

    -- 6. Record the Transaction (Stripe link)
    insert into public.transactions (
        order_id,
        status,
        total_amount,
        currency,
        created_by
    )
    values (
        v_order_id,
        'captured',
        v_total_amount,
        'BRL',
        coalesce(p_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
    );

    return v_order_id;
end;
$$;

grant execute on function public.save_dost_order(uuid, text, text, integer, integer, integer, text, text, jsonb) to anon, authenticated;
