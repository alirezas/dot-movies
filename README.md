# dot-movies

A Next.js application for tracking and managing your movie watchlist and watched movies, with integration for importing data from Letterboxd and enriching movie data via TVDB.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript (strict mode)
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS 4 with dark mode
- **API**: TVDB v4 (auto-generated OpenAPI client)
- **Linting/Formatting**: Biome

## Features

- Browse and view movie details with artwork carousel
- Maintain a personal watchlist
- Track watched movies with date tracking
- Infinite scroll pagination
- Import data from Letterboxd via CLI tools
- TVDB integration for movie posters, artwork, and metadata
- Dark mode support

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Environment Variables

Create a `.env` file in the project root:

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

Open [http://localhost:3000](http://localhost:3000) with your browser.

## CLI Tools

The project includes CLI tools for data management:

- **Import from Letterboxd**: `pnpm letterboxd:import <directory>`
- **Update watched movies with TVDB data**: `pnpm movies:update-tvdb`
- **Update watchlist movies with TVDB data**: `pnpm watchlist:update-tvdb`

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
