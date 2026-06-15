# ClutchPro Football — Frontend

Interface web do **ClutchPro Football**: plataforma premium de análise de
futebol (jogos do dia, odds, recomendações, estatísticas de partidas/times/
jogadores, entradas ao vivo e acompanhamento de performance). Consome um
backend de futebol próprio (endpoints `/football/*`).

> Produto separado do ClutchPro NBA. Mesma base visual/arquitetural, domínio
> 100% adaptado para futebol.

> Posicionamento: a UI fala em *forma, projeção, probabilidade, edge, valor e
> contexto*. Evitar linguagem de "aposta garantida".

---

## Modo Copa do Mundo

Um **toggle** na sidebar alterna o contexto entre **Futebol** e **Copa do
Mundo** (persistido em `localStorage`). Sem telas duplicadas — a lógica é
centralizada:

- Store em [src/config/competition.ts](src/config/competition.ts) + hook
  [useCompetition](src/hooks/useCompetition.ts).
- O api client ([src/services/api.ts](src/services/api.ts)) roteia
  automaticamente para `/football/*` ou `/football/world-cup/*` conforme o
  contexto — as **mesmas telas** (Jogos, Recomendações, Entradas, Performance,
  Seleções) passam a exibir dados da Copa.
- Telas **exclusivas**: **Grupos** (`/grupos`) e **Mata-mata** (`/mata-mata`).
  O menu se adapta (esconde Ligas/Jogadores/Odds no modo Copa).
- Ao alternar, as telas remontam (key por contexto em `App.tsx`) e refazem o
  fetch do contexto certo.

---

## Stack

- **React 18 + TypeScript + Vite**
- **Tailwind CSS** (design system próprio em `src/index.css` + `tailwind.config.js`)
- **react-router-dom** (rotas), **axios** (HTTP), **recharts** (gráficos)
- Deploy: imagem **Docker + nginx** (Railway). O `dist/` é **commitado**
  no repositório (build versionado).

---

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build → dist/
npm run preview  # serve o dist/ buildado
```

### Configuração da API

Backend **único** de futebol — dados e autenticação no mesmo host. A URL é
resolvida em runtime, nesta ordem:

1. `window.__APP_CONFIG__.VITE_FOOTBALL_API_URL` (injetado por `public/env.js`,
   gerado de `public/env.template.js` pelo `docker/40-generate-env.sh`)
2. `import.meta.env.VITE_FOOTBALL_API_URL` (`.env` no dev)
3. `VITE_API_URL` (legado, compat)
4. `http://localhost:8000` (fallback)

Ver `src/config/env.ts` e `src/services/api.ts`. Copie `.env.example` → `.env`.

No deploy, setar a env var **`FOOTBALL_API_URL`** no container.

---

## Estrutura de pastas

```
src/
├── main.tsx              # bootstrap React
├── App.tsx               # shell: Sidebar + Topbar + <Routes/> + guards de permissão
├── index.css             # design system (tokens, .card, .surface, fontes)
├── config/env.ts         # resolução da URL da API (runtime)
├── auth/                 # AuthContext (JWT) + permissions (roles)
├── pages/                # uma tela por rota
├── components/           # apresentação reutilizável (+ dashboard/parts)
├── lib/                  # lógica PURA (markets, odds, match, format)
├── services/api.ts       # camada HTTP (axios) — único client
└── types/index.ts        # tipos do domínio futebol (espelham o backend)
```

Direção de dependência: `pages → components + lib + services → types`.
Componentes não chamam `api.*` nem implementam regra de negócio.

---

## Rotas / Páginas (`src/pages/`)

| Rota             | Arquivo                  | O que faz |
|------------------|--------------------------|-----------|
| `/`              | `DashboardPage.tsx`      | Visão geral: jogos de hoje, melhores recomendações, KPIs de performance, ligas em destaque. |
| `/jogos`         | `MatchesPage.tsx`        | Lista de partidas com filtros (data, liga, status). |
| `/jogos/:id`     | `MatchAnalysisPage.tsx`  | Análise detalhada: forma/xG/xGA, desfalques, escalação, recomendação do modelo, odds. |
| `/recomendacoes` | `RecommendationsPage.tsx`| Recomendações do modelo (cartões/tabela), filtro por liga e mercado. |
| `/entradas`      | `LivePicksPage.tsx`      | Entradas ao vivo publicadas por analistas (pública, somente leitura). |
| `/publicar`      | `PublishPickPage.tsx`    | Publicar/gerenciar entradas (analista/admin · permissão `publishPicks`). |
| `/performance`   | `PerformancePage.tsx`    | Acompanhamento de resultados: KPIs + quebra por mercado/liga/analista. |
| `/ligas`         | `LeaguesPage.tsx`        | Ligas/campeonatos cobertos. |
| `/times`         | `TeamsPage.tsx`          | Busca e estatísticas de times. |
| `/jogadores`     | `PlayersPage.tsx`        | Busca e estatísticas de jogadores. |
| `/odds`          | `OddsPage.tsx`           | Comparação de odds entre casas. |
| `/config`        | `SettingsPage.tsx`       | Conta e preferências. |
| `/usuarios`      | `AdminUsersPage.tsx`     | Gestão de usuários (admin · permissão `viewUsers`). |

Auth pública: `/login`, `/register`, `/forgot-password`, `/reset-password`.
Rotas antigas (NBA) redirecionam: `/picks→/recomendacoes`, `/live→/entradas`,
`/recomendar→/publicar`, `/admin→/usuarios`.

### Permissões (`src/auth/permissions.ts`)

- **user / influencer** — visualizam tudo (dashboard, jogos, recomendações, entradas, performance, ligas, times, jogadores, odds).
- **analyst** — o do usuário + **publicar entradas** (`publishPicks`).
- **admin** — tudo + **usuários** (`viewUsers`) + performance global (`viewGlobalPerformance`).

O gate do front é só UX; a proteção real é server-side (403).

---

## Camada de dados (`src/services/api.ts`)

Cliente axios único (`baseURL` resolvida em runtime). Endpoints:

| Método | Endpoint |
|--------|----------|
| `getMatchesToday` | `GET /football/matches/today` |
| `getMatches` | `GET /football/matches` |
| `getMatch` | `GET /football/matches/:id` |
| `getMatchStatistics` | `GET /football/matches/:id/statistics` |
| `getMatchOdds` | `GET /football/matches/:id/odds` |
| `getRecommendations` | `GET /football/recommendations` |
| `getRecommendation` | `GET /football/recommendations/:id` |
| `generateRecommendations` | `POST /football/recommendations/generate` |
| `getLivePicks` | `GET /football/recommendations/live` |
| `createLivePick` | `POST /football/live-picks` |
| `updateLivePick` | `PATCH /football/live-picks/:id` |
| `deleteLivePick` | `DELETE /football/live-picks/:id` |
| `getPickResults` | `GET /football/pick-results` |
| `getPerformance` | `GET /football/performance` |
| `getLeagues` | `GET /football/leagues` |
| `getTeams` / `getTeam` | `GET /football/teams` · `/:id` |
| `getPlayers` / `getPlayer` | `GET /football/players` · `/:id` |
| `getOdds` | `GET /football/odds` |
| auth | `POST /auth/register` · `/auth/login` · `GET /auth/me` · `/auth/password/*` |
| admin | `GET /admin/users` · `PATCH /admin/users/:id` |

`src/types/index.ts` espelha os schemas: `FootballMatch`, `FootballTeam`,
`FootballPlayer`, `FootballLeague`, `FootballOdds`, `FootballRecommendation`,
`FootballLivePick`, `FootballPickResult`, `FootballPerformanceSummary`,
`MatchStatistics`, etc.

> ⚠️ Os tipos refletem o **contrato esperado** descrito no produto. Confira
> os campos contra o JSON real do backend e ajuste onde divergir.

### Tempo real = polling

Sem WebSocket/SSE. Telas com dado vivo usam `useVisiblePolling` (respeita a
visibilidade da aba): jogos/entradas ~30s; listas estáticas mais lentas.

---

## Design system

Dark-first premium. Marca laranja `#FF6A00` (`brand-*`), verde `#22C55E`
(`accent-*`, positivo/edge), superfícies `ink-*`. Utilitários: `.card`,
`.card-premium`, `.surface`, `.surface-interactive`, `.skeleton`, `.tabular`.
Copy em **PT-BR**, code names em inglês. Detalhes em `docs/design-system.md`.

---

## Deploy

`Dockerfile` faz `npm run build` e serve via `nginx.conf`. No boot,
`docker/40-generate-env.sh` gera `public/env.js` com `FOOTBALL_API_URL` do
ambiente. O `dist/` versionado permite o Railway servir sem rebuild — **após
mudanças de produção, rode `npm run build` e commite o `dist/` atualizado**.
