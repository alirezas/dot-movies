# update-watchlist-movies

A CLI tool to update watchlist movies with additional data from TheTVDB API.

## Usage

```bash
npx update-watchlist-movies
```

## Description

This tool fetches additional movie metadata from TheTVDB API for all watchlist movies in the database that don't already have TVDB data. It enriches the movie records with extended information like plot summaries, cast, crew, ratings, and other metadata.

## Behavior

- Queries the database for watchlist movies (those without a `watchedDate`) that lack TVDB data
- Processes each movie individually, fetching data from TheTVDB API
- Shows progress with a visual progress bar
- Includes rate limiting delays to avoid API throttling
- Reports final statistics (updated vs failed movies)

## Requirements

- Valid TVDB API credentials configured in environment variables
- Database connection properly set up
- Movies must have been previously imported (e.g., via `import-letterboxd`)

## Examples

```bash
# Update all watchlist movies without TVDB data
npx update-watchlist-movies
```

## Error Handling

- Continues processing even if individual movie updates fail
- Logs specific errors for failed updates but doesn't stop the process
- Exits with code 1 for critical errors (database connection issues, etc.)
- If no movies need updating, exits gracefully with a success message

## Notes

- Uses the `updateMovieData` action from `actions/update-movie-data.ts`
- Includes a 100ms delay between API calls to prevent rate limiting
- Updates are performed in the order movies were found in the database