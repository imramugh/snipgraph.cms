import { PageRenderer } from "@/components/content/page-renderer";
import { InlinePageEditor } from "@/components/editor/inline-page-editor";
import { auth } from "@/lib/auth";
import { pageRepository } from "@/lib/content";
import { defaultSite, publishedSiteSettings } from "@/lib/site";
import { headers } from "next/headers";
import { notFound, permanentRedirect, redirect } from "next/navigation";

export async function renderPublicPage(slug: string) {
  const currentSite = await defaultSite();
  const [published, settings] = await Promise.all([
    pageRepository.findPublishedBySlug(currentSite.id, slug),
    publishedSiteSettings(),
  ]);
  if (!published) {
    const redirectRule = settings.redirects.find((candidate) => candidate.source === slug);
    if (redirectRule?.permanent) permanentRedirect(redirectRule.target);
    if (redirectRule) redirect(redirectRule.target);
    notFound();
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) {
    const page = await pageRepository.findById(published.id);
    if (page) return <InlinePageEditor initialPage={page} settings={settings} />;
  }

  return <PageRenderer pageId={published.id} revisionId={published.revision.id} value={published.revision.value} settings={settings} />;
}

export async function metadataForPublicPage(slug: string) {
  const currentSite = await defaultSite();
  const [published, settings] = await Promise.all([
    pageRepository.findPublishedBySlug(currentSite.id, slug),
    publishedSiteSettings(),
  ]);
  if (!published) return {};
  const title = settings.defaultSeo.titleTemplate.includes("%s")
    ? settings.defaultSeo.titleTemplate.replace("%s", published.revision.value.title)
    : `${published.revision.value.title} — ${settings.defaultSeo.titleTemplate}`;
  const description = published.revision.value.description || settings.defaultSeo.description;
  const socialImage = settings.defaultSeo.socialImageMediaId
    ? `${process.env.PUBLIC_URL ?? "http://localhost:3000"}/api/media/${settings.defaultSeo.socialImageMediaId}`
    : undefined;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" as const, images: socialImage ? [socialImage] : undefined },
  };
}
