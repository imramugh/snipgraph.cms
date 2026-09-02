import { metadataForPublicPage, renderPublicPage } from "@/lib/render-public-page";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return metadataForPublicPage("/");
}

export default function Home() {
  return renderPublicPage("/");
}
