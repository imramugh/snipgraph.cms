import { requireMutationActor } from "@/lib/actor";
import { siteSettingsService } from "@/lib/content";
import { problem } from "@/lib/http";
import { defaultSite } from "@/lib/site";
import { z } from "zod";

const inputSchema = z.object({ expectedSequence: z.number().int().positive() });

export async function POST(request: Request) {
  try {
    const actor = await requireMutationActor(request, "admin");
    const currentSite = await defaultSite();
    const input = inputSchema.parse(await request.json());
    const settings = await siteSettingsService.publish({
      siteId: currentSite.id,
      actor,
      ...input,
    });
    return Response.json({ settings });
  } catch (error) {
    return problem(error);
  }
}

