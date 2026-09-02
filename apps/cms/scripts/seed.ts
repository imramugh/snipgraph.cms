import { seedDatabase } from "../src/lib/db/bootstrap";
import { sql } from "../src/lib/db/client";

await seedDatabase();

await sql.end();
process.stdout.write("default site and page schema seeded\n");
