#!/usr/bin/env node

import { Command } from "commander";
import { and, isNull } from "drizzle-orm";
import { updateMovieData } from "../actions/update-movie-data";
import { db } from "../lib/db/index";
import { type Movie, movies } from "../lib/db/schema/movies";
import {
  clearProgressLine,
  clearTerminal,
  createProgressBar,
  resetErrorCount,
  updateProgressLine,
  writeErrorBelow,
} from "./utils";

const fetchWatchlistMoviesWithoutTVDBData = async (): Promise<Movie[]> => {
  console.log("🔍 Fetching watchlist movies without TVDB data...");

  const watchlistMovies = await db
    .select()
    .from(movies)
    .where(
      and(isNull(movies.watchedDate), isNull(movies.tvdbData))
    );

  console.log(
    `📚 Found ${watchlistMovies.length} watchlist movies without TVDB data`
  );
  return watchlistMovies;
};

const updateMovies = async () => {
  try {
    clearTerminal();
    console.log("🎬 TVDB Watchlist Data Updater\n");

    const moviesToUpdate = await fetchWatchlistMoviesWithoutTVDBData();

    if (moviesToUpdate.length === 0) {
      console.log("✅ All watchlist movies already have TVDB data!");
      return;
    }

    console.log(`🎯 Processing ${moviesToUpdate.length} movies...\n`);

    let updated = 0;
    let failed = 0;
    const errors: string[] = [];
    resetErrorCount();

    for (let i = 0; i < moviesToUpdate.length; i++) {
      const movie = moviesToUpdate[i];

      const progressBar = createProgressBar(i + 1, moviesToUpdate.length);
      updateProgressLine(
        `${progressBar} - ${movie.title} (${movie.releaseYear})`
      );

      try {
        await updateMovieData(movie);
        updated++;

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        failed++;
        const errorMsg = `❌ Failed to update ${movie.title} (${movie.releaseYear}): ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        errors.push(errorMsg);
        writeErrorBelow(errorMsg);
      }
    }

    clearProgressLine();

    console.log("\n✅ Update Complete!");
    console.log(`📊 Results:`);
    console.log(`   Total processed: ${moviesToUpdate.length}`);
    console.log(`   🟢 Updated: ${updated}`);
    console.log(`   🔴 Failed: ${failed}`);

    if (errors.length > 0) {
      console.log(`\n❌ Errors:\n${errors.join("\n")}`);
    }
  } catch (err) {
    console.error(
      "\n❌ Error:",
      err instanceof Error ? err.message : "Unknown error occurred"
    );
    process.exit(1);
  }
};

const program = new Command();

program
  .name("update-watchlist-movies")
  .description("Update watchlist movies with TVDB data")
  .version("1.0.0")
  .action(async () => {
    await updateMovies();
  });

program.parse(process.argv);
