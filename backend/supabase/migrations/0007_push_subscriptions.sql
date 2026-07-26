-- Inscrições de push notification (Web Push API) por usuário/dispositivo.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_user on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

create policy "push_subscriptions: manage own" on public.push_subscriptions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
