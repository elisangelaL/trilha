# Trilha

App PWA para planejar viagens em grupo — login, viagens, descobertas (fotos/textos/links), gastos com divisão automática, membros/convites e chat (texto, foto e áudio).

O protótipo visual original (design tool) está em `Trilha.dc.html`, `support.js`, `image-slot.js`, `ios-frame.jsx` e `_ds/` — mantidos como referência de design. A implementação real está em `frontend/` (Next.js/TypeScript, PWA) e `backend/` (Node.js/Express, MVC, sobre Supabase).

## Arquitetura

- **frontend/** — Next.js (App Router) + TypeScript, PWA instalável em Android/iOS. Usa Supabase Auth diretamente (login/sessão) e fala com o backend via REST para todas as regras de negócio.
- **backend/** — Node.js/Express + TypeScript, estrutura MVC (`config/controllers/models/services/routes/middlewares/utils`). Acessa o Supabase (Postgres + Storage) com a service-role key; nunca exposta ao frontend.
- **Banco de dados** — Supabase (Postgres com RLS, Auth, Storage e Realtime para o chat).

São dois processos independentes (sem npm workspaces): rode cada pasta com seu próprio `npm install`/`npm run dev`.

## Pré-requisitos

- Node.js 20+
- Uma conta/projeto no [Supabase](https://supabase.com)

## 1. Configurar o Supabase

1. Crie um projeto no Supabase.
2. No **SQL Editor**, rode o conteúdo de `backend/supabase/migrations/0001_init.sql` — cria as tabelas, triggers, RLS e o bucket `trip-media`.
3. Em **Project Settings → API**, copie a `Project URL`, a `anon key` e a `service_role key`.
4. (Opcional) Crie uma conta pelo app (passo 4 abaixo) e depois rode `backend/supabase/seed.sql` no SQL Editor para popular 3 viagens de exemplo.

## 2. Backend

```bash
cd backend
cp .env.example .env   # preencha SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev             # http://localhost:4000
```

## 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev             # http://localhost:3000
```

## 4. Usando o app

1. Abra `http://localhost:3000/login`, clique em **Criar conta** e cadastre-se.
2. Se a confirmação de e-mail estiver habilitada no Supabase Auth, confirme o e-mail antes de logar (ou desabilite a confirmação em Authentication → Providers, para desenvolvimento).
3. Faça login, crie uma viagem, adicione descobertas/gastos, convide pessoas (por e-mail) e use o chat.

## PWA

- `frontend/src/app/manifest.ts` gera o manifest (`/manifest.webmanifest`) com ícones em `public/icons/`.
- `frontend/public/sw.js` é um service worker simples (cache-first para assets estáticos, network-first com fallback offline para navegação); registrado por `components/ServiceWorkerRegister.tsx`.
- Para testar a instalação: rode `npm run build && npm run start` (o service worker só é realmente exercitado em produção/HTTPS) e use "Adicionar à tela de início" no Chrome (Android) ou Safari (iOS). Em localhost o Chrome trata como seguro para fins de teste.

## Notas e próximos passos

- Autorização por papel (owner/editor/viewer) é aplicada tanto no backend (`middlewares/authorize.middleware.ts`) quanto via RLS no Postgres.
- Convites (`trip_invites`) para e-mails que ainda não têm conta são resolvidos automaticamente no primeiro login desse e-mail (`POST /api/auth/complete-login`).
- Áudio no chat é upload de arquivo (sem gravação nativa no navegador), por decisão de escopo.
- `npm audit` pode acusar vulnerabilidades em dependências de build do próprio `create-next-app`/Next (eslint/postcss/sharp) sem correção não-breaking disponível no momento — não introduzidas por este projeto.
# trilha
