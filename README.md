<h1 align="center">
  <span style="font-size:60px;">Gameverse</span>
</h1>

<p align="center">
  One hub for gaming news, live esports, and a searchable game catalog — built as a single full-stack app on the edge.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Full%20Stack-TanStack%20Start-blue" />
  <img src="https://img.shields.io/badge/Runtime-Cloudflare%20Workers-f38020" />
  <img src="https://img.shields.io/badge/Database-D1-lightgrey" />
  <img src="https://img.shields.io/badge/Cache-KV-yellow" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178c6" />
</p>

<p align="center">
  <a href="https://gameverse.playgameverse.workers.dev/" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Demo-Gameverse-black?style=for-the-badge&logo=cloudflare&logoColor=F38020" />
  </a>
</p>

---

## What it is

Gameverse is a **player-first dashboard**: a cinematic home page, a news wire fed from real RSS sources, an esports command deck with live and upcoming matches, and a **game directory** backed by the RAWG database API. Everything persists in **Cloudflare D1**, with **KV** caching so repeat visits stay fast.

No tab circus. One URL.

---

## Origin and authorship

This project **started from my first-semester project** and grew into what you see here. The **frontend was vibe coded** (fast, exploratory UI work). The **backend is my own creation** — the data model, Cloudflare bindings, scrapers, caching, and server-side behavior I designed and built myself.

---

## Highlights

| Area | What you get |
|---|---|
| **Home** | Hero story deck, live + upcoming match cards, featured & trending games, editorial "trending now" rail |
| **News** | Article hub, story pages, categories, most-read sidebar driven from D1 |
| **Esports** | Match listings and match detail with team context — Valorant, CS2, League, Dota 2 via PandaScore |
| **Games** | Filterable directory (genre, platform, rating, sort), detail pages with hero art, screenshots, related news, and similar titles |
| **Search** | Global palette (⌘/Ctrl + K) across games, articles, and matches |
| **Ops** | Scheduled cron jobs ingest news, games, and esports on a timer; KV cache invalidation keeps the UI honest after each run |

> Visual language: deep space palette, glass surfaces, gradient accents, Space Grotesk + Inter + JetBrains Mono, and micro-motion that feels expensive without being noisy.

---

## Tech Stack

- **Framework:** TanStack Start + TanStack Router — file-based routes, server functions, SSR-friendly loaders
- **UI:** React 19, Tailwind CSS v4, Radix primitives, Lucide icons, `cmdk` command menu
- **Runtime:** Cloudflare Workers (`nodejs_compat`)
- **Data:** D1 (SQLite at the edge) + KV for JSON cache blobs
- **Build:** Vite 7, TypeScript, `@cloudflare/vite-plugin` + `@lovable.dev/vite-tanstack-config`
- **Integrations:** RAWG (game metadata & art), PandaScore (esports), RSS/XML for news ingestion

---

## Repository Map

```
src/
├── routes/          # File routes: /, /news, /news/:slug, /games, /games/:slug, /esports, /esports/:id
├── components/      # TopNav, cards, dialogs, live ticker, layout chrome
├── queries/         # createServerFn handlers — the public "API" used by loaders
├── server/
│   ├── db.ts        # D1 + env resolution (dev mock vs production Workers)
│   ├── cache.ts     # KV read-through + pattern invalidation (paginated deletes)
│   ├── types.ts     # D1 row ↔ domain models (games, articles, matches, …)
│   └── scrapers/    # News RSS, RAWG games, PandaScore esports + cron dispatcher
├── lib/             # Shared helpers (formatting, game image URLs, site icon)
├── data/            # Shared TypeScript contracts (genres, platforms, shapes)
└── worker.ts        # Worker entry: HTTP → TanStack, scheduled → scrapers

migrations/          # D1 SQL schema + seed data
public/              # Static assets (favicon, placeholders)
wrangler.jsonc       # Worker name, D1 binding, KV binding, cron schedules
```

---

## Data & Caching

- D1 holds `games`, `articles`, and esports tables (`matches`, `teams`, `players`, …). Migrations live in `migrations/`.
- Catalog games ingested from RAWG carry a non-null `external_id` (RAWG id). Server queries prefer those rows so the live catalog isn't drowned out by seed data.
- KV keys namespace lists, single entities, homepage blobs, and search results. Cron handlers invalidate relevant keys after each scrape so clients don't sit on stale JSON.

---

## Cron Schedule (UTC)

| Schedule | Job |
|---|---|
| `*/30 * * * *` | News RSS → D1, invalidate `news:`, `article:`, homepage news cache |
| `0 2 * * *` | RAWG games → D1, invalidate `games:`, `game:`, homepage games cache |
| `0 */12 * * *` | Esports → D1, invalidate `esports:` and search-related keys |

---

## Getting Started

### Prerequisites

- Node 20+
- npm
- Cloudflare account with D1 and KV configured in `wrangler.jsonc`

### Install

```bash
npm install
```

### Secrets

```bash
cp dev.vars.example .dev.vars
```

| Variable | Purpose |
|---|---|
| `RAWG_API_KEY` | RAWG API — game directory + scraper |
| `PANDASCORE_API_KEY` | PandaScore — esports ingestion |

For production:

```bash
npx wrangler secret put RAWG_API_KEY
npx wrangler secret put PANDASCORE_API_KEY
```

### Database

```bash
npm run d1:migrate:local   # local
npm run d1:migrate:remote  # production
```

### Develop

```bash
npm run dev
```

### Deploy

```bash
npm run build
npm run deploy
```

---

## Scripts

| Script | Action |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm run deploy` | Deploy Worker |
| `npm run lint` / `format` | Code quality |
| `npm run d1:*` | Database migrations |

---

## Design Notes

- Dark-first interface with consistent contrast tuning for long sessions
- External game imagery normalized with fallback handling
- Subtle motion system for hover, route transitions, and ambient UI flow

---

<p align="center">
  <strong>Gameverse</strong> — news, esports, and games in one orbit.
</p>
