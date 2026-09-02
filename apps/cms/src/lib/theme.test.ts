import { defaultTheme, siteSettingsValueSchema } from "@snipgraph/content-domain";
import { describe, expect, it } from "vitest";
import { googleFontsUrl, publicThemeStyle } from "./theme";

describe("public theme", () => {
  it("builds one deterministic Google Fonts request with explicit weights", () => {
    const theme = siteSettingsValueSchema.parse({
      siteName: "Example",
      tagline: "Example",
      footerText: "Footer",
      navigation: [],
      socialLinks: [],
      defaultSeo: { titleTemplate: "%s — Example", description: "Example" },
      redirects: [],
      theme: defaultTheme,
    }).theme;
    const url = googleFontsUrl(theme);
    expect(url).toContain("family=Inter:wght@400;500;600;700");
    expect(url).toContain("family=Playfair+Display:wght@400;500;600;700");
    expect(url.match(/family=/g)).toHaveLength(3);
  });

  it("maps semantic theme values to public-only CSS variables", () => {
    const styles = publicThemeStyle(siteSettingsValueSchema.parse({
      siteName: "Example",
      tagline: "Example",
      footerText: "Footer",
      navigation: [],
      socialLinks: [],
      defaultSeo: { titleTemplate: "%s — Example", description: "Example" },
      redirects: [],
    }).theme) as Record<string, string>;
    expect(styles["--site-brand"]).toBe("#1F2A3D");
    expect(styles["--site-font-display"]).toContain("Playfair Display");
  });
});
