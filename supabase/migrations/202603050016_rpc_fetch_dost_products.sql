-- RPC to fetch products formatted for the Dost Client
-- This bridges the gap between Polterstore's normalized schema and Dost's expected interface

create or replace function public.fetch_dost_products()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_result jsonb;
begin
    select jsonb_agg(p_data)
    into v_result
    from (
        select 
            p.id,
            p.sku,
            p.slug,
            p.title as name, -- Map Polterstore title to Dost name
            p.description,
            p.price,
            p.is_published,
            p.lifecycle_status,
            p.created_at,
            p.updated_at,
            p.has_size_options,
            -- Hierarchical category mapping
            coalesce(parent_cat.name, cat.name) as category,
            case 
                when parent_cat.id is not null then cat.name 
                else null 
            end as subcategory,
            -- Images normalization (Polterstore text[] -> Dost expected format)
            case 
                when array_length(p.images, 1) > 0 then
                    (select jsonb_agg(jsonb_build_object('url', img, 'altText', null)) from unnest(p.images) as img)
                else '[]'::jsonb
            end as images,
            -- Logistics normalization (Polterstore columns -> Dost shipping object)
            jsonb_build_object(
                'weight', coalesce(p.weight, 0),
                'length', coalesce(p.depth, 0), -- depth maps to length in Dost
                'width', coalesce(p.width, 0),
                'height', coalesce(p.height, 0),
                'fragile', false,
                'dangerousGoods', false,
                'requiresSignature', false
            ) as shipping,
            -- Join sizes (using Dost's legacy table for now to maintain compatibility)
            (
                select jsonb_agg(sz_data)
                from (
                    select id, size, quantity
                    from public.product_sizes
                    where product_id = p.id
                ) sz_data
            ) as product_sizes
        from public.products p
        left join public.categories cat on cat.id = p.category_id
        left join public.categories parent_cat on parent_cat.id = cat.parent_id
        where p.deleted_at is null
          and p.lifecycle_status = 'active'
    ) p_data;

    return coalesce(v_result, '[]'::jsonb);
end;
$$;

grant execute on function public.fetch_dost_products() to anon, authenticated;
