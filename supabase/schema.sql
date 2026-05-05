-- =====================================================================
-- AI Nutrition & Fitness — Supabase schema
-- Multi-tenant via Postgres RLS. Each user can only see their own rows.
-- Run this in the Supabase SQL editor.
-- =====================================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  height_cm numeric(5,1),
  weight_kg numeric(5,1),
  gender text check (gender in ('male','female','other')),
  birth_year int,
  activity_level text default 'sedentary'
    check (activity_level in ('sedentary','light','moderate','active','very_active')),
  goal text default 'maintain' check (goal in ('cut','bulk','maintain')),
  goal_pace text default 'medium' check (goal_pace in ('slow','medium','fast')),
  target_weight_kg numeric(5,1),
  protein_per_kg numeric(3,1) default 1.8,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- daily_logs
-- ---------------------------------------------------------------------
create table if not exists public.daily_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  calories_in numeric(7,1) default 0,
  calories_out numeric(7,1) default 0,
  protein_total numeric(6,1) default 0,
  carbs_total numeric(6,1) default 0,
  fats_total numeric(6,1) default 0,
  net_calories numeric(7,1) generated always as (calories_in - calories_out) stored,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, log_date)
);
create index if not exists daily_logs_user_date_idx on public.daily_logs(user_id, log_date desc);

-- ---------------------------------------------------------------------
-- meals
-- ---------------------------------------------------------------------
create table if not exists public.meals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_log_id uuid references public.daily_logs(id) on delete cascade,
  log_date date not null,
  name text not null,
  grams numeric(7,1),
  calories numeric(7,1) not null default 0,
  protein numeric(6,1) not null default 0,
  carbs numeric(6,1) not null default 0,
  fats numeric(6,1) not null default 0,
  meal_time timestamptz default now(),
  ai_generated boolean default false,
  created_at timestamptz default now()
);
create index if not exists meals_user_date_idx on public.meals(user_id, log_date desc);

-- ---------------------------------------------------------------------
-- activities
-- ---------------------------------------------------------------------
create table if not exists public.activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_log_id uuid references public.daily_logs(id) on delete cascade,
  log_date date not null,
  type text not null check (type in ('walk','run','gym','swim','cycle','yoga','other')),
  description text,
  duration_min numeric(5,1) not null,
  intensity text default 'moderate' check (intensity in ('low','moderate','high')),
  calories_burned numeric(6,1) not null default 0,
  ai_generated boolean default false,
  performed_at timestamptz default now(),
  created_at timestamptz default now()
);
create index if not exists activities_user_date_idx on public.activities(user_id, log_date desc);

-- ---------------------------------------------------------------------
-- weight_history
-- ---------------------------------------------------------------------
create table if not exists public.weight_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg numeric(5,1) not null,
  log_date date not null default current_date,
  created_at timestamptz default now(),
  unique (user_id, log_date)
);
create index if not exists weight_history_user_date_idx on public.weight_history(user_id, log_date desc);

-- ---------------------------------------------------------------------
-- ai_insights
-- ---------------------------------------------------------------------
create table if not exists public.ai_insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('diet','training','behavior','goal')),
  severity text default 'info' check (severity in ('info','warn','critical')),
  insight_text text not null,
  recommendation text,
  metric numeric,
  generated_for_date date default current_date,
  created_at timestamptz default now()
);
create index if not exists ai_insights_user_idx on public.ai_insights(user_id, created_at desc);

-- =====================================================================
-- TRIGGERS
-- =====================================================================

-- Auto-create a profile when a new auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Recompute daily_log totals on meal/activity changes
create or replace function public.recompute_daily_totals(p_user uuid, p_date date)
returns void language plpgsql security definer set search_path = public as $$
declare
  c_in numeric := 0; c_out numeric := 0;
  p_total numeric := 0; carbs_t numeric := 0; fats_t numeric := 0;
begin
  select coalesce(sum(calories),0), coalesce(sum(protein),0),
         coalesce(sum(carbs),0), coalesce(sum(fats),0)
    into c_in, p_total, carbs_t, fats_t
  from public.meals where user_id = p_user and log_date = p_date;

  select coalesce(sum(calories_burned),0) into c_out
  from public.activities where user_id = p_user and log_date = p_date;

  insert into public.daily_logs (user_id, log_date, calories_in, calories_out,
                                 protein_total, carbs_total, fats_total)
    values (p_user, p_date, c_in, c_out, p_total, carbs_t, fats_t)
  on conflict (user_id, log_date) do update set
    calories_in = excluded.calories_in,
    calories_out = excluded.calories_out,
    protein_total = excluded.protein_total,
    carbs_total = excluded.carbs_total,
    fats_total = excluded.fats_total,
    updated_at = now();
end;
$$;

create or replace function public.trg_recompute_after_meal()
returns trigger language plpgsql as $$
begin
  perform public.recompute_daily_totals(coalesce(new.user_id, old.user_id),
                                        coalesce(new.log_date, old.log_date));
  return coalesce(new, old);
end;
$$;

drop trigger if exists meals_recompute on public.meals;
create trigger meals_recompute
  after insert or update or delete on public.meals
  for each row execute function public.trg_recompute_after_meal();

drop trigger if exists activities_recompute on public.activities;
create trigger activities_recompute
  after insert or update or delete on public.activities
  for each row execute function public.trg_recompute_after_meal();

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.profiles       enable row level security;
alter table public.daily_logs     enable row level security;
alter table public.meals          enable row level security;
alter table public.activities     enable row level security;
alter table public.weight_history enable row level security;
alter table public.ai_insights    enable row level security;

-- profiles
drop policy if exists "profiles_self" on public.profiles;
create policy "profiles_self" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- generic owner policy macro: each table has user_id = auth.uid()
do $$
declare
  t text;
begin
  for t in select unnest(array['daily_logs','meals','activities','weight_history','ai_insights'])
  loop
    execute format('drop policy if exists "%s_owner" on public.%I;', t, t);
    execute format(
      'create policy "%s_owner" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid());',
      t, t
    );
  end loop;
end $$;
