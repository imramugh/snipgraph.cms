import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marketingCatalog } from "@snipgraph/content-domain";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const licensedRoot = path.join(repositoryRoot, "tailwindplus.packages/marketing-v4/react");

function variants(relativeDirectory: string) {
  return readdirSync(path.join(licensedRoot, relativeDirectory))
    .filter((filename) => filename.endsWith(".jsx"))
    .map((filename) => filename.replace(/\.jsx$/, "").replace(/^\d+[.-]/, ""));
}

function productVariant(family: string, variant: string) {
  if (family === "bento-grid") return variant.replace(/-bento-grid-with-/, "-").replace(/-bento-grid$/, "");
  if (family === "footer") return variant.replace(/^4-column/, "four-column");
  return variant;
}

const expected: string[] = [];
const sectionFamilies = {
  "bento-grids": "bento-grid",
  "blog-sections": "blog",
  "contact-sections": "contact",
  "content-sections": "content",
  "cta-sections": "cta",
  "faq-sections": "faq",
  "feature-sections": "features",
  footers: "footer",
  header: "page-header",
  heroes: "hero",
  "logo-clouds": "logo-cloud",
  "newsletter-sections": "newsletter",
  pricing: "pricing",
  "stats-sections": "stats",
  "team-sections": "team",
  testimonials: "testimonial",
};
for (const [directory, family] of Object.entries(sectionFamilies)) {
  variants(`sections/${directory}`).forEach((variant) => expected.push(`marketing.section.${family}.${productVariant(family, variant)}`));
}

const elementFamilies = { banners: "banner", "flyout-menus": "flyout-menu", headers: "header" };
for (const [directory, family] of Object.entries(elementFamilies)) {
  variants(`elements/${directory}`).forEach((variant) => expected.push(`marketing.element.${family}.${variant}`));
}
variants("feedback/404-pages").forEach((variant) => expected.push(`marketing.feedback.not-found.${variant}`));

const recipeFamilies = { "about-pages": "about", "landing-pages": "landing", "pricing-pages": "pricing" };
for (const [directory, family] of Object.entries(recipeFamilies)) {
  variants(`page-examples/${directory}`).forEach((variant) => expected.push(`marketing.recipe.${family}.${variant}`));
}

const actual = new Set(marketingCatalog.map((entry) => entry.id));
const missing = expected.filter((id) => !actual.has(id));
const extra = [...actual].filter((id) => !expected.includes(id));
if (missing.length || extra.length) {
  throw new Error(`Marketing catalog differs from licensed input. Missing: ${missing.join(", ") || "none"}. Extra: ${extra.join(", ") || "none"}.`);
}
console.log(`validated ${expected.length} licensed Marketing patterns against ${actual.size} catalog entries`);
