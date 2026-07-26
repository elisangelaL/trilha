-- Trilha — esquema inicial (Supabase/Postgres)
-- Aplicar via Supabase Studio (SQL Editor) ou `supabase db push`.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- profiles — espelha auth.users, criado automaticamente via trigger
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  initials text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_name text;
  v_initials text;
begin
  v_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  v_initials := upper(left(regexp_replace(v_name, '[^\w ]', '', 'g'), 1) ||
                 coalesce(left(split_part(v_name, ' ', 2), 1), ''));
  if v_initials = '' then
    v_initials := upper(left(v_name, 2));
  end if;

  insert into public.profiles (id, name, email, initials)
  values (new.id, v_name, new.email, v_initials)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- trips
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null default '',
  start_date date,
  end_date date,
  cover_url text,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.trip_members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  unique (trip_id, user_id)
);

create table if not exists public.trip_invites (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  email text not null,
  role text not null check (role in ('editor', 'viewer')),
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  invited_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.trip_entries (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('photo', 'text', 'link')),
  category text not null default 'visitar' check (category in ('visitar', 'comer', 'hospedagem', 'transporte')),
  title text,
  body text,
  caption text,
  url text,
  platform text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.trip_expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  paid_by uuid not null references public.profiles(id) on delete cascade,
  description text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  category text not null default 'Outros',
  receipt_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.trip_messages (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('text', 'image', 'audio')),
  text text,
  media_url text,
  duration_seconds numeric(6, 1),
  created_at timestamptz not null default now()
);

create index if not exists idx_trip_members_trip on public.trip_members(trip_id);
create index if not exists idx_trip_members_user on public.trip_members(user_id);
create index if not exists idx_trip_entries_trip on public.trip_entries(trip_id);
create index if not exists idx_trip_expenses_trip on public.trip_expenses(trip_id);
create index if not exists idx_trip_messages_trip on public.trip_messages(trip_id, created_at);
create index if not exists idx_trip_invites_email on public.trip_invites(email, status);

-- ─────────────────────────────────────────────────────────────────────────
-- Ao criar uma viagem, o dono automaticamente vira trip_members(role=owner)
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_trip()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.trip_members (trip_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (trip_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_trip_created on public.trips;
create trigger on_trip_created
  after insert on public.trips
  for each row execute procedure public.handle_new_trip();

-- Ao logar, convites pendentes com o mesmo e-mail viram membros
create or replace function public.accept_pending_invites(p_user_id uuid, p_email text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.trip_members (trip_id, user_id, role)
  select ti.trip_id, p_user_id, ti.role
  from public.trip_invites ti
  where ti.email = p_email and ti.status = 'pending'
  on conflict (trip_id, user_id) do nothing;

  update public.trip_invites
  set status = 'accepted'
  where email = p_email and status = 'pending';
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Helper usado pelas policies: é membro? é editor/owner? é owner?
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.is_trip_member(p_trip_id uuid, p_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.trip_members
    where trip_id = p_trip_id and user_id = p_user_id
  );
$$;

create or replace function public.trip_role(p_trip_id uuid, p_user_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select role from public.trip_members
  where trip_id = p_trip_id and user_id = p_user_id
  limit 1;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.trip_invites enable row level security;
alter table public.trip_entries enable row level security;
alter table public.trip_expenses enable row level security;
alter table public.trip_messages enable row level security;

create policy "profiles: select any authenticated" on public.profiles
  for select to authenticated using (true);
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = auth.uid());

create policy "trips: select if member" on public.trips
  for select to authenticated using (public.is_trip_member(id, auth.uid()));
create policy "trips: insert own" on public.trips
  for insert to authenticated with check (owner_id = auth.uid());
create policy "trips: update if owner" on public.trips
  for update to authenticated using (owner_id = auth.uid());
create policy "trips: delete if owner" on public.trips
  for delete to authenticated using (owner_id = auth.uid());

create policy "trip_members: select if member" on public.trip_members
  for select to authenticated using (public.is_trip_member(trip_id, auth.uid()));
create policy "trip_members: manage if owner" on public.trip_members
  for all to authenticated
  using (public.trip_role(trip_id, auth.uid()) = 'owner')
  with check (public.trip_role(trip_id, auth.uid()) = 'owner');

create policy "trip_invites: select if owner" on public.trip_invites
  for select to authenticated using (public.trip_role(trip_id, auth.uid()) = 'owner');
create policy "trip_invites: manage if owner" on public.trip_invites
  for all to authenticated
  using (public.trip_role(trip_id, auth.uid()) = 'owner')
  with check (public.trip_role(trip_id, auth.uid()) = 'owner');

create policy "trip_entries: select if member" on public.trip_entries
  for select to authenticated using (public.is_trip_member(trip_id, auth.uid()));
create policy "trip_entries: write if editor/owner" on public.trip_entries
  for all to authenticated
  using (public.trip_role(trip_id, auth.uid()) in ('owner', 'editor'))
  with check (public.trip_role(trip_id, auth.uid()) in ('owner', 'editor'));

create policy "trip_expenses: select if member" on public.trip_expenses
  for select to authenticated using (public.is_trip_member(trip_id, auth.uid()));
create policy "trip_expenses: write if editor/owner" on public.trip_expenses
  for all to authenticated
  using (public.trip_role(trip_id, auth.uid()) in ('owner', 'editor'))
  with check (public.trip_role(trip_id, auth.uid()) in ('owner', 'editor'));

create policy "trip_messages: select if member" on public.trip_messages
  for select to authenticated using (public.is_trip_member(trip_id, auth.uid()));
create policy "trip_messages: insert if member" on public.trip_messages
  for insert to authenticated with check (public.is_trip_member(trip_id, auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────
-- Storage — bucket público para fotos/recibos/áudios
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('trip-media', 'trip-media', true)
on conflict (id) do nothing;
