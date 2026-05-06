-- betterMe initial schema: spending-challenge feature
-- Tables: challenges, pots
-- Security: RLS so each user only sees rows tied to their auth.uid()

-- ----------------------------------------------------------------------------
-- challenges: a named date-bounded budget pot ("May garden")
-- ----------------------------------------------------------------------------
create table public.challenges (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  total_budget  numeric(12, 2) not null check (total_budget > 0),
  start_date    date not null,
  end_date      date not null check (end_date >= start_date),
  min_per_day   numeric(12, 2),
  max_per_day   numeric(12, 2),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- pots: one row per day in a challenge. amount is hidden until opened_at is set.
-- actual_spent + status are filled when the user logs the day's outcome.
-- ----------------------------------------------------------------------------
create table public.pots (
  id            uuid primary key default gen_random_uuid(),
  challenge_id  uuid not null references public.challenges(id) on delete cascade,
  day_date      date not null,
  amount        numeric(12, 2) not null check (amount >= 0),
  opened_at     timestamptz,
  actual_spent  numeric(12, 2),
  status        text check (status in ('met', 'under', 'over')),
  updated_at    timestamptz not null default now(),
  unique (challenge_id, day_date)
);

-- ----------------------------------------------------------------------------
-- updated_at auto-bumping trigger
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger challenges_set_updated_at
  before update on public.challenges
  for each row execute function public.set_updated_at();

create trigger pots_set_updated_at
  before update on public.pots
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row-Level Security
-- ----------------------------------------------------------------------------
alter table public.challenges enable row level security;
alter table public.pots       enable row level security;

-- challenges: users only ever see / write rows where user_id = auth.uid()
create policy challenges_select_own on public.challenges
  for select using (auth.uid() = user_id);

create policy challenges_insert_own on public.challenges
  for insert with check (auth.uid() = user_id);

create policy challenges_update_own on public.challenges
  for update using (auth.uid() = user_id);

create policy challenges_delete_own on public.challenges
  for delete using (auth.uid() = user_id);

-- pots: access flows through the parent challenge's user_id
create policy pots_select_own on public.pots
  for select using (
    exists (select 1 from public.challenges c
            where c.id = pots.challenge_id and c.user_id = auth.uid())
  );

create policy pots_insert_own on public.pots
  for insert with check (
    exists (select 1 from public.challenges c
            where c.id = pots.challenge_id and c.user_id = auth.uid())
  );

create policy pots_update_own on public.pots
  for update using (
    exists (select 1 from public.challenges c
            where c.id = pots.challenge_id and c.user_id = auth.uid())
  );

create policy pots_delete_own on public.pots
  for delete using (
    exists (select 1 from public.challenges c
            where c.id = pots.challenge_id and c.user_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------
create index challenges_user_id_idx  on public.challenges (user_id);
create index pots_challenge_id_idx   on public.pots (challenge_id);
create index pots_day_date_idx       on public.pots (day_date);
