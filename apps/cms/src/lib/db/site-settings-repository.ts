import {
  RevisionConflictError,
  siteSettingsValueSchema,
  type SiteSettingsRecord,
  type SiteSettingsRepository,
  type SiteSettingsRevision,
} from "@snipgraph/content-domain";
import { and, eq } from "drizzle-orm";
import type { db as database } from "./client";
import { auditEvent, siteSettingsRevision, siteSettingsState } from "./schema";

type Database = typeof database;

export class PgSiteSettingsRepository implements SiteSettingsRepository {
  constructor(private readonly database: Database) {}

  async find(siteId: string): Promise<SiteSettingsRecord | null> {
    const [state] = await this.database
      .select()
      .from(siteSettingsState)
      .where(eq(siteSettingsState.siteId, siteId))
      .limit(1);
    if (!state) return null;

    const [draft, published] = await Promise.all([
      this.revision(state.draftRevisionId),
      state.publishedRevisionId ? this.revision(state.publishedRevisionId) : null,
    ]);
    if (!draft) throw new Error(`Draft site settings missing for ${siteId}`);
    return {
      siteId,
      updatedAt: state.updatedAt,
      draftRevision: draft,
      publishedRevision: published,
    };
  }

  async createDraft(input: Parameters<SiteSettingsRepository["createDraft"]>[0]) {
    await this.database.transaction(async (tx) => {
      const [revision] = await tx
        .insert(siteSettingsRevision)
        .values({
          siteId: input.siteId,
          sequence: 1,
          value: input.value,
          createdBy: input.actor.id,
          source: input.actor.source,
        })
        .returning();
      await tx.insert(siteSettingsState).values({
        siteId: input.siteId,
        draftRevisionId: revision.id,
      });
      await tx.insert(auditEvent).values({
        siteId: input.siteId,
        actorId: input.actor.id,
        source: input.actor.source,
        action: "site-settings.draft.created",
        entityType: "site-settings",
        entityId: input.siteId,
        revisionId: revision.id,
      });
    });
    return this.required(input.siteId);
  }

  async appendDraft(input: Parameters<SiteSettingsRepository["appendDraft"]>[0]) {
    await this.database.transaction(async (tx) => {
      const [current] = await tx
        .select({ state: siteSettingsState, revision: siteSettingsRevision })
        .from(siteSettingsState)
        .innerJoin(
          siteSettingsRevision,
          eq(siteSettingsState.draftRevisionId, siteSettingsRevision.id),
        )
        .where(eq(siteSettingsState.siteId, input.siteId))
        .limit(1);
      if (!current) throw new Error("Site settings not found");
      if (current.revision.sequence !== input.expectedSequence) {
        throw new RevisionConflictError(current.revision.sequence);
      }

      const [revision] = await tx
        .insert(siteSettingsRevision)
        .values({
          siteId: input.siteId,
          sequence: current.revision.sequence + 1,
          value: input.value,
          createdBy: input.actor.id,
          source: input.actor.source,
        })
        .returning();
      const changed = await tx
        .update(siteSettingsState)
        .set({ draftRevisionId: revision.id, updatedAt: new Date() })
        .where(
          and(
            eq(siteSettingsState.siteId, input.siteId),
            eq(siteSettingsState.draftRevisionId, current.revision.id),
          ),
        )
        .returning();
      if (changed.length !== 1) throw new RevisionConflictError(current.revision.sequence);

      await tx.insert(auditEvent).values({
        siteId: input.siteId,
        actorId: input.actor.id,
        source: input.actor.source,
        action: "site-settings.draft.updated",
        entityType: "site-settings",
        entityId: input.siteId,
        revisionId: revision.id,
        metadata: { previousSequence: current.revision.sequence },
      });
    });
    return this.required(input.siteId);
  }

  async publish(input: Parameters<SiteSettingsRepository["publish"]>[0]) {
    await this.database.transaction(async (tx) => {
      const [current] = await tx
        .select({ state: siteSettingsState, revision: siteSettingsRevision })
        .from(siteSettingsState)
        .innerJoin(
          siteSettingsRevision,
          eq(siteSettingsState.draftRevisionId, siteSettingsRevision.id),
        )
        .where(eq(siteSettingsState.siteId, input.siteId))
        .limit(1);
      if (!current) throw new Error("Site settings not found");
      if (current.revision.sequence !== input.expectedSequence) {
        throw new RevisionConflictError(current.revision.sequence);
      }

      const changed = await tx
        .update(siteSettingsState)
        .set({ publishedRevisionId: current.revision.id, updatedAt: new Date() })
        .where(
          and(
            eq(siteSettingsState.siteId, input.siteId),
            eq(siteSettingsState.draftRevisionId, current.revision.id),
          ),
        )
        .returning();
      if (changed.length !== 1) throw new RevisionConflictError(current.revision.sequence);
      await tx.insert(auditEvent).values({
        siteId: input.siteId,
        actorId: input.actor.id,
        source: input.actor.source,
        action: "site-settings.published",
        entityType: "site-settings",
        entityId: input.siteId,
        revisionId: current.revision.id,
        metadata: { sequence: current.revision.sequence },
      });
    });
    return this.required(input.siteId);
  }

  private async revision(id: string): Promise<SiteSettingsRevision | null> {
    const [row] = await this.database
      .select()
      .from(siteSettingsRevision)
      .where(eq(siteSettingsRevision.id, id))
      .limit(1);
    return row
      ? {
          id: row.id,
          siteId: row.siteId,
          sequence: row.sequence,
          value: siteSettingsValueSchema.parse(row.value),
          createdAt: row.createdAt,
          createdBy: row.createdBy,
          source: row.source,
        }
      : null;
  }

  private async required(siteId: string) {
    const settings = await this.find(siteId);
    if (!settings) throw new Error("Site settings disappeared after mutation");
    return settings;
  }
}
