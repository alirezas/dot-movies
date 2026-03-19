#!/usr/bin/env node

import "./utils"; // Load .env before anything else
import { Command } from "commander";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  loadExistingMovies,
  mergeMovieRecords,
  processImport,
} from "../lib/import/letterboxd";
import type { ImportLogger } from "../lib/import/letterboxd";
import { createProgressBar, updateProgressLine } from "./utils";

const importData = async (directory: string) => {
  try {
    console.log("🎬 Letterboxd Import Tool\n");

    if (!existsSync(directory)) {
      console.error(`❌ Directory does not exist: ${directory}`);
      process.exit(1);
    }

    const watchedFile = join(directory, "watched.csv");
    const watchlistFile = join(directory, "watchlist.csv");

    const watchedExists = existsSync(watchedFile);
    const watchlistExists = existsSync(watchlistFile);

    if (!watchedExists && !watchlistExists) {
      console.error(
        "❌ Neither watched.csv nor watchlist.csv found in directory"
      );
      process.exit(1);
    }

    const watchlistCsv = watchlistExists
      ? readFileSync(watchlistFile, "utf-8")
      : null;
    const watchedCsv = watchedExists
      ? readFileSync(watchedFile, "utf-8")
      : null;

    if (watchlistCsv) console.log("📖 Parsed watchlist.csv");
    if (watchedCsv) console.log("📖 Parsed watched.csv");

    const movieRecords = mergeMovieRecords(watchlistCsv, watchedCsv);
    console.log(`\n🎯 Processing ${movieRecords.length} unique movies...\n`);

    console.log("🔍 Loading existing movies from database...");
    const existingMovies = await loadExistingMovies();
    console.log(`📚 Found ${existingMovies.size} existing movies\n`);

    let processed = 0;
    const logger: ImportLogger = {
      info: () => {
        processed++;
        updateProgressLine(
          createProgressBar(processed, movieRecords.length)
        );
      },
      warn: (msg) => console.warn(`\n⚠️  ${msg}`),
      error: (msg) => console.error(`\n❌ ${msg}`),
    };

    const results = await processImport(movieRecords, existingMovies, logger);

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    console.log("✅ Import Complete!\n");
    console.log("📊 Results:");
    console.log(`   Total processed: ${movieRecords.length}`);
    console.log(`   🟢 Inserted: ${results.inserted}`);
    console.log(`   🔵 Updated: ${results.updated}`);
    console.log(`   🟡 Skipped (no changes): ${results.skipped}`);
    if (results.errors > 0) {
      console.log(`   🔴 Errors: ${results.errors}`);
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
  .name("import-letterboxd")
  .description("Import Letterboxd exported data into movies database")
  .version("1.0.0")
  .argument(
    "<directory>",
    "Path to directory containing watched.csv and/or watchlist.csv"
  )
  .action(async (directory: string) => {
    await importData(directory);
  });

program.parse(process.argv);
