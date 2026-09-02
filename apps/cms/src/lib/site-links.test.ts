import { defaultSiteChrome, defaultTheme, type PageRecord, type SiteSettingsValue } from "@snipgraph/content-domain";
import { describe, expect, it } from "vitest";
import { analyzeSiteLinks } from "./site-links";

function page(id: string, title: string, slug: string, links: string[] = []): PageRecord {
  const revision = { id: `${id}-revision`, pageId: id, sequence: 1, schemaVersion: 4, value: { title, slug, description: title, blocks: [{ id: `${id}-block`, type: "marketing.hero" as const, version: 1 as const, data: { heading: title, body: title, primaryHref: links[0] ?? "", secondaryHref: links[1] ?? "" } }] }, createdAt: new Date(), createdBy: "test", source: "admin" as const };
  return { id, siteId: "site", updatedAt: new Date(), draftRevision: revision, publishedRevision: revision };
}

const settings: SiteSettingsValue = {
  siteName: "Test", tagline: "", footerText: "", socialLinks: [], footerGroups: [], redirects: [], theme: defaultTheme, chrome: defaultSiteChrome,
  defaultSeo: { titleTemplate: "%s", description: "Test" },
  navigation: [{ id: "nav", label: "About", href: "/about" }],
};

describe("site link graph", () => {
  it("reports navigation membership, inbound references, orphans, and broken internal targets", () => {
    const result = analyzeSiteLinks([
      page("home", "Home", "/", ["/about", "/missing?from=home"]),
      page("about", "About", "/about"),
      page("orphan", "Orphan", "/orphan"),
    ], settings);
    expect(result.nodes.find((node) => node.id === "about")).toMatchObject({ inNavigation: true, inboundLinks: 2 });
    expect(result.unlinked.map((node) => node.href)).toEqual(["/orphan"]);
    expect(result.broken).toContainEqual(expect.objectContaining({ sourceLabel: "Home", target: "/missing" }));
  });
});
