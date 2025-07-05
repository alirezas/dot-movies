import { createEnv } from "@t3-env/core";
import { z } from "zod";

export const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_TVDB_API_KEY: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_TVDB_API_KEY: process.env.NEXT_PUBLIC_TVDB_API_KEY,
  },
});
