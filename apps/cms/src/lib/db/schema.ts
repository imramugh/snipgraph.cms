import {
  index,
  integer,
  jsonb,
  boolean,
  customType,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { PageValue, SiteSettingsValue } from "@snipgraph/content-domain";

export const actorSource = pgEnum("actor_source", ["admin", "inline", "mcp", "script"]);

const bytea = customType<{ data: Uint8Array; driverData: Uint8Array }>({
  dataType() {
    return "bytea";
  },
});

export const site = pgTable("site", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contentType = pgTable(
  "content_type",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => site.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    name: text("name").notNull(),
    currentVersion: integer("current_version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("content_type_site_key_uidx").on(table.siteId, table.key)],
);

export const contentTypeVersion = pgTable(
  "content_type_version",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentTypeId: uuid("content_type_id")
      .notNull()
      .references(() => contentType.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    schema: jsonb("schema").$type<Record<string, unknown>>().notNull(),
    uiHints: jsonb("ui_hints").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
  },
  (table) => [
    uniqueIndex("content_type_version_uidx").on(table.contentTypeId, table.version),
  ],
);

export const contentItem = pgTable(
  "content_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => site.id, { onDelete: "cascade" }),
    contentTypeId: uuid("content_type_id")
      .notNull()
      .references(() => contentType.id, { onDelete: "restrict" }),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("content_item_site_slug_uidx").on(table.siteId, table.slug)],
);

export const contentRevision = pgTable(
  "content_revision",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentItemId: uuid("content_item_id")
      .notNull()
      .references(() => contentItem.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull(),
    schemaVersion: integer("schema_version").notNull(),
    value: jsonb("value").$type<PageValue>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    source: actorSource("source").notNull(),
  },
  (table) => [
    uniqueIndex("content_revision_item_sequence_uidx").on(
      table.contentItemId,
      table.sequence,
    ),
  ],
);

export const contentState = pgTable("content_state", {
  contentItemId: uuid("content_item_id")
    .primaryKey()
    .references(() => contentItem.id, { onDelete: "cascade" }),
  draftRevisionId: uuid("draft_revision_id")
    .notNull()
    .references(() => contentRevision.id, { onDelete: "restrict" }),
  publishedRevisionId: uuid("published_revision_id").references(() => contentRevision.id, {
    onDelete: "restrict",
  }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteSettingsRevision = pgTable(
  "site_settings_revision",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => site.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull(),
    value: jsonb("value").$type<SiteSettingsValue>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    source: actorSource("source").notNull(),
  },
  (table) => [uniqueIndex("site_settings_revision_sequence_uidx").on(table.siteId, table.sequence)],
);

export const siteSettingsState = pgTable("site_settings_state", {
  siteId: uuid("site_id")
    .primaryKey()
    .references(() => site.id, { onDelete: "cascade" }),
  draftRevisionId: uuid("draft_revision_id")
    .notNull()
    .references(() => siteSettingsRevision.id, { onDelete: "restrict" }),
  publishedRevisionId: uuid("published_revision_id").references(() => siteSettingsRevision.id, {
    onDelete: "restrict",
  }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mediaAsset = pgTable(
  "media_asset",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => site.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    checksum: text("checksum").notNull(),
    altText: text("alt_text").notNull(),
    decorative: boolean("decorative").notNull().default(false),
    data: bytea("data").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull(),
    source: actorSource("source").notNull(),
  },
  (table) => [
    index("media_asset_site_checksum_idx").on(table.siteId, table.checksum),
    index("media_asset_site_created_idx").on(table.siteId, table.createdAt),
  ],
);

export const auditEvent = pgTable(
  "audit_event",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => site.id, { onDelete: "cascade" }),
    actorId: text("actor_id").notNull(),
    source: actorSource("source").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    revisionId: uuid("revision_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("audit_event_entity_idx").on(table.entityType, table.entityId),
    index("audit_event_created_at_idx").on(table.createdAt),
  ],
);

export const idempotencyRecord = pgTable("idempotency_record", {
  key: text("key").primaryKey(),
  actorId: text("actor_id").notNull(),
  operation: text("operation").notNull(),
  result: jsonb("result").$type<Record<string, unknown>>().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
