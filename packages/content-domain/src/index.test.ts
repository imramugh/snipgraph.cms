import { describe, expect, it } from "vitest";
import {
  blockCatalog,
  createBlock,
  defaultTheme,
  marketingCatalog,
  marketingCatalogSummary,
  mediaMetadataSchema,
  pageValueSchema,
  siteSettingsValueSchema,
  pageRecipes,
  createBlocksFromRecipe,
} from "./index.js";

function page(overrides: Record<string, unknown> = {}) {
  return {
    title: "About",
    slug: "/about",
    description: "About this practice",
    blocks: [createBlock("marketing.hero", "hero-1")],
    ...overrides,
  };
}

describe("page content", () => {
  it("requires a rooted, normalized slug", () => {
    expect(() =>
      pageValueSchema.parse({
        ...page(),
        slug: "about",
      }),
    ).toThrow();
  });

  it("accepts the default value for every catalogued block", () => {
    const blocks = blockCatalog.map((definition, index) =>
      createBlock(definition.type, `block-${index}`),
    );

    expect(pageValueSchema.parse(page({ blocks })).blocks).toHaveLength(
      blockCatalog.length,
    );
  });

  it("rejects unknown block types", () => {
    expect(() =>
      pageValueSchema.parse(
        page({
          blocks: [
            {
              id: "unknown-1",
              type: "marketing.unknown",
              version: 1,
              data: {},
            },
          ],
        }),
      ),
    ).toThrow();
  });

  it("rejects duplicate stable block IDs", () => {
    expect(() =>
      pageValueSchema.parse(
        page({
          blocks: [
            createBlock("marketing.hero", "same-id"),
            createBlock("marketing.cta", "same-id"),
          ],
        }),
      ),
    ).toThrow(/Block IDs must be unique/);
  });

  it("rejects executable and protocol-relative links", () => {
    for (const unsafe of ["javascript:alert(1)", "data:text/html,unsafe", "//evil.test"]) {
      expect(() =>
        pageValueSchema.parse(
          page({
            blocks: [
              {
                ...createBlock("marketing.cta", "cta-1"),
                data: {
                  heading: "Continue",
                  buttonLabel: "Open",
                  buttonHref: unsafe,
                },
              },
            ],
          }),
        ),
      ).toThrow(/internal path, HTTPS URL/);
    }
  });
});

describe("site settings and media", () => {
  it("rejects duplicate redirect sources and self redirects", () => {
    const base = {
      siteName: "Example",
      tagline: "A site",
      footerText: "Footer",
      navigation: [],
      socialLinks: [],
      defaultSeo: { titleTemplate: "%s — Example", description: "Example site" },
    };
    expect(() => siteSettingsValueSchema.parse({ ...base, redirects: [
      { id: "one", source: "/old", target: "/new", permanent: true },
      { id: "two", source: "/old", target: "/other", permanent: false },
    ] })).toThrow(/unique/);
    expect(() => siteSettingsValueSchema.parse({ ...base, redirects: [
      { id: "one", source: "/same", target: "/same", permanent: true },
    ] })).toThrow(/itself/);
  });

  it("requires alternative text unless media is decorative", () => {
    expect(() => mediaMetadataSchema.parse({ altText: "", decorative: false })).toThrow(/Alternative text/);
    expect(mediaMetadataSchema.parse({ altText: "", decorative: true }).decorative).toBe(true);
  });

  it("defaults a governed theme and rejects inaccessible critical pairs", () => {
    const base = {
      siteName: "Example",
      tagline: "A site",
      footerText: "Footer",
      navigation: [],
      socialLinks: [],
      defaultSeo: { titleTemplate: "%s — Example", description: "Example site" },
      redirects: [],
    };
    expect(siteSettingsValueSchema.parse(base).theme.fonts.display.family).toBe("Playfair Display");
    expect(() => siteSettingsValueSchema.parse({
      ...base,
      theme: {
        ...defaultTheme,
        palette: { ...defaultTheme.palette, canvas: "#FFFFFF", text: "#FFFFFF" },
      },
    })).toThrow(/contrast/);
  });
});

describe("exhaustive marketing catalog", () => {
  it("accounts for every licensed React pattern exactly once", () => {
    expect(marketingCatalogSummary).toEqual({
      total: 179,
      sections: 133,
      elements: 31,
      systemScreens: 5,
      recipes: 10,
    });
    expect(new Set(marketingCatalog.map((entry) => entry.id)).size).toBe(179);
  });

  it("exposes variants for every Marketing-backed block family", () => {
    for (const definition of blockCatalog.filter((candidate) => candidate.type !== "media.image" && candidate.type !== "content.project-grid")) {
      expect(definition.variants?.length, definition.type).toBeGreaterThan(0);
    }
  });

  it("accepts every declared page-block variant through the shared schema", () => {
    for (const definition of blockCatalog) {
      for (const variant of "variants" in definition ? definition.variants : []) {
        const block = createBlock(definition.type, `${definition.type}-${variant}`);
        expect(() => pageValueSchema.parse(page({ blocks: [{ ...block, data: { ...block.data, variant } }] })), `${definition.type}/${variant}`).not.toThrow();
      }
    }
  });

  it("expands every composed page recipe into independently valid blocks", () => {
    let sequence = 0;
    for (const recipe of pageRecipes) {
      const blocks = createBlocksFromRecipe(recipe.id, () => `recipe-block-${sequence++}`);
      expect(pageValueSchema.parse(page({ blocks })).blocks.length, recipe.id).toBe(recipe.steps.length);
    }
  });
});
