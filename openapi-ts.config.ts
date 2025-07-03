import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "https://thetvdb.github.io/v4-api/swagger.yml",
  output: "lib/tvdb/generated",
});
