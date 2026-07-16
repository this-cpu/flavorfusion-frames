# Saveur — Interactive Recipe Book

A full-stack recipe app with role-based dashboards (admin, chef, home cook),
authentication, likes, comments, nutrition calculator, and a local shopping
list. Built with TanStack Start (React 19 + Vite 7) and a Postgres backend
(Supabase-compatible).

---

## Demo accounts

The database is seeded with three ready-to-use accounts. Open `/auth` and
click any of them to sign in instantly.

| Role      | Email                  | Password       |
| --------- | ---------------------- | -------------- |
| Admin     | `admin@saveur.dev`     | `admin1234`    |
| Chef      | `chef@saveur.dev`      | `chef1234`     |
| Home cook | `homecook@saveur.dev`  | `homecook1234` |

---

## Run locally on your own PC

You have two options for the backend. Pick one.

### Option A — plain Postgres (fully local, recommended for college demo)

You need: Node 20+, Bun (or npm), and Postgres 14+ running locally.

1. **Install dependencies**
   ```bash
   bun install       # or: npm install
   ```

2. **Create a local database**
   ```bash
   createdb saveur
   # or from psql:  CREATE DATABASE saveur;
   ```

3. **Load the schema and seed data**

   Every file in `supabase/migrations/` is a plain SQL script. Run them in
   filename order:
   ```bash
   for f in supabase/migrations/*.sql; do
     psql "postgresql://postgres@localhost:5432/saveur" -f "$f"
   done
   ```

   (Optional) A pre-built snapshot lives at `database/saveur-seed.sql`.
   Load it with:
   ```bash
   psql "postgresql://postgres@localhost:5432/saveur" -f database/saveur-seed.sql
   ```

4. **Point the app at your DB**

   Copy `.env` to `.env.local` and set:
   ```
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
   ```
   The frontend talks to a PostgREST-compatible API. The easiest way to
   expose your local Postgres over that API is `supabase start` (see
   Option B) — or run PostgREST directly:
   ```bash
   docker run --rm --net=host \
     -e PGRST_DB_URI="postgres://postgres@localhost:5432/saveur" \
     -e PGRST_DB_ANON_ROLE=anon \
     -e PGRST_JWT_SECRET=<random-32-chars> \
     postgrest/postgrest
   ```

5. **Start the app**
   ```bash
   bun dev           # or: npm run dev
   ```
   Open http://localhost:8080 and sign in with a demo account.

### Option B — local Supabase (schema + auth + API in one command)

You need: Docker Desktop + Supabase CLI (`brew install supabase/tap/supabase`
or the equivalent for your OS).

```bash
bun install
supabase start                # boots local Postgres + Auth + PostgREST
supabase db reset             # applies every migration + seed
```

The CLI prints an `anon key` and an `API URL`. Put them in `.env.local`:
```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key-from-supabase-start>
```
Then `bun dev` and open http://localhost:8080.

---

## Export / import the database

Save a full snapshot of the current DB (schema + data):
```bash
./scripts/export-database.sh > database/saveur-seed.sql
```

Load a snapshot into any Postgres instance:
```bash
psql "$DATABASE_URL" -f database/saveur-seed.sql
```

Both scripts are plain SQL — no vendor lock-in.

---

## Project structure

```
src/
  routes/                  file-based TanStack routes
    _authenticated/        auth-gated pages (dashboards, add recipe, admin)
    auth.tsx               sign-in / register (with demo account buttons)
    recipes.$id.tsx        recipe detail: nutrition, print, shopping list
  components/              reusable UI + shadcn components
  hooks/useAuth.tsx        session + role helpers
  integrations/supabase/   auto-generated typed client
  lib/                     shared helpers (types, shopping-list, utils)
supabase/
  migrations/              SQL migrations (create tables, seed accounts, seed recipes)
```

---

## Feature highlights (what to demo)

- **Role-aware dashboards** — the sidebar and dashboard change per role
  (admin sees moderation, chef/home-cook see their kitchen).
- **Recipe browsing** — search + category filter, cover images from Unsplash.
- **Recipe details** —
  - Print button (`window.print` with print-specific CSS)
  - Add-to-shopping-list button (localStorage; survives refresh)
  - Nutrition calculator with servings +/- scaler and % daily value bars
  - Like / unlike, comment thread with delete
- **Shopping list page** — grouped by recipe, downloadable as `.txt`, printable.
- **Admin panel** — list every user, delete recipes/comments, view KPIs.
