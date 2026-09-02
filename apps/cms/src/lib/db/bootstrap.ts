import { PAGE_SCHEMA_VERSION, defaultSiteChrome, defaultTheme, pageValueSchema } from "@snipgraph/content-domain";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "node:path";
import { z } from "zod";
import { contentService, pageRepository, siteSettingsRepository, siteSettingsService } from "../content";
import { db } from "./client";
import { contentType, contentTypeVersion, site } from "./schema";

export async function migrateDatabase() {
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), "src/lib/db/migrations"),
  });
}

export async function seedDatabase() {
  const [siteRow] = await db
    .insert(site)
    .values({ key: "default", name: "Snipgraph CMS" })
    .onConflictDoUpdate({ target: site.key, set: { updatedAt: new Date() } })
    .returning();

  const [existingType] = await db
    .select()
    .from(contentType)
    .where(eq(contentType.siteId, siteRow.id))
    .limit(1);

  const [typeRow] = existingType
    ? await db
        .update(contentType)
        .set({ currentVersion: PAGE_SCHEMA_VERSION, updatedAt: new Date() })
        .where(eq(contentType.id, existingType.id))
        .returning()
    : await db
        .insert(contentType)
        .values({
          siteId: siteRow.id,
          key: "page",
          name: "Page",
          currentVersion: PAGE_SCHEMA_VERSION,
        })
        .returning();

  await db
    .insert(contentTypeVersion)
    .values({
      contentTypeId: typeRow.id,
      version: PAGE_SCHEMA_VERSION,
      schema: z.toJSONSchema(pageValueSchema) as Record<string, unknown>,
      uiHints: {
        titleField: "title",
        slugField: "slug",
        blockField: "blocks",
      },
      createdBy: "system:seed",
    })
    .onConflictDoNothing();

  const settings = await siteSettingsRepository.find(siteRow.id);
  if (!settings) {
    const created = await siteSettingsService.createDraft({
      siteId: siteRow.id,
      actor: { id: "system:seed", source: "script" },
      value: {
        siteName: "Snipgraph CMS",
        tagline: "A draft-first CMS designed for people and agents.",
        footerText: "Structured content, operated safely by people and agents.",
        navigation: [],
        socialLinks: [],
        footerGroups: [],
        theme: defaultTheme,
        chrome: defaultSiteChrome,
        defaultSeo: {
          titleTemplate: "%s — Snipgraph CMS",
          description: "A draft-first CMS designed for people and agents.",
        },
        redirects: [],
      },
    });
    await siteSettingsService.publish({
      siteId: siteRow.id,
      expectedSequence: created.draftRevision.sequence,
      actor: { id: "system:seed", source: "script" },
    });
  }

  const pages = await pageRepository.list(siteRow.id);
  if (pages.length > 0) return;

  const page = await contentService.createPageDraft({
    siteId: siteRow.id,
    actor: { id: "system:seed", source: "script" },
    value: {
      title: "A CMS designed for people and agents",
      slug: "/",
      description:
        "A draft-first content system with shared browser, inline, and MCP behavior.",
      blocks: [
        {
          id: "hero-introduction",
          type: "marketing.hero",
          version: 1,
          data: {
            eyebrow: "Snipgraph CMS",
            heading: "Build once. Operate from anywhere.",
            body: "Define structured content, edit it visually, and give trusted agents the same safe publishing workflow.",
          },
        },
      ],
    },
  });

  await contentService.publishPage({
    pageId: page.id,
    expectedSequence: page.draftRevision.sequence,
    actor: { id: "system:seed", source: "script" },
  });
}

export async function bootstrapDatabase() {
  await migrateDatabase();
  await seedDatabase();
}
