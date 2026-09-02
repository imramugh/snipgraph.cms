import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ status: "ok", version: process.env.APP_VERSION ?? "dev" });
  } catch (error) {
    console.error(error);
    return Response.json({ status: "unhealthy" }, { status: 503 });
  }
}

