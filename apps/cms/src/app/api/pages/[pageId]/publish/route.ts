import { z } from "zod";
import { requireMutationActor } from "@/lib/actor";
import { contentService } from "@/lib/content";
import { problem } from "@/lib/http";

const publishSchema = z.object({ expectedSequence: z.number().int().positive() });

export async function POST(request: Request, context: { params: Promise<{ pageId: string }> }) {
  try {
    const actor = await requireMutationActor(request, "admin");
    const { pageId } = await context.params;
    const input = publishSchema.parse(await request.json());
    const page = await contentService.publishPage({ pageId, actor, ...input });
    return Response.json({ page });
  } catch (error) {
    return problem(error);
  }
}
