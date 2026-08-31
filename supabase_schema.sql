-- TeachPro Supabase schema (fresh install)
-- Run this on a clean project (or after reset-everything.sql).

create extension if not exists pgcrypto;

-- ============================================================
-- LEARNERS
-- People who log in to take courses. Deliberately named "learners", not
-- "teachers" or "users" -- this table is specifically for course-takers.
-- Admins are a completely separate concept (see ADMINS below) and never
-- get a row here, so they never show up in learner counts/analytics.
-- ============================================================
create table learners (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  phone text unique not null,
  date_of_birth date,
  country text,
  school text,
  subject text,
  level text,
  years_experience int,
  bio text,
  photo_url text,
  is_disabled boolean not null default false,
  created_at timestamptz default now()
);

-- ============================================================
-- COURSES / LESSONS / QUIZZES / FINAL ASSESSMENT
-- ============================================================
create table courses (
  id text primary key,
  title text not null,
  category text not null,
  description text,
  published boolean not null default true,
  created_at timestamptz default now()
);

-- `photos`: array of image URLs. `resources`: array of {name, url} objects,
-- used for Google Drive file links.
create table lessons (
  id uuid primary key default gen_random_uuid(),
  course_id text references courses(id) on delete cascade,
  position int not null,
  title text not null,
  content text not null default '',
  practical_example text not null default '',
  video_url text,
  photos jsonb not null default '[]',
  resources jsonb not null default '[]',
  created_at timestamptz default now()
);

-- Multiple quiz questions per lesson now (up to 10), not just one.
-- `position` orders them within the lesson.
create table quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade,
  position int not null default 1,
  question text not null,
  options text[] not null,
  correct_index int not null,
  explanation text not null default ''
);

-- Final assessment questions (up to 20 per course), same shape as quizzes
-- but attached to the course directly instead of a lesson.
create table final_assessment_questions (
  id uuid primary key default gen_random_uuid(),
  course_id text references courses(id) on delete cascade,
  position int not null,
  question text not null,
  options text[] not null,
  correct_index int not null,
  explanation text not null default ''
);

-- ============================================================
-- ENROLLMENTS / CERTIFICATE REQUESTS
-- ============================================================
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learners(id) on delete cascade,
  course_id text references courses(id) on delete cascade,
  enrolled_at timestamptz default now(),
  completed_lesson_ids text[] default '{}',
  lesson_completed_at jsonb not null default '{}',
  quiz_scores jsonb default '{}',
  final_score int,
  completed boolean default false,
  completed_at timestamptz,
  failed_attempts int default 0,
  unique (learner_id, course_id)
);

create table certificate_requests (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid references learners(id) on delete cascade,
  course_id text references courses(id) on delete cascade,
  requested_at timestamptz default now(),
  status text default 'pending' check (status in ('pending', 'issued')),
  transaction_ref text,
  certificate_url text,
  issued_at timestamptz,
  issued_by uuid
);

-- Prevents the same payment transaction reference from being used on more
-- than one certificate request, across ALL learners -- so a single payment
-- can't be reused to claim multiple certificates.
create unique index certificate_requests_transaction_ref_unique
  on certificate_requests (transaction_ref)
  where transaction_ref is not null;

-- ============================================================
-- ADMINS
-- Completely separate from learners. Admin accounts are created directly
-- by a super admin (name + role + password), not by promoting an existing
-- learner -- so an admin never has a learner profile and never counts as
-- a learner anywhere in the app.
-- role: 'super_admin' or 'admin'. permissions: which admin tabs a regular
-- admin can use -- 'certificates', 'users', 'analytics', 'content'. Super
-- admins implicitly have all of those plus 'manage_admins' regardless of
-- what's stored here.
-- ============================================================
create table admins (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  role text not null default 'admin' check (role in ('super_admin', 'admin')),
  permissions text[] not null default array['certificates', 'users', 'analytics'],
  created_at timestamptz default now(),
  created_by uuid
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table learners enable row level security;
alter table enrollments enable row level security;
alter table certificate_requests enable row level security;
alter table admins enable row level security;
alter table courses enable row level security;
alter table lessons enable row level security;
alter table quizzes enable row level security;
alter table final_assessment_questions enable row level security;

create policy "Learners manage own profile" on learners
  for all using (auth.uid() = id);

create policy "Learners manage own enrollments" on enrollments
  for all using (auth.uid() = learner_id);

create policy "Learners manage own certificate requests" on certificate_requests
  for all using (auth.uid() = learner_id);

-- Security-definer helpers -- avoid the infinite-recursion problem you'd
-- get from a policy on `admins` that queries `admins` directly, and let us
-- check admin status from policies on other tables cheaply.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(select 1 from admins where id = uid);
$$;

create or replace function public.is_super_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(select 1 from admins where id = uid and role = 'super_admin');
$$;

create or replace function public.admin_permissions(uid uuid)
returns text[]
language sql
security definer
set search_path = public
as $$
  select case
    when exists(select 1 from admins where id = uid and role = 'super_admin')
      then array['certificates', 'users', 'analytics', 'content', 'manage_admins']
    else coalesce((select permissions from admins where id = uid), array[]::text[])
  end;
$$;

create policy "Admins can view all learners" on learners
  for select using (public.is_admin(auth.uid()));

create policy "Super admins can update any learner" on learners
  for update using (public.is_super_admin(auth.uid()));

create policy "Admins can view all cert requests" on certificate_requests
  for select using (public.is_admin(auth.uid()));

create policy "Admins can update cert requests" on certificate_requests
  for update using (public.is_admin(auth.uid()));

create policy "Admins can view all enrollments" on enrollments
  for select using (public.is_admin(auth.uid()));

create policy "Admins can view own admin row" on admins
  for select using (auth.uid() = id);

create policy "Super admins view all admin rows" on admins
  for select using (public.is_super_admin(auth.uid()));

create policy "Super admins update admin rows" on admins
  for update using (public.is_super_admin(auth.uid()));

-- Course content: any signed-in learner or admin can read it. Only admins
-- with the 'content' permission can write to it.
create policy "Any signed-in user can view courses" on courses
  for select using (auth.role() = 'authenticated');
create policy "Content admins manage courses" on courses
  for all using ('content' = any(public.admin_permissions(auth.uid())));

create policy "Any signed-in user can view lessons" on lessons
  for select using (auth.role() = 'authenticated');
create policy "Content admins manage lessons" on lessons
  for all using ('content' = any(public.admin_permissions(auth.uid())));

create policy "Any signed-in user can view quizzes" on quizzes
  for select using (auth.role() = 'authenticated');
create policy "Content admins manage quizzes" on quizzes
  for all using ('content' = any(public.admin_permissions(auth.uid())));

create policy "Any signed-in user can view final assessment questions" on final_assessment_questions
  for select using (auth.role() = 'authenticated');
create policy "Content admins manage final assessment questions" on final_assessment_questions
  for all using ('content' = any(public.admin_permissions(auth.uid())));

-- ============================================================
-- ADMIN ACCOUNT CREATION / REMOVAL
-- A super admin creates a brand-new admin account directly (name, email,
-- password, role) right from the app -- no separate learner sign-up first.
-- This needs to insert into auth.users, which the client's public API key
-- can never do directly (by design, for security). The trick: a
-- SECURITY DEFINER function runs with the privileges of whoever created it
-- (the project owner), so it CAN write to auth.users -- but only through
-- this one narrow, deliberate door, and only after checking the caller is
-- already a super admin. This is a well-established pattern for doing
-- admin-style user creation without exposing the powerful service_role key
-- to the browser.
-- ============================================================
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

-- Removing an admin means they can no longer log in at all (unlike
-- disabling a learner, which just blocks app access) -- so this deletes
-- the auth account outright, not just the admins row.
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

-- ============================================================
-- SELF-SERVICE PASSWORD RESET (phone + birth year)
-- No email/SMS involved -- a learner proves who they are with the phone
-- number their account is under plus their birth year, then sets a new
-- password directly. This is deliberately simple for low-connectivity
-- users who may not check email regularly, but it IS lower-security than
-- an email or SMS reset link: a phone number plus a ~80-year birth-year
-- range is a small, guessable search space for anyone who already knows
-- the target's phone number. Treat this as a convenience tradeoff made
-- knowingly, not an oversight.
-- ============================================================

-- Read-only check, used to gate step 1 of the reset form before ever
-- showing a "set new password" screen.
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

-- Re-verifies the same match server-side (never trust the client skipped
-- straight to this) before actually changing the password.
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

-- These must be callable by a signed-OUT visitor (that's the whole point
-- of "forgot password"), so grant execute to anon explicitly.
grant execute on function public.verify_reset_identity(text, int) to anon, authenticated;
grant execute on function public.reset_learner_password(text, int, text) to anon, authenticated;

-- ============================================================
-- PROFILE PHOTOS (Supabase Storage)
-- Photos are compressed client-side to under 300KB before upload (see
-- src/lib/imageCompress.ts), then stored under avatars/{learner_id}/... so
-- the RLS policies below can key access off the folder name matching the
-- signed-in user's id.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Learners can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Learners can replace their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Learners can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- SEED: the first super admin
-- ============================================================
do $$
declare
  admin_id uuid := gen_random_uuid();
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
    'georgeet028@gmail.com', crypt('%212121.', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}', '{}',
    now(), now(), '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), admin_id, admin_id::text,
    jsonb_build_object('sub', admin_id::text, 'email', 'georgeet028@gmail.com', 'email_verified', true),
    'email', now(), now(), now()
  );

  insert into public.admins (id, full_name, email, role, permissions)
  values (admin_id, 'Enoch T George', 'georgeet028@gmail.com', 'super_admin',
          array['certificates', 'users', 'analytics', 'content', 'manage_admins']);
end $$;

-- NOTE: direct auth.users/auth.identities inserts rely on the current
-- Supabase auth schema shape. If this seed block errors on your project
-- (auth internals occasionally change), create the account instead via
-- Supabase Dashboard -> Authentication -> Add User (with the same email
-- and password), then run just this to grant admin rights:
--   insert into admins (id, full_name, email, role, permissions)
--   select id, 'Enoch T George', email, 'super_admin',
--          array['certificates','users','analytics','content','manage_admins']
--   from auth.users where email = 'georgeet028@gmail.com';
