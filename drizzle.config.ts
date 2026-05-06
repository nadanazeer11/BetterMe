import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/db/schema.ts",
  out: "./shared/db/drizzle",
  dialect: "sqlite",
  driver: "expo",
});
