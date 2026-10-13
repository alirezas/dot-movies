CREATE TABLE "movie_people" (
	"movie_id" integer NOT NULL,
	"person_id" integer NOT NULL,
	"role" text NOT NULL,
	"character" text,
	"sort" integer,
	CONSTRAINT "movie_people_movie_id_person_id_role_pk" PRIMARY KEY("movie_id","person_id","role")
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image_url" text,
	"bio" text,
	"birth_date" date,
	"death_date" date,
	"filmography" jsonb,
	"profile_fetched_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "tvdb_id" integer GENERATED ALWAYS AS ((tvdb_data->>'id')::integer) STORED;--> statement-breakpoint
ALTER TABLE "movie_people" ADD CONSTRAINT "movie_people_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_people" ADD CONSTRAINT "movie_people_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "movie_people_person_id_idx" ON "movie_people" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "tvdb_id_idx" ON "movies" USING btree ("tvdb_id");