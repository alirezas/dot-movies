import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_TVDB_API_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);

// if (!process.env.NEXT_PUBLIC_TVDB_API_KEY) {
//   throw new Error("NEXT_PUBLIC_TVDB_API_KEY is required");
// }

// export const env = {
//   DATABASE_URL: process.env.DATABASE_URL,
//   NEXT_PUBLIC_TVDB_API_KEY: process.env.NEXT_PUBLIC_TVDB_API_KEY,
// } as const;
