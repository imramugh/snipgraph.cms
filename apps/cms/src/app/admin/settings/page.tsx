import { pageRepository, siteSettingsRepository } from "@/lib/content";
import { defaultSite } from "@/lib/site";
import { listMedia } from "@/lib/media";
import { listGoogleFonts } from "@/lib/google-fonts";
import { SettingsEditor } from "./settings-editor";

export const metadata = { title: "Site settings — Snipgraph CMS", robots: { index: false } };

export default async function SiteSettingsPage() {
  const currentSite = await defaultSite();
  const [settings, media, fonts, pages] = await Promise.all([
    siteSettingsRepository.find(currentSite.id),
    listMedia(currentSite.id),
    listGoogleFonts(),
    pageRepository.list(currentSite.id),
  ]);
  if (!settings) throw new Error("Site settings have not been initialized");
  return <SettingsEditor
    initialSettings={settings}
    initialMedia={media}
    fonts={fonts}
    pages={pages.map((page) => ({
      id: page.id,
      title: page.draftRevision.value.title,
      href: page.draftRevision.value.slug === "/" ? "/" : `/${page.draftRevision.value.slug.replace(/^\/+/, "")}`,
      published: Boolean(page.publishedRevision),
    }))}
  />;
}
