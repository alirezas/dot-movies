import { parse } from "csv-parse";
import { createReadStream } from "node:fs";
import * as path from "node:path";
import { db } from "../lib/db";
import { movies } from "../lib/db/schema/movies";

interface MovieRecord {
  Date: string;
  Name: string;
  Year: string;
  "Letterboxd URI": string;
}

async function importMovies() {
  const csvFilePath = path.join(process.cwd(), "data", "watched.csv");
  const parser = parse({
    columns: true,
    skip_empty_lines: true,
  });

  const records: MovieRecord[] = [];

  createReadStream(csvFilePath)
    .pipe(parser)
    .on("data", (record: MovieRecord) => {
      records.push(record);
    })
    .on("end", async () => {
      try {
        console.log(`Importing ${records.length} movies...`);

        // Insert records in batches of 100
        const batchSize = 100;
        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);
          const values = batch.map((record) => ({
            title: record.Name,
            releaseYear: parseInt(record.Year),
            letterboxdUrl: record["Letterboxd URI"],
            watchedDate: record.Date, // Drizzle will handle the date conversion
          }));

          await db.insert(movies).values(values);
          console.log(
            `Imported ${Math.min(i + batchSize, records.length)} of ${
              records.length
            } movies`
          );
        }

        console.log("Import completed successfully!");
        process.exit(0);
      } catch (error) {
        console.error("Error importing movies:", error);
        process.exit(1);
      }
    });
}

importMovies();
