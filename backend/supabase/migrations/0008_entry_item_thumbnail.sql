alter table public.trip_entry_items
  add column if not exists thumbnail_url text;
