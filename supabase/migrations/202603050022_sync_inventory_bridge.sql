-- Bridge Trigger: Sync Polterstore's inventory_levels back to Dost's product_sizes
-- This ensures that management actions in Polterstore (desktop) reflect on the website (Dost)

create or replace function public.sync_inventory_to_dost()
returns trigger as $$
declare
    v_total_available integer;
    v_has_size_options boolean;
begin
    -- 1. Check if product has size options
    select has_size_options into v_has_size_options 
    from public.products 
    where id = new.product_id;

    -- 2. Calculate total available quantity across ALL locations
    select coalesce(sum(quantity_available), 0)
    into v_total_available
    from public.inventory_levels
    where product_id = new.product_id;

    if v_has_size_options then
        -- If it has sizes, for now we sync to a 'Default' size in Dost 
        -- or update all sizes if they are identical. 
        -- To be truly accurate, Polterstore inventory_levels should have a 'size' column.
        -- Assuming 'Default' or single size management for this bridge.
        update public.product_sizes
        set quantity = v_total_available,
            updated_at = now()
        where product_id = new.product_id;
    else
        -- Simple product: update the global quantity column
        update public.products
        set quantity = v_total_available,
            updated_at = now()
        where id = new.product_id;
    end if;

    return new;
end;
$$ language plpgsql;

drop trigger if exists tr_sync_inventory_to_dost on public.inventory_levels;
create trigger tr_sync_inventory_to_dost
    after insert or update on public.inventory_levels
    for each row execute function public.sync_inventory_to_dost();
