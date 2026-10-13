import { sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { MovieExtendedRecord } from "@/lib/tvdb/generated";

export const movies = pgTable(
  "movies",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    releaseYear: integer("release_year"),
    letterboxdUrl: text("letterboxd_url"),
    watchedDate: date("watched_date"),
    tvdbData: jsonb("tvdb_data").$type<MovieExtendedRecord>(),
    tvdbId: integer("tvdb_id").generatedAlwaysAs(
      sql`(tvdb_data->>'id')::integer`
    ),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    watchedDateIdx: index("watched_date_idx").on(table.watchedDate),
    tvdbIdIdx: index("tvdb_id_idx").on(table.tvdbId),
  })
);

export type Movie = typeof movies.$inferSelect;
