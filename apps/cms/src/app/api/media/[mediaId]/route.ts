import { requireMutationActor } from "@/lib/actor";
import { problem } from "@/lib/http";
import { findMedia, updateMediaMetadata } from "@/lib/media";
import { defaultSite } from "@/lib/site";
import { z } from "zod";

const metadataSchema = z.object({ altText: z.string().max(500), decorative: z.boolean() });

export async function GET(_request: Request, context: { params: Promise<{ mediaId: string }> }) {
  const asset = await findMedia((await context.params).mediaId);
  if (!asset) return new Response("Not found", { status: 404 });
  return new Response(asset.data as BodyInit, {
    headers: {
      "content-type": asset.mimeType,
      "content-length": String(asset.byteSize),
      "cache-control": "public, max-age=31536000, immutable",
      etag: `"${asset.checksum}"`,
      "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(asset.filename)}`,
      "x-content-type-options": "nosniff",
    },
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ mediaId: string }> }) {
  try {
    const actor = await requireMutationActor(request, "admin");
    const currentSite = await defaultSite();
    const input = metadataSchema.parse(await request.json());
    const asset = await updateMediaMetadata({
      siteId: currentSite.id,
      id: (await context.params).mediaId,
      actor,
      ...input,
    });
    return asset ? Response.json({ asset }) : Response.json({ error: "Media not found" }, { status: 404 });
  } catch (error) {
    return problem(error);
  }
}

