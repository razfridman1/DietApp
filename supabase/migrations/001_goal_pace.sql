-- =====================================================================
-- Add goal_pace to profiles. Run once in Supabase SQL Editor.
-- =====================================================================

alter table public.profiles
  add column if not exists goal_pace text default 'medium'
    check (goal_pace in ('slow','medium','fast'));

-- Backfill any existing rows that came in before this column existed.
update public.profiles set goal_pace = 'medium' where goal_pace is null;
