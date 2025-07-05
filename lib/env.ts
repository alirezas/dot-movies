if (!process.env.NEXT_PUBLIC_TVDB_API_KEY) {
  throw new Error("NEXT_PUBLIC_TVDB_API_KEY is required");
}

export const env = {
  NEXT_PUBLIC_TVDB_API_KEY: process.env.NEXT_PUBLIC_TVDB_API_KEY,
} as const;
