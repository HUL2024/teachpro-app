-- Run once on your existing project. Adds:
--   1. date_of_birth on learners (used by registration + password reset)
--   2. a unique constraint on phone (since it's now the login identifier)
--   3. the phone+birth-year self-service password reset functions
--   4. a public 'avatars' storage bucket + policies for profile photos

alter table learners add column if not exists date_of_birth date;

-- If this fails with a duplicate-key error, you have two+ existing
-- learners sharing the same phone number on file -- fix those manually,
-- then re-run just this ALTER statement.
alter table learners add constraint learners_phone_unique unique (phone);

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

grant execute on function public.verify_reset_identity(text, int) to anon, authenticated;
grant execute on function public.reset_learner_password(text, int, text) to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly viewable" on storage.objects;
create policy "Avatar images are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Learners can upload their own avatar" on storage.objects;
create policy "Learners can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Learners can replace their own avatar" on storage.objects;
create policy "Learners can replace their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Learners can delete their own avatar" on storage.objects;
create policy "Learners can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
