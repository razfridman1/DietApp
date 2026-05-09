-- =====================================================================
-- Health & Nutrition tab — schema additions
-- Run in the Supabase SQL editor.
-- All tables are tenant-scoped via user_id and protected with RLS.
-- =====================================================================

-- ---------------------------------------------------------------------
-- food_ratings  (cache + history of AI food checks)
-- ---------------------------------------------------------------------
create table if not exists public.food_ratings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  query text not null,                 -- exact user query / food name
  query_normalized text not null,      -- lowercase / trimmed for cache lookup
  lang text not null default 'he' check (lang in ('he','en')),
  rating int not null check (rating between 1 and 10),
  payload jsonb not null,              -- full AI analysis: pros, cons, effects, nutrition, alternatives, frequency
  grams numeric(7,1),
  notes text,
  color text,
  created_at timestamptz default now()
);
create index if not exists food_ratings_user_idx
  on public.food_ratings(user_id, created_at desc);
create index if not exists food_ratings_lookup_idx
  on public.food_ratings(user_id, query_normalized, lang);

-- ---------------------------------------------------------------------
-- daily_intake  (food / drink the user logs)
-- ---------------------------------------------------------------------
create table if not exists public.daily_intake (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  name text not null,
  kind text not null default 'food' check (kind in ('food','drink')),
  qty_value numeric(7,1),              -- grams or ml
  qty_unit text default 'g' check (qty_unit in ('g','ml','unit')),
  rating int check (rating between 1 and 10),  -- optional precomputed health rating
  notes text,
  color text,
  category text,
  consumed_at timestamptz default now(),
  created_at timestamptz default now()
);
create index if not exists daily_intake_user_date_idx
  on public.daily_intake(user_id, log_date desc, consumed_at desc);

-- ---------------------------------------------------------------------
-- daily_intake_analysis  (AI day analysis cache)
-- ---------------------------------------------------------------------
create table if not exists public.daily_intake_analysis (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  score int not null check (score between 1 and 10),
  status text not null check (status in ('excellent','balanced','needs_work')),
  payload jsonb not null,              -- breakdown, suggestions, totals
  created_at timestamptz default now(),
  unique (user_id, log_date)
);

-- ---------------------------------------------------------------------
-- weekly_lists  +  list_items
-- ---------------------------------------------------------------------
create table if not exists public.weekly_lists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  list_type text not null default 'shopping'
    check (list_type in ('shopping','weekly','meal_prep','recommended','avoid')),
  preset text,                          -- 'cut','muscle','general','teens','family','energy','brain','sleep'
  notes text,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists weekly_lists_user_idx
  on public.weekly_lists(user_id, created_at desc);

create table if not exists public.list_items (
  id uuid primary key default uuid_generate_v4(),
  list_id uuid not null references public.weekly_lists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  qty text,
  rating int check (rating between 1 and 10),
  reason text,                          -- "why kdai / lo kdai"
  notes text,
  color text,
  category text,
  checked boolean default false,
  position int default 0,
  created_at timestamptz default now()
);
create index if not exists list_items_list_idx
  on public.list_items(list_id, position);

-- ---------------------------------------------------------------------
-- health_notes  (free notes / mood / tags)
-- ---------------------------------------------------------------------
create table if not exists public.health_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  mood text check (mood in ('great','good','ok','tired','bad')),
  tags text[] default '{}',
  color text,
  category text,
  food_mentioned text,
  food_rating int check (food_rating between 1 and 10),
  log_date date not null default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists health_notes_user_idx
  on public.health_notes(user_id, created_at desc);

-- ---------------------------------------------------------------------
-- chat_messages  (AI nutrition assistant conversations)
-- ---------------------------------------------------------------------
create table if not exists public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  lang text default 'he' check (lang in ('he','en')),
  created_at timestamptz default now()
);
create index if not exists chat_messages_user_idx
  on public.chat_messages(user_id, created_at desc);

-- =====================================================================
-- RLS — owner-only access on every new table
-- =====================================================================
alter table public.food_ratings          enable row level security;
alter table public.daily_intake          enable row level security;
alter table public.daily_intake_analysis enable row level security;
alter table public.weekly_lists          enable row level security;
alter table public.list_items            enable row level security;
alter table public.health_notes          enable row level security;
alter table public.chat_messages         enable row level security;

do $$
declare t text;
begin
  for t in select unnest(array[
      'food_ratings','daily_intake','daily_intake_analysis',
      'weekly_lists','list_items','health_notes','chat_messages'
  ])
  loop
    execute format('drop policy if exists "%s_owner" on public.%I;', t, t);
    execute format(
      'create policy "%s_owner" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid());',
      t, t
    );
  end loop;
end $$;
