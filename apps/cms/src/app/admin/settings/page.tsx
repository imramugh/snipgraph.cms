import { siteSettingsRepository } from "@/lib/content";
import { defaultSite } from "@/lib/site";
import { listMedia } from "@/lib/media";
import { SettingsEditor } from "./settings-editor";

export const metadata = { title: "Site settings — Snipgraph CMS", robots: { index: false } };

export default async function SiteSettingsPage() {
  const currentSite = await defaultSite();
  const [settings, media] = await Promise.all([
    siteSettingsRepository.find(currentSite.id),
    listMedia(currentSite.id),
  ]);
  if (!settings) throw new Error("Site settings have not been initialized");
  return <SettingsEditor initialSettings={settings} initialMedia={media} />;
}
