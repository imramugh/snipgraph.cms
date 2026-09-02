import { requireMutationActor } from "@/lib/actor";
import { contentService } from "@/lib/content";
import { problem } from "@/lib/http";
import { pageValueSchema } from "@snipgraph/content-domain";
import { z } from "zod";

const updateSchema = z.object({ expectedSequence: z.number().int().positive(), value: pageValueSchema });

export async function PATCH(request: Request, context: { params: Promise<{ pageId: string }> }) {
  try {
    const actor = await requireMutationActor(request, "inline");
    const { pageId } = await context.params;
    const input = updateSchema.parse(await request.json());
    return Response.json({ page: await contentService.updatePageDraft({ pageId, actor, ...input }) });
  } catch (error) {
    return problem(error);
  }
}
