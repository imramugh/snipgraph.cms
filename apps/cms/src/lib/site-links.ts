import type { PageRecord, SiteSettingsValue } from "@snipgraph/content-domain";

export interface SiteLinkReference {
  sourceId: string;
  sourceLabel: string;
  location: string;
  target: string;
}

export interface SitePageNode {
  id: string;
  title: string;
  href: string;
  published: boolean;
  draftChanges: boolean;
  blockTypes: string[];
  inNavigation: boolean;
  inboundLinks: number;
}

function internalTarget(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  const withoutFragment = value.split(/[?#]/, 1)[0];
  return withoutFragment || "/";
}

function collectObjectLinks(value: unknown, sourceId: string, sourceLabel: string, location: string, output: SiteLinkReference[]) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectObjectLinks(item, sourceId, sourceLabel, `${location}[${index + 1}]`, output));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    const nextLocation = location ? `${location}.${key}` : key;
    if (/href$/i.test(key) && typeof child === "string") {
      const target = internalTarget(child);
      if (target) output.push({ sourceId, sourceLabel, location: nextLocation, target });
    } else {
      collectObjectLinks(child, sourceId, sourceLabel, nextLocation, output);
    }
  }
}

export function analyzeSiteLinks(pages: PageRecord[], settings: SiteSettingsValue) {
  const references: SiteLinkReference[] = [];
  collectObjectLinks({
    navigation: settings.navigation,
    footerGroups: settings.footerGroups,
    chrome: settings.chrome,
  }, "settings", "Site settings", "", references);
  pages.forEach((page) => collectObjectLinks(page.draftRevision.value.blocks, page.id, page.draftRevision.value.title, "blocks", references));
  settings.redirects.forEach((redirect, index) => {
    const target = internalTarget(redirect.target);
    if (target) references.push({ sourceId: "settings", sourceLabel: "Site settings", location: `redirects[${index + 1}].target`, target });
  });

  const paths = new Set(pages.map((page) => page.draftRevision.value.slug));
  const redirectSources = new Set(settings.redirects.map((redirect) => redirect.source));
  const broken = references.filter((reference) => !paths.has(reference.target) && !redirectSources.has(reference.target));
  const navigationTargets = new Set(settings.navigation.flatMap((item) => [item.href, ...(item.children ?? []).map((child) => child.href)]).map(internalTarget).filter((target): target is string => Boolean(target)));
  const nodes: SitePageNode[] = pages.map((page) => {
    const href = page.draftRevision.value.slug;
    return {
      id: page.id,
      title: page.draftRevision.value.title,
      href,
      published: Boolean(page.publishedRevision),
      draftChanges: page.publishedRevision?.id !== page.draftRevision.id,
      blockTypes: page.draftRevision.value.blocks.map((block) => block.type),
      inNavigation: navigationTargets.has(href),
      inboundLinks: references.filter((reference) => reference.target === href && reference.sourceId !== page.id).length,
    };
  });
  const unlinked = nodes.filter((node) => node.href !== "/" && node.inboundLinks === 0);
  return { references, broken, nodes, unlinked };
}
