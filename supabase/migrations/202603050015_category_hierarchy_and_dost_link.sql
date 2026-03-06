-- 1. Add hierarchy support to categories
alter table public.categories 
add column if not exists parent_id uuid references public.categories(id) on delete cascade;

-- 2. Ensure product table has the new category_id and legacy Dost columns
-- We add the legacy columns if they don't exist to prevent Dost from crashing 
-- and to allow the migration script to run if data is present.
alter table public.products 
add column if not exists category_id uuid references public.categories(id) on delete set null,
add column if not exists category text,
add column if not exists subcategory text;

-- 3. Migration script: Convert Dost text categories to Polterstore table entries
do $$
declare
    v_admin_id uuid;
    v_cat_record record;
    v_subcat_record record;
    v_parent_id uuid;
    v_child_id uuid;
    v_has_legacy_data boolean;
begin
    -- Check if we actually have data to migrate
    select exists (
        select 1 from information_schema.columns 
        where table_name = 'products' and column_name = 'category'
    ) into v_has_legacy_data;

    if not v_has_legacy_data then
        return;
    end if;

    -- Get a valid admin user for audit columns
    select id into v_admin_id from auth.users limit 1;
    
    if v_admin_id is null then
        return;
    end if;

    -- Migrate top-level categories
    for v_cat_record in 
        select distinct category from public.products where category is not null
    loop
        insert into public.categories (name, slug, created_by, lifecycle_status)
        values (v_cat_record.category, lower(v_cat_record.category), v_admin_id, 'active')
        on conflict (slug) do update set updated_at = now()
        returning id into v_parent_id;

        -- Migrate subcategories for this category
        for v_subcat_record in 
            select distinct subcategory from public.products 
            where category = v_cat_record.category and subcategory is not null
        loop
            insert into public.categories (name, slug, parent_id, created_by, lifecycle_status)
            values (
                v_subcat_record.subcategory, 
                lower(v_cat_record.category || '-' || v_subcat_record.subcategory), 
                v_parent_id, 
                v_admin_id, 
                'active'
            )
            on conflict (slug) do update set updated_at = now()
            returning id into v_child_id;

            -- Link products to the specific subcategory ID
            execute format('update public.products set category_id = %L where category = %L and subcategory = %L', 
                v_child_id, v_cat_record.category, v_subcat_record.subcategory);
        end loop;

        -- Link products that only have a category (no subcategory)
        execute format('update public.products set category_id = %L where category = %L and subcategory is null and category_id is null', 
            v_parent_id, v_cat_record.category);
    end loop;
end $$;

-- 4. Indexes for performance
create index if not exists idx_categories_parent_id on public.categories(parent_id);
create index if not exists idx_products_category_id on public.products(category_id);
