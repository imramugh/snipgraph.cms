import { requireActor, requireMutationActor } from "@/lib/actor";
import { siteSettingsRepository, siteSettingsService } from "@/lib/content";
import { problem } from "@/lib/http";
import { defaultSite } from "@/lib/site";
import { siteSettingsValueSchema } from "@snipgraph/content-domain";
import { z } from "zod";

const updateSchema = z.object({
  expectedSequence: z.number().int().positive(),
  value: siteSettingsValueSchema,
});

export async function GET(request: Request) {
  try {
    await requireActor(request.headers, "admin");
    const currentSite = await defaultSite();
    return Response.json({ settings: await siteSettingsRepository.find(currentSite.id) });
  } catch (error) {
    return problem(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = await requireMutationActor(request, "admin");
    const currentSite = await defaultSite();
    const input = updateSchema.parse(await request.json());
    const settings = await siteSettingsService.updateDraft({
      siteId: currentSite.id,
      actor,
      ...input,
    });
    return Response.json({ settings });
  } catch (error) {
    return problem(error);
  }
}

