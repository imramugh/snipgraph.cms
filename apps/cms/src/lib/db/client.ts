import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as authSchema from "./auth-schema";
import * as schema from "./schema";

const globalDatabase = globalThis as unknown as {
  sql?: ReturnType<typeof postgres>;
};

function connect() {
  if (process.env.DATABASE_URL) {
    return postgres(process.env.DATABASE_URL, { max: 10 });
  }

  return postgres({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? "5432"),
    database: process.env.DB_NAME ?? "snipgraph_cms",
    username: process.env.DB_USER ?? "snipgraph",
    password: process.env.DB_PASSWORD ?? "snipgraph",
    max: 10,
  });
}

export const sql = globalDatabase.sql ?? connect();
if (process.env.NODE_ENV !== "production") globalDatabase.sql = sql;

export const db = drizzle(sql, { schema: { ...schema, ...authSchema } });
