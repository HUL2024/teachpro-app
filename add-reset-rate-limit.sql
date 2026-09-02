-- Run once on your existing project. Caps password reset attempts at 2 per
-- phone number per rolling 24 hours, shared across both steps of the
-- reset flow -- an interim mitigation until v2.0 replaces this with SMS
-- links or security questions.

create table if not exists password_reset_attempts (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  attempted_at timestamptz not null default now()
);
alter table password_reset_attempts enable row level security;

-- Return type changed from boolean to text, so the old versions must be
-- dropped first -- Postgres won't let CREATE OR REPLACE change a
-- function's return type.
drop function if exists public.verify_reset_identity(text, int);
drop function if exists public.reset_learner_password(text, int, text);

create or replace function public.verify_reset_identity(p_phone text, p_birth_year int)
returns text -- 'match' | 'no_match' | 'rate_limited'
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  normalized text := regexp_replace(p_phone, '\D', '', 'g');
  recent_count int;
begin
  insert into password_reset_attempts (phone) values (normalized);

  select count(*) into recent_count
  from password_reset_attempts
  where phone = normalized and attempted_at > now() - interval '24 hours';

  if recent_count > 2 then
    return 'rate_limited';
  end if;

  if exists(
    select 1 from learners
    where regexp_replace(phone, '\D', '', 'g') = normalized
      and date_of_birth is not null
      and extract(year from date_of_birth)::int = p_birth_year
  ) then
    return 'match';
  end if;
  return 'no_match';
end;
$$;

create or replace function public.reset_learner_password(
  p_phone text,
  p_birth_year int,
  p_new_password text
)
returns text -- 'success' | 'no_match' | 'rate_limited'
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  normalized text := regexp_replace(p_phone, '\D', '', 'g');
  recent_count int;
  target_id uuid;
begin
  insert into password_reset_attempts (phone) values (normalized);

  select count(*) into recent_count
  from password_reset_attempts
  where phone = normalized and attempted_at > now() - interval '24 hours';

  if recent_count > 2 then
    return 'rate_limited';
  end if;

  select id into target_id from learners
  where regexp_replace(phone, '\D', '', 'g') = normalized
    and date_of_birth is not null
    and extract(year from date_of_birth)::int = p_birth_year
  limit 1;

  if target_id is null then
    return 'no_match';
  end if;

  update auth.users
  set encrypted_password = crypt(p_new_password, gen_salt('bf')), updated_at = now()
  where id = target_id;

  return 'success';
end;
$$;

grant execute on function public.verify_reset_identity(text, int) to anon, authenticated;
grant execute on function public.reset_learner_password(text, int, text) to anon, authenticated;
