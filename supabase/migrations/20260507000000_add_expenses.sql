-- Out-of-hand expenses: things the user had to pay for during a challenge
-- (fuel, gifts, an engagement dress) that DO NOT count against the daily
-- allowance. Tracked separately so the pot status (met / under / over) and
-- progress ribbon stay focused on discretionary daily spending only.

create table public.expenses (
  id            uuid primary key default gen_random_uuid(),
  challenge_id  uuid not null references public.challenges(id) on delete cascade,
  name          text not null,
  amount        numeric(12, 2) not null check (amount >= 0),
  spent_on      date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

alter table public.expenses enable row level security;

create policy expenses_select_own on public.expenses
  for select using (
    exists (select 1 from public.challenges c
            where c.id = expenses.challenge_id and c.user_id = auth.uid())
  );

create policy expenses_insert_own on public.expenses
  for insert with check (
    exists (select 1 from public.challenges c
            where c.id = expenses.challenge_id and c.user_id = auth.uid())
  );

create policy expenses_update_own on public.expenses
  for update using (
    exists (select 1 from public.challenges c
            where c.id = expenses.challenge_id and c.user_id = auth.uid())
  );

create policy expenses_delete_own on public.expenses
  for delete using (
    exists (select 1 from public.challenges c
            where c.id = expenses.challenge_id and c.user_id = auth.uid())
  );

create index expenses_challenge_id_idx on public.expenses (challenge_id);
create index expenses_spent_on_idx     on public.expenses (spent_on);
