if (!process.env.TVDB_API_KEY) {
  throw new Error("TVDB_API_KEY is required");
}

export const env = {
  TVDB_API_KEY: process.env.TVDB_API_KEY,
} as const;
