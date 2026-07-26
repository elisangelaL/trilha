-- Permite editar o texto de uma mensagem já enviada (só o autor).

alter table public.trip_messages add column if not exists edited_at timestamptz;

create policy "trip_messages: update own text" on public.trip_messages
  for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());
