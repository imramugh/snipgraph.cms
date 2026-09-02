import { pageValueSchema } from "@snipgraph/content-domain";
import { z } from "zod";
import { requireActor, requireMutationActor } from "@/lib/actor";
import { contentService, pageRepository } from "@/lib/content";
import { problem } from "@/lib/http";

const updateSchema = z.object({
  expectedSequence: z.number().int().positive(),
  value: pageValueSchema,
});

export async function GET(request: Request, context: { params: Promise<{ pageId: string }> }) {
  try {
    await requireActor(request.headers, "admin");
    const { pageId } = await context.params;
    const page = await pageRepository.findById(pageId);
    return page
      ? Response.json({ page })
      : Response.json({ error: "Page not found" }, { status: 404 });
  } catch (error) {
    return problem(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ pageId: string }> }) {
  try {
    const actor = await requireMutationActor(request, "admin");
    const { pageId } = await context.params;
    const input = updateSchema.parse(await request.json());
    const page = await contentService.updatePageDraft({ pageId, actor, ...input });
    return Response.json({ page });
  } catch (error) {
    return problem(error);
  }
}
