-- RPC for Dost to fetch the current user's profile
-- Bridges Polterstore's full_name and lifecycle_status to Dost's name and expectations

create or replace function public.fetch_dost_profile()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_profile jsonb;
begin
    select jsonb_build_object(
        'id', p.id,
        'email', p.email,
        'name', coalesce(p.name, p.full_name, ''),
        'full_name', p.full_name,
        'phone', p.phone,
        'preferences', p.preferences,
        'lifecycle_status', p.lifecycle_status,
        -- Get roles compatible with Dost's text[] array expectation
        'roles', (
            select array_agg(r.code)::text[]
            from public.user_roles ur
            join public.roles r on r.id = ur.role_id
            where ur.user_id = p.id
              and ur.deleted_at is null
        )
    )
    into v_profile
    from public.profiles p
    where p.id = auth.uid()
      and p.deleted_at is null;

    return v_profile;
end;
$$;

grant execute on function public.fetch_dost_profile() to authenticated;
