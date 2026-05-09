-- =====================================================================
-- Meal-ideas history — stores every "generate ideas" call so the user
-- can revisit past suggestions.
-- =====================================================================

create table if not exists public.meal_idea_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  max_calories int not null,
  ideas jsonb not null,           -- array of MealIdea objects (name, description, calories, ingredients, prepTime, tags)
  created_at timestamptz default now()
);
create index if not exists meal_idea_history_user_idx
  on public.meal_idea_history(user_id, created_at desc);

alter table public.meal_idea_history enable row level security;

drop policy if exists "meal_idea_history_owner" on public.meal_idea_history;
create policy "meal_idea_history_owner" on public.meal_idea_history
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
