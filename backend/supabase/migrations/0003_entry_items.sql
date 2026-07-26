-- Descobertas viram um "container" (categoria) que acumula vários itens de
-- conteúdo (foto/texto/link/vídeo) ao longo do tempo, em vez de um post único.

create table if not exists public.trip_entry_items (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.trip_entries(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('photo', 'text', 'link', 'video')),
  title text,
  body text,
  caption text,
  url text,
  platform text,
  media_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_trip_entry_items_entry on public.trip_entry_items(entry_id, created_at);
create index if not exists idx_trip_entry_items_trip on public.trip_entry_items(trip_id);

alter table public.trip_entry_items enable row level security;

create policy "trip_entry_items: select if member" on public.trip_entry_items
  for select to authenticated using (public.is_trip_member(trip_id, auth.uid()));
create policy "trip_entry_items: write if editor/owner" on public.trip_entry_items
  for all to authenticated
  using (public.trip_role(trip_id, auth.uid()) in ('owner', 'editor'))
  with check (public.trip_role(trip_id, auth.uid()) in ('owner', 'editor'));

-- Migra as descobertas existentes: cada uma vira o primeiro item do seu próprio container.
insert into public.trip_entry_items (entry_id, trip_id, author_id, type, title, body, caption, url, platform, media_url, created_at)
select id, trip_id, author_id, type, title, body, caption, url, platform, photo_url, created_at
from public.trip_entries;

-- A partir de agora trip_entries é só o container (id, trip_id, author_id, category, created_at).
alter table public.trip_entries
  drop column type,
  drop column title,
  drop column body,
  drop column caption,
  drop column url,
  drop column platform,
  drop column photo_url;
