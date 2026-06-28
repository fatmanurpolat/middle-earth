# MiddleEarth-Klip

> _"Ennyn Durin Aran Moria: pedo mellon a minno."_
> _The Doors of Durin, Lord of Moria. Speak, friend, and enter._

**MiddleEarth-Klip** is a Lord of the Rings fan app. Pass through the Doors of Durin
by speaking _"Mellon"_, choose your fellowship of nine heroes, track the books you
have read across the legendarium, and watch your **LOTR Fan Meter** rise from a
humble Hobbit of the Shire all the way to a Lord of the Rings.

It is built as an **npm-workspaces + Turborepo** monorepo with a Fastify + PostgreSQL
backend and two Vite + React + Tailwind frontends, fully typed end to end and
localized into **English, Türkçe and Português**.

---

## Overview

| Piece                    | Stack                                  | Role                                                            |
| ------------------------ | -------------------------------------- | -------------------------------------------------------------- |
| `@middleearth/landing`   | Vite · React · Tailwind                | Public lore-rich landing page with the Mellon door entry.      |
| `@middleearth/dashboard` | Vite · React · Tailwind · i18next      | The authenticated fan dashboard: books, profile, Fan Meter.    |
| `@middleearth/backend`   | Fastify · pg · JWT · Zod               | REST API under `/api`, hexagonal architecture, Postgres store. |
| `@middleearth/shared`    | TypeScript (source-only package)       | Domain types, character/book catalogues, the Fan Meter algorithm, API DTOs. |
| `@middleearth/i18n`      | TypeScript + JSON (source-only)        | Locale resources and the `SUPPORTED_LOCALES` contract.         |

Internal packages **export TypeScript source** — there is no build step in dev.
Type-checking works across package boundaries via shared `tsconfig` `paths`, and the
Vite apps resolve the same sources via `resolve.alias`. The backend runs on `tsx`
in dev (which honours those paths) and bundles its workspace deps with `tsup` for
production.

---

## Monorepo layout

```text
lord_of_the_rings/
├── apps/
│   ├── backend/            @middleearth/backend  — Fastify API (port 3000, base /api)
│   ├── landing/            @middleearth/landing  — Vite landing page (port 5173)
│   └── dashboard/          @middleearth/dashboard— Vite fan dashboard (port 5174)
├── packages/
│   ├── shared/             @middleearth/shared   — types · characters · books · fan-meter · api DTOs
│   └── i18n/               @middleearth/i18n     — en / tr / pt resources + locale contract
├── db/
│   ├── migrations/
│   │   └── 001_init.sql    pgcrypto + users / book_progress / sessions (auto-applied on first boot)
│   └── seed.sql            optional sample data (commented out)
├── docker-compose.yml      postgres:16-alpine (+ optional backend under the "full" profile)
├── turbo.json              dev / build / typecheck / lint pipelines
├── tsconfig.base.json      shared compiler options + cross-package paths
├── package.json            workspaces + root scripts
├── .env.example            copy to .env
└── README.md
```

> **Note** — `apps/*` and `packages/*` package directories are scaffolded by the
> sibling generators; this document describes the whole monorepo so the layout,
> contracts and conventions live in one place.

---

## Prerequisites

- **Node.js >= 20** (an `.nvmrc` pins `20` — run `nvm use`).
- **npm** (ships with Node; this repo uses npm workspaces).
- **Docker** + **Docker Compose** for the local PostgreSQL instance.

---

## Quickstart

```bash
# 1. Start PostgreSQL (auto-applies db/migrations on first boot)
docker compose up -d postgres

# 2. Configure environment
cp .env.example .env

# 3. Install everything (single install at the repo root)
npm install

# 4. Run the whole fellowship in dev (backend + both frontends)
npm run dev
```

Then open:

| App       | URL                                            |
| --------- | ---------------------------------------------- |
| Landing   | http://localhost:5173                          |
| Dashboard | http://localhost:5174                          |
| API       | http://localhost:3000/api (health: `/api/health`) |

### Root scripts

| Script                | What it does                                                       |
| --------------------- | ----------------------------------------------------------------- |
| `npm run dev`         | `turbo run dev` — backend + landing + dashboard concurrently.     |
| `npm run build`       | `turbo run build` — build all packages/apps (respects `^build`).  |
| `npm run typecheck`   | `turbo run typecheck` — `tsc --noEmit` across the workspace.      |
| `npm run lint`        | `turbo run lint`.                                                  |
| `npm run format`      | `prettier --write .`.                                             |
| `npm run backend`     | Just the backend (`-w @middleearth/backend`).                     |
| `npm run landing`     | Just the landing app.                                             |
| `npm run dashboard`   | Just the dashboard app.                                           |
| `npm run db:up`       | Start Postgres in the background.                                  |
| `npm run db:down`     | Stop the stack.                                                   |
| `npm run db:reset`    | **Destroy the volume** and recreate Postgres (re-applies schema). |
| `npm run db:logs`     | Tail Postgres logs.                                               |

> Migrations under `db/migrations/` are auto-applied **only on the first boot** of a
> fresh data volume. To re-apply after a schema change, run `npm run db:reset`.

### Running everything in Docker

To run the backend inside the Docker network alongside Postgres (handy for a
production-like check), use the `full` profile — it sets `DATABASE_URL` to the
`postgres` service host automatically:

```bash
docker compose --profile full up -d
```

---

## REST API

The backend serves everything under `/api`. Authenticated routes expect an
`Authorization: Bearer <jwt>` header. Errors use the shared `ApiErrorBody` shape
(`{ error: { code, message, details? } }`) with an appropriate HTTP status.

| Method   | Path                              | Auth | Body                    | Response                                   |
| -------- | --------------------------------- | :--: | ----------------------- | ------------------------------------------ |
| `GET`    | `/api/health`                     |  —   | —                       | `{ status: "ok", time: ISOstring }`        |
| `GET`    | `/api/characters`                 |  —   | —                       | `Character[]` (the shared catalogue)       |
| `GET`    | `/api/books`                      |  —   | —                       | `Book[]` (the shared catalogue)            |
| `POST`   | `/api/auth/login`                 |  —   | `LoginRequest`          | `201` `LoginResponse` (creates user + session, returns JWT) |
| `DELETE` | `/api/auth/session`               |  ✓   | —                       | `204` (revokes current session)            |
| `GET`    | `/api/me`                         |  ✓   | —                       | `MeResponse`                               |
| `PATCH`  | `/api/me`                         |  ✓   | `UpdateProfileRequest`  | `ProfileResponse`                          |
| `GET`    | `/api/books/progress`             |  ✓   | —                       | `ProgressResponse`                         |
| `PUT`    | `/api/books/:bookId/progress`     |  ✓   | `UpdateProgressRequest` | `ProgressResponse`                         |

**Progress is always complete.** Any progress array contains **all six books** —
stored rows are merged over the full `BOOKS` catalogue, and any book without a row
is returned as `isRead: false, updatedAt: null`.

All request/response shapes are defined once in `@middleearth/shared` (`api.ts`) and
imported by both the backend and the frontends, so the contract cannot drift.

---

## The Mellon door & the Nine

The landing page leads to the **Doors of Durin**. As in Moria, the password is the
Elvish word for _friend_ — speak **_"Mellon"_** (the door's enter button) and pass
through. The phrase is fixed in every locale:

| Locale | "Speak _'Mellon'_ and Enter" |
| ------ | ---------------------------- |
| `en`   | Speak 'Mellon' and Enter     |
| `tr`   | Dost de ve Öyle Gir          |
| `pt`   | Diga 'Mellon' e Entre        |

Inside the door you choose **one of nine** companions. Each carries a canonical
name, race, realm and a per-character accent palette used to theme the dashboard
via the `--accent` CSS variable:

| Id        | Name     | Race             | Realm                | Accent    | Soft      |
| --------- | -------- | ---------------- | -------------------- | --------- | --------- |
| `gandalf` | Gandalf  | Maia (Istari)    | The Wandering        | `#B8C0CC` | `#2A2E37` |
| `legolas` | Legolas  | Elf              | Woodland Realm       | `#4ADE80` | `#07271A` |
| `saruman` | Saruman  | Maia (Istari)    | Isengard             | `#E2E8F0` | `#2B2B33` |
| `aragorn` | Aragorn  | Man (Dunedain)   | Gondor & Arnor       | `#6E8FC9` | `#11203B` |
| `gimli`   | Gimli    | Dwarf            | Erebor               | `#D08B45` | `#2D1B0C` |
| `sam`     | Samwise  | Hobbit           | The Shire            | `#A3B565` | `#20260F` |
| `frodo`   | Frodo    | Hobbit           | The Shire            | `#E0B23C` | `#2C2410` |
| `boromir` | Boromir  | Man              | Gondor               | `#C75146` | `#2C100D` |
| `gollum`  | Gollum   | Stoor Hobbit     | The Misty Mountains  | `#9ACD32` | `#16210A` |

The catalogue, accessors (`getCharacter`, `isCharacterId`, `CHARACTER_IDS`) and the
matching six-book catalogue (`BOOKS`, `getBook`, `isBookId`, `TOTAL_BOOKS`) all live
in `@middleearth/shared`.

---

## The LOTR Fan Meter

Your fandom is scored from how many of the six books you have read plus how complete
your profile is. The algorithm lives in `@middleearth/shared` (`fan-meter.ts`) and is
**deterministic** — the backend and both frontends compute the identical result:

```ts
booksScore   = Math.round((booksRead / Math.max(totalBooks, 1)) * 80); // 0..80
profileScore = (hasCharacter ? 10 : 0) + (hasCustomName ? 10 : 0);     // 0..20
percentage   = Math.min(100, Math.max(0, booksScore + profileScore));  // 0..100
```

`percentage` is then mapped to a rank — the first `FAN_RANKS` entry whose
`[min, max]` range contains it:

| Rank         | Range      | Title                       |
| ------------ | ---------- | --------------------------- |
| `hobbit`     | `0–19`     | Hobbit of the Shire         |
| `ranger`     | `20–39`    | Ranger of the North         |
| `fellowship` | `40–59`    | Member of the Fellowship    |
| `captain`    | `60–79`    | Captain of Gondor           |
| `istari`     | `80–99`    | Initiate of the Istari      |
| `lord`       | `100–100`  | Lord of the Rings           |

Reading all six books and completing your profile (chosen character + custom name)
is the only way to reach **Lord of the Rings**.

---

## Internationalization (TR / EN / PT)

All user-facing copy lives in **`packages/i18n`** so the apps share one source of
truth. The package exports a small, strict contract:

```ts
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_LABELS, resources } from '@middleearth/i18n';

SUPPORTED_LOCALES; // ['en', 'tr', 'pt'] as const
DEFAULT_LOCALE;    // 'en'
LOCALE_LABELS;     // { en: 'English', tr: 'Türkçe', pt: 'Português' }
resources;         // { en: { translation }, tr: { translation }, pt: { translation } }
```

Each locale is a JSON file with an **identical key tree** (`common`, `landing`,
`auth`, `characters`, `dashboard`). Every one of the nine character titles/taglines
and the nine dashboard greetings is translated; proper nouns are preserved and the
Mellon phrase is fixed per the table above.

### How the frontends use it

Both apps initialise **i18next** with these `resources`:

- `fallbackLng: 'en'`
- `supportedLngs: SUPPORTED_LOCALES`
- **browser language detector** with `localStorage`, persisting the choice under the
  key **`me_lang`**.

Clearing that key (or switching the in-app language picker) re-detects the locale.

### Adding a new language

1. Add the new code to `SUPPORTED_LOCALES` and a label to `LOCALE_LABELS` in
   `packages/i18n/src/index.ts`.
2. Create `packages/i18n/src/locales/<code>.json` by copying `en.json` and
   translating **every** key (the tree must stay identical across locales).
3. Import it and add it to the `resources` map (and re-export it) in `index.ts`.
4. Update `AppLocale` consumers as needed — TypeScript will flag anything missing.

No app code changes are required beyond that; the language picker is driven by
`SUPPORTED_LOCALES` + `LOCALE_LABELS`.

---

## Backend architecture (hexagonal)

The backend follows a **ports-and-adapters (hexagonal)** layout so the domain logic
stays free of Fastify, JWT and Postgres specifics:

```text
            HTTP (Fastify routes)            ← inbound adapter
                     │
              application services           ← use-cases (login, progress, profile…)
                     │
                  domain                      ← entities + rules, leans on @middleearth/shared
                     │
          ports (repository interfaces)       ← e.g. UserRepository, SessionRepository
                     │
   Postgres adapters (pg)  ·  JWT/crypto adapters  ← outbound adapters
```

- **Domain & application** layers depend only on plain TypeScript and the shared
  catalogues/algorithm in `@middleearth/shared` — the same Fan Meter math the
  frontends use, guaranteeing a consistent score everywhere.
- **Ports** are interfaces; the **Postgres adapters** (using `pg`) implement them so
  the store can be swapped or faked in tests.
- **JWTs** are signed with `JWT_SECRET` (expiry `JWT_EXPIRES_IN`); each active token
  is stored as a hash in the `sessions` table, which is how `DELETE /api/auth/session`
  revokes a login.
- Inputs are validated with **Zod** at the HTTP boundary; failures map to the shared
  `ApiErrorBody` shape.

The store targets three tables — `users`, `book_progress`, `sessions` — defined in
`db/migrations/001_init.sql` (with the `pgcrypto` extension for `gen_random_uuid()`).

---

## Visual language

Dark high-fantasy. The Tailwind theme extends a Middle-earth palette — ink/night,
parchment, gold, ember/scroll-red (matching the artwork border), mithril and
elven-green — with **Cinzel** for display and **EB Garamond** for body text (loaded
from Google Fonts). Soft golden-glow and rune-shimmer animations and a per-character
`--accent` CSS variable give each companion their own mood.

---

## License

Fan project for educational purposes. _The Lord of the Rings_, its characters and
places are the property of the Tolkien Estate and their respective rights holders.
