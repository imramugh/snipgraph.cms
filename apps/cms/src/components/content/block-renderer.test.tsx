import {
  blockCatalog,
  blockSchema,
  createBlock,
  defaultSiteChrome,
  defaultTheme,
  marketingElementVariants,
  marketingSectionVariants,
  pageValueSchema,
  siteSettingsValueSchema,
} from "@snipgraph/content-domain";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BlockRenderer } from "./block-renderer";
import { PageRenderer } from "./page-renderer";

describe("Marketing renderer coverage", () => {
  it("renders every declared page-block variant with its stable identifier", () => {
    for (const definition of blockCatalog) {
      for (const variant of "variants" in definition ? definition.variants : []) {
        const base = createBlock(definition.type, `${definition.type}-${variant}`);
        const block = blockSchema.parse({ ...base, data: { ...base.data, variant } });
        const markup = renderToStaticMarkup(<BlockRenderer block={block} />);
        expect(markup, `${definition.type}/${variant}`).toContain(`data-variant="${variant}"`);
      }
    }
  });

  it("renders every governed header, flyout, footer, and banner variant", () => {
    const base = siteSettingsValueSchema.parse({
      siteName: "Example",
      tagline: "Example",
      footerText: "Footer",
      navigation: [{ id: "work", label: "Work", href: "/work", children: [{ id: "projects", label: "Projects", href: "/projects", description: "Selected work" }] }],
      socialLinks: [],
      footerGroups: [{ id: "explore", title: "Explore", links: [{ id: "home", label: "Home", href: "/" }] }],
      defaultSeo: { titleTemplate: "%s — Example", description: "Example" },
      redirects: [],
      theme: defaultTheme,
      chrome: defaultSiteChrome,
    });
    const page = pageValueSchema.parse({ title: "Example", slug: "/", description: "Example", blocks: [createBlock("marketing.hero", "hero")] });
    const render = (chrome: typeof base.chrome) => renderToStaticMarkup(<PageRenderer pageId="page" revisionId="revision" value={page} settings={{ ...base, chrome }} />);
    for (const headerVariant of marketingElementVariants.header) expect(render({ ...base.chrome, headerVariant })).toContain(`data-variant="${headerVariant}"`);
    for (const flyoutVariant of marketingElementVariants["flyout-menu"]) expect(render({ ...base.chrome, flyoutVariant })).toContain(`data-variant="${flyoutVariant}"`);
    for (const footerVariant of marketingSectionVariants.footer) expect(render({ ...base.chrome, footerVariant })).toContain(`data-variant="${footerVariant}"`);
    for (const variant of marketingElementVariants.banner) expect(render({ ...base.chrome, banner: { ...base.chrome.banner, enabled: true, variant } })).toContain(`data-variant="${variant}"`);
  });
});
