import { migrateDatabase } from "../src/lib/db/bootstrap";
import { sql } from "../src/lib/db/client";

await migrateDatabase();
await sql.end();
process.stdout.write("database migrations applied\n");
