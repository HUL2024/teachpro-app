-- Run once on your existing project. Adds the column that powers the
-- 24-hour pacing lock between lessons.
alter table enrollments add column if not exists lesson_completed_at jsonb not null default '{}';
