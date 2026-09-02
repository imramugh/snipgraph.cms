import { createHash } from "node:crypto";
import sharp from "sharp";
import { and, desc, eq } from "drizzle-orm";
import {
  mediaInputSchema,
  mediaMetadataSchema,
  type Actor,
  type MediaAsset,
} from "@snipgraph/content-domain";
import { db } from "./db/client";
import { auditEvent, mediaAsset } from "./db/schema";

export const MAX_MEDIA_BYTES = 10 * 1024 * 1024;
const mediaTypes = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
} as const;

export class MediaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaValidationError";
  }
}

export async function listMedia(siteId: string): Promise<MediaAsset[]> {
  const rows = await db
    .select({
      id: mediaAsset.id,
      siteId: mediaAsset.siteId,
      filename: mediaAsset.filename,
      mimeType: mediaAsset.mimeType,
      byteSize: mediaAsset.byteSize,
      width: mediaAsset.width,
      height: mediaAsset.height,
      checksum: mediaAsset.checksum,
      altText: mediaAsset.altText,
      decorative: mediaAsset.decorative,
      createdAt: mediaAsset.createdAt,
      createdBy: mediaAsset.createdBy,
      source: mediaAsset.source,
    })
    .from(mediaAsset)
    .where(eq(mediaAsset.siteId, siteId))
    .orderBy(desc(mediaAsset.createdAt));
  return rows.map(publicAsset);
}

export async function findMedia(id: string) {
  const [row] = await db.select().from(mediaAsset).where(eq(mediaAsset.id, id)).limit(1);
  return row ?? null;
}

export async function createMedia(input: {
  siteId: string;
  filename: string;
  altText: string;
  decorative: boolean;
  bytes: Uint8Array;
  actor: Actor;
}): Promise<MediaAsset> {
  const metadataInput = mediaInputSchema.parse(input);
  const inspected = await inspectImage(input.bytes);
  const row = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(mediaAsset)
      .values({
        siteId: input.siteId,
        filename: metadataInput.filename,
        ...inspected,
        altText: metadataInput.altText,
        decorative: metadataInput.decorative,
        data: input.bytes,
        createdBy: input.actor.id,
        source: input.actor.source,
      })
      .returning();
    await tx.insert(auditEvent).values({
      siteId: input.siteId,
      actorId: input.actor.id,
      source: input.actor.source,
      action: "media.uploaded",
      entityType: "media",
      entityId: inserted.id,
      metadata: { filename: inserted.filename, checksum: inspected.checksum },
    });
    return inserted;
  });
  return publicAsset(row);
}

export async function inspectImage(bytes: Uint8Array) {
  if (bytes.byteLength === 0) throw new MediaValidationError("The uploaded file is empty.");
  if (bytes.byteLength > MAX_MEDIA_BYTES) {
    throw new MediaValidationError("Images must be 10 MB or smaller.");
  }

  let metadata: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    metadata = await sharp(bytes, { limitInputPixels: 40_000_000, animated: false }).metadata();
  } catch {
    throw new MediaValidationError("The file is not a readable supported image.");
  }
  const mimeType = metadata.format ? mediaTypes[metadata.format as keyof typeof mediaTypes] : undefined;
  if (!mimeType || !metadata.width || !metadata.height) {
    throw new MediaValidationError("Use a JPEG, PNG, WebP, AVIF, or GIF image.");
  }
  return {
    mimeType,
    byteSize: bytes.byteLength,
    width: metadata.width,
    height: metadata.height,
    checksum: createHash("sha256").update(bytes).digest("hex"),
  };
}

export async function updateMediaMetadata(input: {
  siteId: string;
  id: string;
  altText: string;
  decorative: boolean;
  actor: Actor;
}): Promise<MediaAsset | null> {
  mediaMetadataSchema.parse(input);
  const result = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(mediaAsset)
      .set({ altText: input.altText.trim(), decorative: input.decorative })
      .where(and(eq(mediaAsset.id, input.id), eq(mediaAsset.siteId, input.siteId)))
      .returning();
    if (!row) return null;
    await tx.insert(auditEvent).values({
      siteId: input.siteId,
      actorId: input.actor.id,
      source: input.actor.source,
      action: "media.metadata.updated",
      entityType: "media",
      entityId: row.id,
    });
    return row;
  });
  return result ? publicAsset(result) : null;
}

function publicAsset(row: Omit<typeof mediaAsset.$inferSelect, "data"> | typeof mediaAsset.$inferSelect): MediaAsset {
  return {
    id: row.id,
    siteId: row.siteId,
    filename: row.filename,
    mimeType: row.mimeType as MediaAsset["mimeType"],
    byteSize: row.byteSize,
    width: row.width,
    height: row.height,
    checksum: row.checksum,
    altText: row.altText,
    decorative: row.decorative,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    source: row.source,
  };
}
