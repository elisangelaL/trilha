alter table public.trip_entries
  add column if not exists address text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;
