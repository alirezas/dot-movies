# import-letterboxd

A CLI tool to import movies from Letterboxd CSV exports into the movies database.

## Usage

```bash
npx import-letterboxd <directory>
```

## Description

This tool imports movie data from Letterboxd's exported CSV files (`watched.csv` and `watchlist.csv`) into the local database. It handles both watched movies and watchlist movies, automatically detecting which CSV files are present in the specified directory.

## Arguments

- `<directory>`: Path to the directory containing the Letterboxd CSV export files

## CSV File Format

The tool expects CSV files with the following columns (case-insensitive):

- `Name` or `name`: Movie title
- `Year` or `year`: Release year
- `Letterboxd URI` or `letterboxd_uri` or `uri`: Letterboxd URL
- `Date` or `date`: Watch date (for watched.csv only)

## Behavior

- Parses both `watched.csv` and `watchlist.csv` if they exist
- For watchlist movies, sets `watchedDate` to `null`
- Removes duplicates within the CSV data itself
- Checks against existing database entries to avoid duplicates
- Shows progress with a visual progress bar
- Reports final statistics (inserted vs skipped movies)

## Examples

```bash
# Import from a directory containing Letterboxd exports
npx import-letterboxd ./letterboxd-export

# Import only watched movies (if watchlist.csv doesn't exist)
npx import-letterboxd ./exports/watched-only
```

## Error Handling

- Exits with code 1 if the specified directory doesn't exist
- Exits with code 1 if neither CSV file is found
- Continues processing even if individual movie insertions fail
- Logs errors for failed insertions but doesn't stop the process