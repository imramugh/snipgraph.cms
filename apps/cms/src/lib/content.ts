import { ContentService, SiteSettingsService } from "@snipgraph/content-domain";
import { db } from "./db/client";
import { PgPageRepository } from "./db/page-repository";
import { PgSiteSettingsRepository } from "./db/site-settings-repository";

export const pageRepository = new PgPageRepository(db);
export const contentService = new ContentService(pageRepository);
export const siteSettingsRepository = new PgSiteSettingsRepository(db);
export const siteSettingsService = new SiteSettingsService(siteSettingsRepository);
