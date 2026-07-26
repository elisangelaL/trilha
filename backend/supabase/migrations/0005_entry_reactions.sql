-- Curtir/não curtir uma descoberta (post do feed). Um reação por usuário por entry;
-- trocar de like para dislike (ou vice-versa) substitui a reação anterior.

create table if not exists public.trip_entry_reactions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.trip_entries(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  unique (entry_id, user_id)
);

create index if not exists idx_trip_entry_reactions_entry on public.trip_entry_reactions(entry_id);

alter table public.trip_entry_reactions enable row level security;

create policy "trip_entry_reactions: select if member" on public.trip_entry_reactions
  for select to authenticated using (
    exists (
      select 1 from public.trip_entries e
      where e.id = trip_entry_reactions.entry_id and public.is_trip_member(e.trip_id, auth.uid())
    )
  );

create policy "trip_entry_reactions: write own if member" on public.trip_entry_reactions
  for all to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.trip_entries e
      where e.id = trip_entry_reactions.entry_id and public.is_trip_member(e.trip_id, auth.uid())
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.trip_entries e
      where e.id = trip_entry_reactions.entry_id and public.is_trip_member(e.trip_id, auth.uid())
    )
  );
