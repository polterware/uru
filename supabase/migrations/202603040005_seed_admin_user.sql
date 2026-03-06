-- Seed/admin bootstrap user for local/dev access to Polterstore
-- NOTE: rotate this password after first login.

do $$
declare
  v_email constant text := 'brcls0502@gmail.com';
  v_plain_password constant text := 'UruAdmin#2026!';
  v_now timestamptz := timezone('utc', now());
  v_user_id uuid;
  v_admin_role_id uuid;
  v_password_hash text;
begin
  if to_regprocedure('extensions.crypt(text,text)') is not null
     and to_regprocedure('extensions.gen_salt(text)') is not null then
    v_password_hash := extensions.crypt(v_plain_password, extensions.gen_salt('bf'));
  elsif to_regprocedure('public.crypt(text,text)') is not null
     and to_regprocedure('public.gen_salt(text)') is not null then
    v_password_hash := public.crypt(v_plain_password, public.gen_salt('bf'));
  else
    raise exception 'crypt/gen_salt not found. Ensure pgcrypto is installed.';
  end if;

  select u.id
    into v_user_id
  from auth.users u
  where lower(u.email) = lower(v_email)
  limit 1;

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      invited_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      email_change_token_new,
      email_change,
      email_change_sent_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_change,
      phone_change_token,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      is_anonymous
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      v_password_hash,
      v_now,
      v_now,
      '',
      null,
      '',
      null,
      '',
      '',
      null,
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Admin Polterstore"}'::jsonb,
      false,
      v_now,
      v_now,
      null,
      '',
      '',
      '',
      null,
      false,
      false
    );
  else
    update auth.users
    set
      encrypted_password = v_password_hash,
      email_confirmed_at = coalesce(email_confirmed_at, v_now),
      raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"full_name":"Admin Polterstore"}'::jsonb,
      updated_at = v_now,
      deleted_at = null,
      is_anonymous = false
    where id = v_user_id;
  end if;

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  select
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true),
    'email',
    v_user_id::text,
    null,
    v_now,
    v_now
  where not exists (
    select 1
    from auth.identities i
    where i.user_id = v_user_id
      and i.provider = 'email'
  );

  insert into public.profiles (id, email, full_name, deleted_at, lifecycle_status)
  values (v_user_id, v_email, 'Admin Polterstore', null, 'active')
  on conflict (id) do update
    set
      email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      deleted_at = null,
      lifecycle_status = 'active',
      updated_at = v_now;

  select r.id
    into v_admin_role_id
  from public.roles r
  where r.code = 'admin'
    and r.deleted_at is null
    and r.lifecycle_status = 'active'
  limit 1;

  if v_admin_role_id is null then
    raise exception 'Admin role not found in public.roles';
  end if;

  insert into public.user_roles (user_id, role_id, deleted_at, lifecycle_status)
  values (v_user_id, v_admin_role_id, null, 'active')
  on conflict (user_id, role_id) do update
    set
      deleted_at = null,
      lifecycle_status = 'active',
      updated_at = v_now;
end
$$;
