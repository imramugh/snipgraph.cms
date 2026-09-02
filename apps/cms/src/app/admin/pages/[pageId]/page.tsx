import { pageRepository } from "@/lib/content";
import { notFound } from "next/navigation";
import { PageEditor } from "./page-editor";

export const dynamic = "force-dynamic";

export default async function EditPage({ params }: { params: Promise<{ pageId: string }> }) {
  const pageId = (await params).pageId;
  const page = await pageRepository.findById(pageId);
  if (!page) notFound();
  const [revisions, events] = await Promise.all([
    pageRepository.listRevisions(pageId),
    pageRepository.listAuditEvents(pageId),
  ]);

  return (
    <section>
      <PageEditor initialPage={page} initialRevisions={revisions} events={events} />
    </section>
  );
}
