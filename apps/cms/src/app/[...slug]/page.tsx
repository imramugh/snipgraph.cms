import { metadataForPublicPage, renderPublicPage } from "@/lib/render-public-page";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  return metadataForPublicPage(`/${(await params).slug.join("/")}`);
}

export default async function PublicPage({ params }: { params: Promise<{ slug: string[] }> }) {
  return renderPublicPage(`/${(await params).slug.join("/")}`);
}
