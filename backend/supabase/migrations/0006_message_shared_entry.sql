-- Permite compartilhar uma descoberta no chat da viagem (tipo de mensagem "entry",
-- igual a encaminhar uma foto/post no WhatsApp).

alter table public.trip_messages
  add column if not exists shared_entry_id uuid references public.trip_entries(id) on delete set null;

alter table public.trip_messages drop constraint if exists trip_messages_type_check;
alter table public.trip_messages
  add constraint trip_messages_type_check check (type in ('text', 'image', 'audio', 'entry'));
