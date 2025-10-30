# CLI Tools Documentation

This directory contains documentation for all CLI tools available in the dot-movies project.

## Available Tools

### Data Import
- **[import-letterboxd](import-letterboxd.md)**: Import movies from Letterboxd CSV exports into the database

### Data Enrichment
- **[update-watched-movies](update-watched-movies.md)**: Fetch additional movie data from TVDB for watched movies
- **[update-watchlist-movies](update-watchlist-movies.md)**: Fetch additional movie data from TVDB for watchlist movies

## Usage

All CLI tools can be run using `npx`:

```bash
npx <tool-name> [arguments]
```

For detailed usage instructions, see the individual tool documentation.