import { requireMutationActor } from "@/lib/actor";
import { contentService } from "@/lib/content";
import { problem } from "@/lib/http";
import { z } from "zod";

const publishSchema = z.object({ expectedSequence: z.number().int().positive() });

export async function POST(request: Request, context: { params: Promise<{ pageId: string }> }) {
  try {
    const actor = await requireMutationActor(request, "inline");
    const { pageId } = await context.params;
    const input = publishSchema.parse(await request.json());
    return Response.json({ page: await contentService.publishPage({ pageId, actor, ...input }) });
  } catch (error) {
    return problem(error);
  }
}
