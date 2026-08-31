-- Fixes "function gen_salt(unknown) does not exist" on the password-reset
-- and admin-account RPCs. Supabase installs the pgcrypto extension
-- (crypt/gen_salt) into the `extensions` schema, not `public` -- the
-- earlier version of these functions didn't include that schema in their
-- search_path, so they couldn't find those functions when called via RPC.
-- Run this once; it's safe to re-run.

create or replace function public.verify_reset_identity(p_phone text, p_birth_year int)
returns boolean
language sql
security definer
set search_path = public, extensions
as $$
  select exists(
    select 1 from learners
    where regexp_replace(phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
      and date_of_birth is not null
      and extract(year from date_of_birth)::int = p_birth_year
  );
$$;

create or replace function public.reset_learner_password(
  p_phone text,
  p_birth_year int,
  p_new_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  target_id uuid;
begin
  select id into target_id from learners
  where regexp_replace(phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
    and date_of_birth is not null
    and extract(year from date_of_birth)::int = p_birth_year
  limit 1;

  if target_id is null then
    return false;
  end if;

  update auth.users
  set encrypted_password = crypt(p_new_password, gen_salt('bf')), updated_at = now()
  where id = target_id;

  return true;
end;
$$;

create or replace function public.create_admin_account(
  p_full_name text,
  p_email text,
  p_password text,
  p_role text,
  p_permissions text[]
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  new_user_id uuid := gen_random_uuid();
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Only a super admin can create admin accounts.';
  end if;

  if p_role not in ('admin', 'super_admin') then
    raise exception 'Invalid role: %', p_role;
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated',
    p_email, crypt(p_password, gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}', '{}',
    now(), now(), '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), new_user_id, new_user_id::text,
    jsonb_build_object('sub', new_user_id::text, 'email', p_email, 'email_verified', true),
    'email', now(), now(), now()
  );

  insert into public.admins (id, full_name, email, role, permissions, created_by)
  values (new_user_id, p_full_name, p_email, p_role, p_permissions, auth.uid());

  return new_user_id;
end;
$$;

create or replace function public.remove_admin_account(p_admin_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Only a super admin can remove admin accounts.';
  end if;
  if p_admin_id = auth.uid() then
    raise exception 'You cannot remove your own admin access.';
  end if;
  delete from auth.users where id = p_admin_id;
end;
$$;

grant execute on function public.verify_reset_identity(text, int) to anon, authenticated;
grant execute on function public.reset_learner_password(text, int, text) to anon, authenticated;
