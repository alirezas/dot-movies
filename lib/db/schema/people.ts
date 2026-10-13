import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { movies } from "./movies";

export type CreditRole = "actor" | "director";

export type FilmographyEntry = {
  tvdbMovieId: number;
  name: string;
  year: number | null;
  image: string | null;
  roles: CreditRole[];
};

export const people = pgTable("people", {
  // TVDB people id
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  bio: text("bio"),
  birthDate: date("birth_date"),
  deathDate: date("death_date"),
  filmography: jsonb("filmography").$type<FilmographyEntry[]>(),
  // Null until the TVDB person profile has been fetched
  profileFetchedAt: timestamp("profile_fetched_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const moviePeople = pgTable(
  "movie_people",
  {
    movieId: integer("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    personId: integer("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    role: text("role").$type<CreditRole>().notNull(),
    character: text("character"),
    sort: integer("sort"),
  },
  (table) => [
    primaryKey({ columns: [table.movieId, table.personId, table.role] }),
    index("movie_people_person_id_idx").on(table.personId),
  ]
);

export type Person = typeof people.$inferSelect;
export type MoviePerson = typeof moviePeople.$inferSelect;
