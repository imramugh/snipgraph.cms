import type {
  PageAuditEvent,
  PageRecord,
  PageRepository,
  PageRevision,
  PageValue,
  PublishedPage,
} from "@snipgraph/content-domain";
import { DuplicateSlugError, RevisionConflictError } from "@snipgraph/content-domain";
import { and, asc, desc, eq } from "drizzle-orm";
import type { db as database } from "./client";
import {
  auditEvent,
  contentItem,
  contentRevision,
  contentState,
  contentType,
} from "./schema";

type Database = typeof database;

export class PgPageRepository implements PageRepository {
  constructor(private readonly database: Database) {}

  async list(siteId: string): Promise<PageRecord[]> {
    const rows = await this.database
      .select()
      .from(contentItem)
      .where(eq(contentItem.siteId, siteId))
      .orderBy(asc(contentItem.slug));
    return Promise.all(rows.map((row) => this.findById(row.id))).then((values) =>
      values.filter((value): value is PageRecord => value !== null),
    );
  }

  async findById(pageId: string): Promise<PageRecord | null> {
    const [item] = await this.database
      .select()
      .from(contentItem)
      .where(eq(contentItem.id, pageId))
      .limit(1);
    if (!item) return null;

    const [state] = await this.database
      .select()
      .from(contentState)
      .where(eq(contentState.contentItemId, pageId))
      .limit(1);
    if (!state) return null;

    const [draft, published] = await Promise.all([
      this.revision(state.draftRevisionId),
      state.publishedRevisionId ? this.revision(state.publishedRevisionId) : null,
    ]);
    if (!draft) throw new Error(`Draft revision missing for ${pageId}`);

    return {
      id: item.id,
      siteId: item.siteId,
      updatedAt: item.updatedAt,
      draftRevision: draft,
      publishedRevision: published,
    };
  }

  async findPublishedBySlug(siteId: string, slug: string): Promise<PublishedPage | null> {
    const [row] = await this.database
      .select({ item: contentItem, revision: contentRevision })
      .from(contentItem)
      .innerJoin(contentState, eq(contentState.contentItemId, contentItem.id))
      .innerJoin(contentRevision, eq(contentState.publishedRevisionId, contentRevision.id))
      .where(and(eq(contentItem.siteId, siteId), eq(contentItem.slug, slug)))
      .limit(1);
    return row
      ? { id: row.item.id, siteId: row.item.siteId, revision: mapRevision(row.revision) }
      : null;
  }

  async listRevisions(pageId: string): Promise<PageRevision[]> {
    const rows = await this.database
      .select()
      .from(contentRevision)
      .where(eq(contentRevision.contentItemId, pageId))
      .orderBy(desc(contentRevision.sequence));
    return rows.map(mapRevision);
  }

  async listAuditEvents(pageId: string): Promise<PageAuditEvent[]> {
    const rows = await this.database
      .select()
      .from(auditEvent)
      .where(and(eq(auditEvent.entityType, "page"), eq(auditEvent.entityId, pageId)))
      .orderBy(desc(auditEvent.createdAt));
    return rows.map((row) => ({
      id: row.id,
      action: row.action,
      actorId: row.actorId,
      source: row.source,
      revisionId: row.revisionId,
      metadata: row.metadata,
      createdAt: row.createdAt,
    }));
  }

  async createDraft(input: Parameters<PageRepository["createDraft"]>[0]): Promise<PageRecord> {
    let record: {
      item: typeof contentItem.$inferSelect;
      revision: typeof contentRevision.$inferSelect;
    };
    try {
      record = await this.database.transaction(async (tx) => {
        const [type] = await tx
          .select()
          .from(contentType)
          .where(and(eq(contentType.siteId, input.siteId), eq(contentType.key, "page")))
          .limit(1);
        if (!type) throw new Error("The page content type has not been configured");

        const [item] = await tx
          .insert(contentItem)
          .values({ siteId: input.siteId, contentTypeId: type.id, slug: input.value.slug })
          .returning();
        const [revision] = await tx
          .insert(contentRevision)
          .values({
            contentItemId: item.id,
            sequence: 1,
            schemaVersion: type.currentVersion,
            value: input.value,
            createdBy: input.actor.id,
            source: input.actor.source,
          })
          .returning();
        await tx.insert(contentState).values({
          contentItemId: item.id,
          draftRevisionId: revision.id,
        });
        await tx.insert(auditEvent).values({
          siteId: input.siteId,
          actorId: input.actor.id,
          source: input.actor.source,
          action: "content.draft.created",
          entityType: "page",
          entityId: item.id,
          revisionId: revision.id,
        });
        return { item, revision };
      });
    } catch (error) {
      if (isSlugConflict(error)) throw new DuplicateSlugError(input.value.slug);
      throw error;
    }

    return {
      id: record.item.id,
      siteId: record.item.siteId,
      updatedAt: record.item.updatedAt,
      draftRevision: mapRevision(record.revision),
      publishedRevision: null,
    };
  }

  async appendDraft(input: Parameters<PageRepository["appendDraft"]>[0]): Promise<PageRecord> {
    try {
      await this.database.transaction(async (tx) => {
        const [item] = await tx
          .select({ item: contentItem, type: contentType })
          .from(contentItem)
          .innerJoin(contentType, eq(contentItem.contentTypeId, contentType.id))
          .where(eq(contentItem.id, input.pageId))
          .limit(1);
        if (!item) throw new Error("Page not found");

        const [current] = await tx
          .select({ revision: contentRevision })
          .from(contentState)
          .innerJoin(
            contentRevision,
            eq(contentState.draftRevisionId, contentRevision.id),
          )
          .where(eq(contentState.contentItemId, input.pageId))
          .limit(1);
        if (!current || current.revision.sequence !== input.expectedSequence) {
          throw new RevisionConflictError(current?.revision.sequence);
        }

        const [revision] = await tx
          .insert(contentRevision)
          .values({
            contentItemId: item.item.id,
            sequence: current.revision.sequence + 1,
            schemaVersion: item.type.currentVersion,
            value: input.value,
            createdBy: input.actor.id,
            source: input.actor.source,
          })
          .returning();
        const changed = await tx
          .update(contentState)
          .set({ draftRevisionId: revision.id, updatedAt: new Date() })
          .where(
            and(
              eq(contentState.contentItemId, item.item.id),
              eq(contentState.draftRevisionId, current.revision.id),
            ),
          )
          .returning();
        if (changed.length !== 1) {
          throw new RevisionConflictError(current.revision.sequence);
        }

        await tx
          .update(contentItem)
          .set({ slug: input.value.slug, updatedAt: new Date() })
          .where(eq(contentItem.id, item.item.id));
        await tx.insert(auditEvent).values({
          siteId: item.item.siteId,
          actorId: input.actor.id,
          source: input.actor.source,
          action: "content.draft.updated",
          entityType: "page",
          entityId: item.item.id,
          revisionId: revision.id,
          metadata: { previousSequence: current.revision.sequence },
        });
      });
    } catch (error) {
      if (isSlugConflict(error)) throw new DuplicateSlugError(input.value.slug);
      if (isRevisionSequenceConflict(error)) {
        const page = await this.findById(input.pageId);
        throw new RevisionConflictError(page?.draftRevision.sequence);
      }
      throw error;
    }

    const page = await this.findById(input.pageId);
    if (!page) throw new Error("Page disappeared after update");
    return page;
  }

  async publish(input: Parameters<PageRepository["publish"]>[0]): Promise<PageRecord> {
    await this.database.transaction(async (tx) => {
      const [current] = await tx
        .select({ item: contentItem, state: contentState, revision: contentRevision })
        .from(contentItem)
        .innerJoin(contentState, eq(contentState.contentItemId, contentItem.id))
        .innerJoin(contentRevision, eq(contentState.draftRevisionId, contentRevision.id))
        .where(eq(contentItem.id, input.pageId))
        .limit(1);
      if (!current) throw new Error("Page not found");
      if (current.revision.sequence !== input.expectedSequence) {
        throw new RevisionConflictError(current.revision.sequence);
      }

      const changed = await tx
        .update(contentState)
        .set({
          publishedRevisionId: current.revision.id,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(contentState.contentItemId, input.pageId),
            eq(contentState.draftRevisionId, current.revision.id),
          ),
        )
        .returning();
      if (changed.length !== 1) throw new RevisionConflictError(current.revision.sequence);

      await tx.insert(auditEvent).values({
        siteId: current.item.siteId,
        actorId: input.actor.id,
        source: input.actor.source,
        action: "content.published",
        entityType: "page",
        entityId: current.item.id,
        revisionId: current.revision.id,
        metadata: { sequence: current.revision.sequence },
      });
    });

    const page = await this.findById(input.pageId);
    if (!page) throw new Error("Page disappeared after publish");
    return page;
  }

  private async revision(id: string): Promise<PageRevision | null> {
    const [row] = await this.database
      .select()
      .from(contentRevision)
      .where(eq(contentRevision.id, id))
      .limit(1);
    return row ? mapRevision(row) : null;
  }
}

function mapRevision(row: typeof contentRevision.$inferSelect): PageRevision {
  return {
    id: row.id,
    pageId: row.contentItemId,
    sequence: row.sequence,
    schemaVersion: row.schemaVersion,
    value: row.value as PageValue,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    source: row.source,
  };
}

function isSlugConflict(error: unknown) {
  return isConstraintConflict(error, "content_item_site_slug_uidx");
}

function isRevisionSequenceConflict(error: unknown) {
  return isConstraintConflict(error, "content_revision_item_sequence_uidx");
}

function isConstraintConflict(error: unknown, constraintName: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505" &&
    "constraint_name" in error &&
    error.constraint_name === constraintName
  );
}
