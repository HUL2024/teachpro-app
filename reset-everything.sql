-- Wipes EVERYTHING this app created in Supabase: all tables, all functions,
-- and all user accounts (learners AND admins). Run this first, then run the
-- fresh supabase_schema.sql below. There is no undo -- make sure you
-- actually want a clean slate before running this.

drop table if exists final_assessment_questions cascade;
drop table if exists quizzes cascade;
drop table if exists lessons cascade;
drop table if exists enrollments cascade;
drop table if exists certificate_requests cascade;
drop table if exists courses cascade;
drop table if exists admins cascade;
drop table if exists teachers cascade;   -- old name
drop table if exists learners cascade;   -- in case of a partial re-run

drop function if exists public.is_admin(uuid);
drop function if exists public.is_super_admin(uuid);
drop function if exists public.admin_permissions(uuid);
drop function if exists public.create_admin_account(text, text, text, text, text[]);
drop function if exists public.remove_admin_account(uuid);

-- Deletes every signed-up account (learners and admins alike). Comment this
-- out if you'd rather keep existing logins and only reset app data/tables.
delete from auth.users;
