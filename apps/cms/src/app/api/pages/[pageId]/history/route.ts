import { requireActor } from "@/lib/actor";
import { pageRepository } from "@/lib/content";
import { problem } from "@/lib/http";

export async function GET(request: Request, context: { params: Promise<{ pageId: string }> }) {
  try {
    await requireActor(request.headers, "admin");
    const { pageId } = await context.params;
    const page = await pageRepository.findById(pageId);
    if (!page) return Response.json({ error: "Page not found" }, { status: 404 });
    const [revisions, auditEvents] = await Promise.all([
      pageRepository.listRevisions(pageId),
      pageRepository.listAuditEvents(pageId),
    ]);
    return Response.json({ pageId, revisions, auditEvents });
  } catch (error) {
    return problem(error);
  }
}
