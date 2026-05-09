-- =====================================================================
-- Daily cache for the dashboard "what's missing" AI tip.
-- One row per (user, log_date).  POST refresh = upsert.
-- =====================================================================

create table if not exists public.dashboard_tip_cache (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  payload jsonb not null,                  -- { gaps: [...], suggestions: [...] }
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, log_date)
);
create index if not exists dashboard_tip_cache_user_date_idx
  on public.dashboard_tip_cache(user_id, log_date);

alter table public.dashboard_tip_cache enable row level security;

drop policy if exists "dashboard_tip_cache_owner" on public.dashboard_tip_cache;
create policy "dashboard_tip_cache_owner" on public.dashboard_tip_cache
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
