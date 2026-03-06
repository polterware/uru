-- Align profiles table for both Polterstore and Dost compatibility

-- 1. Ensure columns from both systems exist
alter table public.profiles 
add column if not exists name text, -- Dost legacy
add column if not exists phone text, -- Dost legacy
add column if not exists preferences jsonb default '{}'::jsonb; -- Dost legacy

-- 2. Sync full_name and name columns
-- If one is updated, update the other to keep both apps working
create or replace function public.sync_profile_names()
returns trigger as $$
begin
    if (tg_op = 'INSERT' or new.full_name is distinct from old.full_name) and new.full_name is not null then
        new.name := new.full_name;
    elsif (tg_op = 'UPDATE' and new.name is distinct from old.name) and new.name is not null then
        new.full_name := new.name;
    end if;
    return new;
end;
$$ language plpgsql;

drop trigger if exists on_profile_name_sync on public.profiles;
create trigger on_profile_name_sync
    before insert or update on public.profiles
    for each row execute function public.sync_profile_names();

-- 3. Improve handle_new_user to support metadata from both apps
create or replace function public.handle_new_user()
returns trigger as $$
declare
    v_full_name text;
begin
    -- Dost uses 'name', Polterstore uses 'full_name' in raw_user_meta_data
    v_full_name := coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        ''
    );

    insert into public.profiles (id, email, full_name, name, lifecycle_status)
    values (
        new.id,
        new.email,
        v_full_name,
        v_full_name,
        'active'
    )
    on conflict (id) do update set
        email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        name = coalesce(public.profiles.name, excluded.name);

    return new;
end;
$$ language plpgsql security definer;
