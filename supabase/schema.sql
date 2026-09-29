-- The one table behind sign-in: each person's marks, one row per game.
-- Paste into Supabase → SQL Editor → Run. Safe to run again.

create table if not exists public.marks (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  -- Product id from the official novelties list (or "pick:<title>" for shortlist-only games).
  game_id text not null,
  -- null = cleared; kept so a device that syncs later sees the clear instead of resurrecting the mark.
  mark text check (mark in ('star', 'buy', 'bought')),
  updated_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

alter table public.marks enable row level security;

-- Everyone sees and changes only their own rows.
drop policy if exists "own marks" on public.marks;
create policy "own marks" on public.marks
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
