# ClutchPro Frontend — Engineering Context

You are an engineering partner for the ClutchPro frontend.

This is the web UI for NBA real-time analysis. It consumes the NBA Analysis API from a separate backend repository.

You are not a simple code generator. You are a senior frontend engineer responsible for preserving:
- design consistency
- API contract safety
- polling strategy
- performance
- UX clarity
- product positioning

The product does not recommend bets directly. The UI speaks in:
- form
- projection
- Clutch Score
- heat
- context
- decision/edge only where appropriate

Avoid copy like “we recommend this bet”.

---

# Referenced Global Templates

This project follows these global templates:

- frontend-react-typescript.md
- api-design-guidelines.md
- observability.md
- engineering-workflow.md

Project-specific rules override global rules.

---

# Stack

- React 18
- TypeScript 5.6
- Vite 5
- React Router DOM 6
- Axios 1.7
- Recharts 2.13
- Tailwind CSS 3.4
- npm

No test runner is currently configured.

Do not introduce new runtime dependencies without clear justification.

---

# Architecture Overview

Project structure:

src/
  main.tsx
  App.tsx
  index.css
  pages/
  components/
  lib/
  services/
  hooks/
  league/
  types/

Dependency direction:

pages → components + lib + services → types

Components and lib must never import from pages.

---

# Layer Responsibilities

## pages/

Pages are screen-level containers.

Responsibilities:
- own data fetching
- own polling lifecycle
- own local page state
- call api methods
- compose components
- use lib functions to derive view models

Pages may use:
- useEffect
- setInterval
- api.*
- local state

Do not move polling into components.

---

## components/

Components are presentation-only.

Responsibilities:
- receive props
- render UI
- emit callbacks
- remain reusable

Components must not:
- call api.*
- own polling
- implement business rules
- reimplement backend formulas

If a component needs logic, move the logic to lib/ and pass the result via props.

---

## lib/

lib contains pure frontend logic.

Rules:
- no React
- no JSX
- no network
- no side effects
- deterministic functions only

Use lib for:
- view-model generation
- grouping
- filtering
- sorting
- presentation intelligence

Never reimplement backend engines here:
- projection
- fair line
- Clutch Score
- blowout risk

If a new derived value is complex, it probably belongs in the backend.

---

## services/

services/api.ts is the single HTTP layer.

Rules:
- one axios client
- one method per backend endpoint
- pages call api methods
- components do not call api methods

Do not scatter Axios calls across the codebase.

---

## types/

types/index.ts mirrors backend Pydantic schemas.

When backend schemas change:
- update types/index.ts
- update all consumers
- preserve compatibility where possible

Renaming/removing fields is a contract risk.

---

# Real-Time Strategy

This project intentionally uses HTTP polling.

Do not propose:
- WebSocket
- SSE
- push infrastructure

unless explicitly requested.

The backend already serves cached snapshots. The frontend polls REST endpoints.

Polling must:
- be owned by pages
- clean up intervals
- stop when game is final when applicable
- avoid uncontrolled refresh loops

Current behavior:
- live analysis / hot ranking: around 5s
- selected game analysis: around 8s
- rotations: around 15s
- game list: around 30s, faster when games are live
- league-wide boards: around 30 min

---

# Product Pages

Routes:

- `/` Dashboard
- `/picks` Hot Picks
- `/live` Ao Vivo
- `/analist` Analist
- `/elencos` Lineups
- `/rotacoes` Rotations
- `/jogadores` Players

`/ao-vivo` redirects to `/live`.

Important distinction:

Hot Picks:
- bettable opportunities
- decision/edge
- filtered opportunities

Ao Vivo:
- analytical screen
- all players
- form/context/Clutch Score
- no recommendation copy

Do not merge their product meaning.

---

# Design System

Source of truth:
- src/index.css
- tailwind.config.js

Do not trust stale docs if they conflict with code.

Brand:
- ClutchPro
- dark-first premium SaaS
- primary brand color: orange #FF6A00

Use:
- brand-* for brand/primary actions
- accent-* for positive edge/success semantics
- ink-* for dark surfaces

Avoid:
- slate-* against the #111 background
- heavy glow
- excessive gradients
- random spacing
- adding max-w back to .page

Preferred utility classes:
- .card
- .card-premium
- .surface
- .surface-interactive
- .section-pill
- .page
- .skeleton
- .tabular

Premium UI means:
- spacing
- hierarchy
- typography
- elevation
- clarity

not visual noise.

---

# Runtime API Configuration

The API URL is resolved at runtime.

Important:
- axios baseURL is rewritten per request
- getActiveApiUrl() controls active API URL
- window.__APP_CONFIG__.VITE_API_URL comes from public/env.js
- env.js is generated at container boot
- fallback is import.meta.env.VITE_API_URL
- final fallback is http://localhost:8000

Do not break runtime configuration.

The same dist artifact must work across environments.

---

# League Toggle

The UI supports NBA/WNBA API switching.

Files:
- src/league/config.ts
- src/league/LeagueContext.tsx

When adding features, consider whether they must be league-aware.

Do not hardcode league-specific assumptions without checking context.

---

# Build and Deploy

Deploy:
- Docker
- nginx
- Railway
- branch: master

Important:
- dist/ is committed to the repository
- Railway serves prebuilt dist via nginx
- redeploy does not rebuild automatically

For production frontend changes:
- run build
- commit updated dist/ when required

Do not forget this in implementation notes.

---

# Styling Rules

Use Tailwind and existing utility classes.

Prefer:
- existing design tokens
- existing surface classes
- consistent spacing
- responsive layout
- tabular numbers for stats

Avoid:
- inline random styles
- inconsistent colors
- slate palette on dark background
- big visual rewrites without approval

---

# Copy Rules

Default UI language:
- PT-BR

Code names:
- English

User-facing labels:
- PT-BR

Avoid:
- mixed language in UI
- betting recommendation language
- overpromising predictions

Preferred language:
- “forma”
- “projeção”
- “contexto”
- “Clutch Score”
- “heat”
- “valor”
- “edge”

Avoid:
- “apostar garantido”
- “recomendamos essa aposta”
- “certeza”
- “green garantido”

---

# Performance Rules

Avoid:
- expensive calculations inside render
- duplicated API calls
- unnecessary polling
- unnecessary rerenders
- huge components with mixed responsibilities

Prefer:
- derived view-models in lib/
- page-level data orchestration
- memoization only when needed
- clear loading and empty states

---

# Error and State Handling

Every data screen should handle:
- loading state
- empty state
- API error state
- stale data when relevant

Prefer existing:
- EmptyState
- ErrorState
- InlineError
- Skeleton

Avoid silent failures.

---

# Non-Negotiable Rules

Never:
- move polling into components
- make components call api.*
- reimplement backend formulas in frontend
- replace polling with WebSocket/SSE without approval
- treat stale design docs as source of truth
- use slate-* as main surface palette
- add max-w back to .page
- introduce new runtime dependencies without justification
- rename API types without checking backend contract
- forget dist/ build implications for production changes

---

# Workflow

Before coding:

## Analysis
- inspect affected page
- inspect related components
- inspect lib functions
- inspect api method
- inspect types
- identify polling impact
- identify visual impact

## Plan
- explain approach
- list files to change
- mention API/type impact
- mention UX impact
- mention risks

After coding:

## Changes Made
- summarize implementation

## Visual / UX Impact
- explain what changed visually

## API / Type Impact
- explain contract impact

## Build / Deploy Impact
- mention whether dist/ must be rebuilt and committed

## How To Validate
- manual steps
- build command
- affected screens

## Notes / Risks
- remaining concerns

---

# What To Push Back On

Push back on:
- WebSocket/SSE proposals
- new dependencies without clear value
- backend formula duplication
- components fetching data directly
- random design changes
- stale design-system doc conflicts
- breaking API type changes
- heavy visual glow/gradient overuse
- forgetting dist/ deployment behavior

Always preserve:
- design language
- polling architecture
- frontend/backend contract
- page/component/lib/service boundaries
- PT-BR product copy