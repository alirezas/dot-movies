# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm 12** (older pnpm can't read `pnpm-workspace.yaml`); Node 24.

- `pnpm dev`: dev server on port **6001**
- `pnpm lint` / `pnpm lint:fix` / `pnpm format`: Biome (no ESLint/Prettier)
- `pnpm check`: `tsc --noEmit`. CI runs only `pnpm lint` and `pnpm check`. The build runs on Vercel.
- `pnpm build`: production build. It needs `DATABASE_URL` and `TVDB_API_KEY`, because `lib/db/index.ts` and `lib/env.ts` throw at import time when they're missing.
- `pnpm db:generate` → `pnpm db:migrate` after editing `lib/db/schema/*` (`db:push` for quick local syncing)
- `pnpm generate:tvdb`: regenerates `lib/tvdb/generated/` from TVDB's OpenAPI spec. Don't hand-edit the generated files.
- CLI: `pnpm letterboxd:import <dir>`, `pnpm movies:update-tvdb`, `pnpm watchlist:update-tvdb`, `pnpm people:backfill`, `pnpm people:update-tvdb`

There is no test suite.

## Architecture

Next.js 16 App Router + React 19, with `cacheComponents: true`. That makes data fetching in pages Suspense-driven: pages render a skeleton fallback and stream an async server component.

**Data model.** Movies live in a single `movies` table (`lib/db/schema/movies.ts`). "Watched" vs "watchlist" isn't a separate table or flag. It's derived from `watchedDate`: non-null means watched, null means watchlist. All TVDB metadata lives in the `tvdb_data` jsonb column, typed as the generated `MovieExtendedRecord`; `tvdb_id` is a generated column extracted from it. `import_logs` / `import_log_entries` track web-based imports.

**DB access.** `lib/db` uses Drizzle over `@neondatabase/serverless` (HTTP driver). Read queries live in `lib/queries/*` and are wrapped in React `cache()`.

**Listing flow.** Pages (`app/page.tsx`, `app/watched`, `app/watchlist`) fetch the first page server-side and pass it to the client-side `InfiniteMovieList`. That component then pages through `GET /api/movies?offset&limit&watched|watchlist`. Rows are mapped to a slim card shape with `toMovieCardData` (`lib/types.ts`) before reaching the client.

**Movie detail.** `app/movie/[id]/_lib/movie-details.ts` turns the raw `tvdbData` blob into a `MovieDetails` view model (artwork picked by TVDB artwork type IDs, cast, trailers, and so on). Route-private code goes in `_components` / `_lib` folders.

**TVDB enrichment.** The `updateMovieData` server action (`actions/update-movie-data.ts`) searches TVDB by title and year, allows ±1 year of mismatch, fetches the extended record and stores it in `tvdb_data`. It's shared by the CLI update scripts and the dev refresh button. It then calls `syncMovieCredits` (`lib/people/credits.ts`), which mirrors the record's actors and directors into `people` / `movie_people` (keyed by TVDB people id). `pnpm people:backfill` rebuilds those tables from stored `tvdb_data` without calling TVDB.

**Person pages.** `/person/[id]` lists the person's library movies from `movie_people`. Bio, life dates and the "Other films" filmography come from TVDB's person record, which is cached on the `people` row. `getPersonProfile` (`lib/people/profile.ts`) refetches it when it's missing or more than 30 days old and saves it with `after()`. Auth for the generated client lives in `lib/tvdb/runtime-config.ts`, which logs in with the API key and caches the bearer token.

**Letterboxd import.** Core logic is in `lib/import/letterboxd.ts`, which parses the CSVs, merges watched and watchlist records, and diffs against existing rows. It takes an `ImportLogger` interface, so two front ends share it:
- the CLI (`cli/import-letterboxd.ts`, which uses terminal progress helpers from `cli/utils.ts`)
- the web importer (`lib/import/web-handler.ts`, which accepts a Letterboxd ZIP, logs to the DB and is polled by `/dev/import/[slug]`)

**Dev-only routes.** `app/dev/*` (the import UI) and `app/api/dev/*` are gated by `NODE_ENV === "development"` (`app/dev/layout.tsx` calls `notFound()` otherwise).

**Env loading.** Next.js loads `.env` / `.env.local` itself. CLI scripts and `drizzle.config.ts` call `dotenv.config()` themselves (CLI scripts do it by importing `cli/utils.ts`), so they read only `.env`.

`dist/` is stale compiled output from an early version and isn't used.

## Conventions & workflow

- Path alias `@/*` points to the repo root. Biome uses double quotes, semicolons, ES5 trailing commas and an 80-column line width. Linting is disabled for `dist/**` and `lib/tvdb/generated/**`.
- UI uses shadcn/ui (`components/ui`, `components.json`), Tailwind 4 and `next-themes` for dark mode.
- Use Conventional Commits (`feat:`, `fix:`, `refactor:` …). `pnpm release` (changelogen) bumps the version, writes `CHANGELOG.md` and tags the release. The sidebar shows the `package.json` version, injected as `APP_VERSION` in `next.config.ts`.
- `main` is protected. Work on `dev`, then open a PR to `main`, which gets squash-merged. After a merge, `dev` may need `git merge -s ours origin/main` (only when the two trees are identical) to avoid phantom conflicts.
- The Husky pre-push hook runs lint, check and build, but skips them on the `dev` branch.
- Deploys use the GitHub Actions `vercel deploy` (PR → preview, push to `main` → production), and the build runs **on Vercel**. Env vars are Vercel *Sensitive* variables that `vercel pull` can't read, so don't switch to `vercel build --prebuilt` on the runner.
