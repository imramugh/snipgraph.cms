export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.MIGRATE_ON_START === "true"
  ) {
    const { bootstrapDatabase } = await import("@/lib/db/bootstrap");
    await bootstrapDatabase();
  }
}
