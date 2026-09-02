import { listMedia } from "@/lib/media";
import { defaultSite } from "@/lib/site";
import { MediaLibrary } from "./media-library";

export const metadata = { title: "Media — Snipgraph CMS", robots: { index: false } };

export default async function MediaPage() {
  const currentSite = await defaultSite();
  return <MediaLibrary initialMedia={await listMedia(currentSite.id)} />;
}

