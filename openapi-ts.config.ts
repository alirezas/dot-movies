import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "https://thetvdb.github.io/v4-api/swagger.yml",
  output: "lib/tvdb/generated",
  plugins: [
    {
      name: "@hey-api/client-next",
      runtimeConfigPath: "./lib/tvdb/runtime-config.ts",
    },
  ],
});
