import { PageRenderer } from "@/components/content/page-renderer";
import { auth } from "@/lib/auth";
import { pageRepository } from "@/lib/content";
import { publishedSiteSettings } from "@/lib/site";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function PreviewPage({ params }: { params: Promise<{ pageId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");
  const [page, settings] = await Promise.all([
    pageRepository.findById((await params).pageId),
    publishedSiteSettings(),
  ]);
  if (!page) notFound();
  return <><div className="preview-bar"><strong>Draft preview</strong><span>Revision {page.draftRevision.sequence}</span></div><PageRenderer pageId={page.id} revisionId={page.draftRevision.id} value={page.draftRevision.value} settings={settings} /></>;
}
