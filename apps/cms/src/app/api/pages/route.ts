import { pageValueSchema } from "@snipgraph/content-domain";
import { headers } from "next/headers";
import { requireActor, requireMutationActor } from "@/lib/actor";
import { contentService, pageRepository } from "@/lib/content";
import { problem } from "@/lib/http";
import { defaultSite } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireActor(await headers(), "admin");
    const currentSite = await defaultSite();
    return Response.json({ pages: await pageRepository.list(currentSite.id) });
  } catch (error) {
    return problem(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireMutationActor(request, "admin");
    const currentSite = await defaultSite();
    const body: unknown = await request.json();
    const page = await contentService.createPageDraft({
      siteId: currentSite.id,
      actor,
      value: pageValueSchema.parse(body),
    });
    return Response.json({ page }, { status: 201 });
  } catch (error) {
    return problem(error);
  }
}
