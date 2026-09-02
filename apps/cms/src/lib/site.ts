import { eq } from "drizzle-orm";
import { db } from "./db/client";
import { site } from "./db/schema";
import { siteSettingsRepository } from "./content";

export async function defaultSite() {
  const [row] = await db.select().from(site).where(eq(site.key, "default")).limit(1);
  if (!row) throw new Error("The default site has not been seeded");
  return row;
}

export async function publishedSiteSettings() {
  const currentSite = await defaultSite();
  const settings = await siteSettingsRepository.find(currentSite.id);
  if (!settings?.publishedRevision) {
    throw new Error("Published site settings have not been configured");
  }
  return settings.publishedRevision.value;
}
