-- Dados de exemplo (opcional) — recria as 3 viagens do protótipo original.
-- Pré-requisito: crie ao menos 1 conta pelo app (tela de login > Criar conta)
-- antes de rodar este script — ele usa o profile mais antigo como dono/único
-- membro das viagens de exemplo.

do $$
declare
  v_owner uuid;
  v_trip1 uuid;
  v_trip2 uuid;
  v_trip3 uuid;
  v_entry uuid;
begin
  select id into v_owner from public.profiles order by created_at asc limit 1;

  if v_owner is null then
    raise notice 'Nenhum profile encontrado — crie uma conta no app antes de rodar o seed.';
    return;
  end if;

  insert into public.trips (title, location, start_date, end_date, owner_id)
  values ('Patagônia', 'Argentina & Chile', '2026-11-12', '2026-11-24', v_owner)
  returning id into v_trip1;

  insert into public.trips (title, location, start_date, end_date, owner_id)
  values ('Lisboa & Porto', 'Portugal', '2027-01-03', '2027-01-10', v_owner)
  returning id into v_trip2;

  insert into public.trips (title, location, start_date, end_date, owner_id)
  values ('Kyoto no Outono', 'Japão', '2026-10-18', '2026-10-27', v_owner)
  returning id into v_trip3;

  insert into public.trip_entries (trip_id, author_id, category) values (v_trip1, v_owner, 'visitar') returning id into v_entry;
  insert into public.trip_entry_items (entry_id, trip_id, author_id, type, caption)
  values (v_entry, v_trip1, v_owner, 'photo', 'Fitz Roy visto de El Chaltén — referência para o mirante da Laguna de los Tres');

  insert into public.trip_entries (trip_id, author_id, category) values (v_trip1, v_owner, 'visitar') returning id into v_entry;
  insert into public.trip_entry_items (entry_id, trip_id, author_id, type, title, body)
  values (v_entry, v_trip1, v_owner, 'text', 'Trilha Laguna de los Tres',
    '20km ida e volta, nível moderado. Melhor horário: sair ao amanhecer para evitar o vento forte na subida final.');

  insert into public.trip_entries (trip_id, author_id, category) values (v_trip1, v_owner, 'comer') returning id into v_entry;
  insert into public.trip_entry_items (entry_id, trip_id, author_id, type, title, body)
  values (v_entry, v_trip1, v_owner, 'text', 'La Tapera (El Chaltén)',
    'Recomendado para cordeiro patagônico antes da trilha. Costuma ter fila.');

  insert into public.trip_expenses (trip_id, paid_by, description, amount, category)
  values
    (v_trip1, v_owner, 'Passagem aérea BUE–EZE', 2380, 'Transporte'),
    (v_trip1, v_owner, 'Ingresso Parque Torres del Paine', 120, 'Passeios'),
    (v_trip1, v_owner, 'Refúgio Los Cuernos (2 noites)', 610, 'Hospedagem');

  insert into public.trip_entries (trip_id, author_id, category) values (v_trip2, v_owner, 'visitar') returning id into v_entry;
  insert into public.trip_entry_items (entry_id, trip_id, author_id, type, caption)
  values (v_entry, v_trip2, v_owner, 'photo', 'Elétrico 28 — trajeto que passa pela Alfama');

  insert into public.trip_expenses (trip_id, paid_by, description, amount, category)
  values (v_trip2, v_owner, 'Airbnb Alfama (5 noites)', 780, 'Hospedagem');

  insert into public.trip_entries (trip_id, author_id, category) values (v_trip3, v_owner, 'visitar') returning id into v_entry;
  insert into public.trip_entry_items (entry_id, trip_id, author_id, type, caption)
  values (v_entry, v_trip3, v_owner, 'photo', 'Arashiyama no outono — época das folhas de bordo');

  insert into public.trip_expenses (trip_id, paid_by, description, amount, category)
  values (v_trip3, v_owner, 'JR Pass 7 dias', 1450, 'Transporte');

  raise notice 'Seed concluído para o profile %', v_owner;
end $$;
