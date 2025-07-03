import { createEnv } from "@t3-env/core";
import { z } from "zod";

export const env = createEnv({
  server: {
    TVDB_API_KEY: z.string().min(1),
  },
  client: {},
  runtimeEnv: {
    TVDB_API_KEY: process.env.TVDB_API_KEY,
  },
});
