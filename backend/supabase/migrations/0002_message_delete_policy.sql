-- Permite que o autor da mensagem ou o dono da viagem apaguem uma mensagem do chat.
-- (O backend usa a service-role key e já reforça essa mesma regra em message.service.ts;
-- esta policy é defesa em profundidade caso a tabela seja acessada com a anon/authenticated key.)

create policy "trip_messages: delete own or if owner" on public.trip_messages
  for delete to authenticated
  using (author_id = auth.uid() or public.trip_role(trip_id, auth.uid()) = 'owner');
