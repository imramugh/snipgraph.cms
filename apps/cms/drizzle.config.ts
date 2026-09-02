import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: ["./src/lib/db/schema.ts", "./src/lib/db/auth-schema.ts"],
  out: "./src/lib/db/migrations",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgres://snipgraph:snipgraph@localhost:5432/snipgraph_cms",
  },
});

