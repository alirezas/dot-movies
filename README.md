# dot-movies

A Next.js application for tracking and managing your movie watchlist and watched movies, with integration for importing data from Letterboxd and enriching movie data via TVDB.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript (strict mode)
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS 4 with dark mode
- **API**: TVDB v4 (auto-generated OpenAPI client)
- **Linting/Formatting**: Biome
- **CI/CD**: GitHub Actions + Vercel (builds run on Vercel)
- **Git Hooks**: Husky (pre-push validation)

## Features

- Netflix-style movie page: full-bleed rotating backdrop, title logo, runtime/rating/genres, overview, cast and gallery rows
- Watch trailers in a modal (YouTube/Vimeo embeds)
- Maintain a personal watchlist
- Track watched movies with date tracking
- Infinite scroll pagination
- Import data from Letterboxd via CLI tools
- TVDB integration for movie posters, artwork, and metadata
- Dark mode support

## Getting Started

### Prerequisites

- Node.js 24 (matches CI)
- pnpm 12 (`pnpm-workspace.yaml` uses settings older pnpm versions can't read)

### Environment Variables

Create a `.env` file in the project root (the CLI tools read `.env`; Next.js also reads `.env.local`):

```env
DATABASE_URL=your_neon_database_url
TVDB_API_KEY=your_tvdb_api_key
```

### Setup

```bash
pnpm install
pnpm db:push    # push schema to database
pnpm dev        # start development server
```

Open [http://localhost:6001](http://localhost:6001) with your browser.

## CLI Tools

The project includes CLI tools for data management:

- **Import from Letterboxd**: `pnpm letterboxd:import <directory>`
- **Update watched movies with TVDB data**: `pnpm movies:update-tvdb`
- **Update watchlist movies with TVDB data**: `pnpm watchlist:update-tvdb`
- **Rebuild people and credits from stored TVDB data**: `pnpm people:backfill`
- **Fetch TVDB profiles for people**: `pnpm people:update-tvdb`

See [docs/README.md](docs/README.md) for detailed documentation.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm check` | TypeScript type check |
| `pnpm lint` | Lint with Biome |
| `pnpm lint:fix` | Lint and auto-fix |
| `pnpm format` | Format with Biome |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run Drizzle migrations |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm generate:tvdb` | Regenerate TVDB API client |
| `pnpm release` | Bump version, update changelog, commit & tag |
| `pnpm update:deps` | Interactively update dependencies (taze) |
| `pnpm letterboxd:import` | Import a Letterboxd export |
| `pnpm movies:update-tvdb` | Refresh TVDB data for watched movies |
| `pnpm watchlist:update-tvdb` | Refresh TVDB data for watchlist movies |
| `pnpm people:backfill` | Rebuild people and credits from stored TVDB data |
| `pnpm people:update-tvdb` | Fetch missing or stale TVDB person profiles |

## Development Workflow

- **`main`** is protected — direct pushes are blocked
- Create a feature branch (e.g. `dev`), push changes, and open a PR to `main`
- PRs must pass the **Lint & Type Check** CI check before merging
- Husky runs `pnpm lint && pnpm check && pnpm build` locally on `git push` (skipped on the `dev` branch)
- `main` is squash-merged, so after a merge `dev` may need `git merge -s ours origin/main` to avoid phantom conflicts on the next PR (only when the two trees are identical)

## Deployment

The **Vercel Deploy** GitHub Actions workflow handles deploys:

- **Pull requests** → preview deployment
- **Push to `main`** → production deployment

Deploys run `vercel deploy`, so the build happens on Vercel. `DATABASE_URL` and `TVDB_API_KEY` are stored as Vercel *Sensitive* variables, which `vercel pull` can't read (it writes the literal `[SENSITIVE]`), so don't switch back to building on the runner with `vercel build` + `--prebuilt`.

## Releasing

This project uses [changelogen](https://github.com/unjs/changelogen) for versioning and changelog generation. Write commits using [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
git commit -m "feat: add watchlist filtering"
git commit -m "fix: movie poster not loading"
git commit -m "refactor: simplify sidebar layout"
```

When ready to release:

```bash
pnpm release          # bumps version, updates CHANGELOG.md, commits & tags
git push --follow-tags # push commit and tag to remote
```

The app version is displayed in the sidebar and is read from `package.json` at build time.
