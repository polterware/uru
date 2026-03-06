-- RPC for Dost to update the current user's profile
-- Syncs 'name' to Polterstore's 'full_name' automatically via the trigger we created earlier

create or replace function public.update_dost_profile(
  p_name text,
  p_phone text default null,
  p_preferences jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    update public.profiles
    set 
        name = p_name, -- This will trigger the sync to full_name
        phone = p_phone,
        preferences = coalesce(p_preferences, preferences),
        updated_at = now()
    where id = auth.uid();
    
    if not found then
        raise exception 'Profile not found';
    end if;
end;
$$;

grant execute on function public.update_dost_profile(text, text, jsonb) to authenticated;
