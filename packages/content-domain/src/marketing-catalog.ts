export type MarketingCatalogRole = "page-block" | "site-chrome" | "system-screen" | "page-recipe";
export type MarketingSourceKind = "section" | "element" | "feedback" | "page-example";

export interface MarketingCatalogEntry {
  id: string;
  family: string;
  variant: string;
  label: string;
  role: MarketingCatalogRole;
  sourceKind: MarketingSourceKind;
  blockType?: string;
}

function label(value: string) {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
    .replace(/\bCta\b/g, "CTA")
    .replace(/\bFaq\b/g, "FAQ")
    .replace(/\b2x2\b/g, "2×2")
    .replace(/\b3x2\b/g, "3×2");
}

export const marketingSectionVariants = {
  "bento-grid": [
    "three-column",
    "two-row",
    "two-row-three-column-second-row",
  ],
  blog: [
    "three-column",
    "three-column-with-images",
    "three-column-with-background-images",
    "single-column",
    "single-column-with-images",
    "with-featured-post",
    "with-photo-and-list",
  ],
  contact: [
    "centered",
    "side-by-side-grid",
    "split-with-pattern",
    "simple-four-column",
    "simple-centered",
    "with-testimonial",
    "split-with-image",
  ],
  content: [
    "with-sticky-product-screenshot",
    "with-testimonial",
    "with-image-tiles",
    "two-columns-with-screenshot",
    "with-testimonial-and-stats",
    "split-with-image",
    "centered",
  ],
  cta: [
    "dark-panel-with-app-screenshot",
    "simple-stacked",
    "centered-on-dark-panel",
    "simple-centered",
    "simple-centered-with-gradient",
    "simple-centered-on-brand",
    "simple-justified",
    "simple-justified-on-subtle-brand",
    "split-with-image",
    "two-columns-with-photo",
    "with-image-tiles",
  ],
  faq: [
    "offset-with-supporting-text",
    "centered-accordion",
    "side-by-side",
    "three-columns",
    "three-columns-with-centered-introduction",
    "two-columns",
    "two-columns-with-centered-introduction",
  ],
  features: [
    "with-product-screenshot",
    "with-large-screenshot",
    "with-large-bordered-screenshot",
    "simple-three-column-with-small-icons",
    "with-product-screenshot-on-left",
    "simple-three-column-with-large-icons",
    "contained-in-panel",
    "with-product-screenshot-panel",
    "with-testimonial",
    "offset-2x2-grid",
    "with-code-example-panel",
    "offset-with-feature-list",
    "simple",
    "centered-2x2-grid",
    "simple-3x2-grid",
  ],
  footer: [
    "four-column-with-company-mission",
    "four-column-with-call-to-action",
    "four-column-simple",
    "four-column-with-newsletter",
    "four-column-with-newsletter-below",
    "simple-centered",
    "simple-with-social-links",
  ],
  "page-header": [
    "with-stats",
    "centered",
    "centered-with-eyebrow",
    "with-cards",
    "simple",
    "simple-with-eyebrow",
    "simple-with-background-image",
    "centered-with-background-image",
  ],
  hero: [
    "simple-centered",
    "split-with-screenshot",
    "split-with-bordered-screenshot",
    "split-with-code-example",
    "simple-centered-with-background-image",
    "with-bordered-app-screenshot",
    "with-app-screenshot",
    "with-phone-mockup",
    "split-with-image",
    "with-angled-image-on-right",
    "with-image-tiles",
    "with-offset-image",
  ],
  "logo-cloud": [
    "simple-with-heading",
    "simple-with-call-to-action",
    "simple-left-aligned",
    "split-with-logos-on-right",
    "simple",
    "grid",
  ],
  newsletter: [
    "side-by-side-with-details",
    "simple-side-by-side",
    "simple-side-by-side-on-brand",
    "simple-stacked",
    "centered-card",
    "side-by-side-on-card",
  ],
  pricing: [
    "two-tiers-with-emphasized-right-tier",
    "two-tiers-with-emphasized-left-tier",
    "three-tiers-with-logos-and-feature-comparison",
    "two-tiers-with-extra-tier",
    "single-price-with-details",
    "three-tiers",
    "three-tiers-with-dividers",
    "three-tiers-with-emphasized-tier",
    "three-tiers-with-toggle",
    "four-tiers-with-toggle",
    "with-comparison-table",
    "three-tiers-with-feature-comparison",
  ],
  stats: [
    "simple",
    "simple-grid",
    "with-background-image",
    "split-with-image",
    "timeline",
    "stepped",
    "two-column-description",
    "with-description",
  ],
  team: [
    "small-images",
    "large-images",
    "grid-with-round-images",
    "large-grid-with-cards",
    "with-image-and-short-paragraph",
    "with-vertical-images",
    "with-vertical-images-full-width",
    "grid-with-large-round-images",
    "medium-images",
  ],
  testimonial: [
    "simple-centered",
    "with-large-avatar",
    "with-overlapping-image",
    "with-background-image",
    "side-by-side",
    "with-star-rating",
    "grid",
    "subtle-grid",
  ],
} as const;

export type MarketingSectionFamily = keyof typeof marketingSectionVariants;

export const marketingElementVariants = {
  banner: [
    "with-button",
    "on-dark",
    "on-brand",
    "with-background-glow",
    "with-link",
    "left-aligned",
    "bottom-aligned",
    "floating-at-bottom",
    "floating-at-bottom-centered",
    "privacy-notice-right-aligned",
    "privacy-notice-centered",
    "privacy-notice-left-aligned",
    "privacy-notice-full-width",
  ],
  "flyout-menu": [
    "stacked-with-footer-actions",
    "full-width-two-columns",
    "stacked-with-footer-list",
    "full-width",
    "simple-with-descriptions",
    "two-column",
    "simple",
  ],
  header: [
    "with-stacked-flyout-menu",
    "constrained",
    "on-brand-background",
    "with-full-width-flyout-menu",
    "full-width",
    "with-call-to-action",
    "with-multiple-flyout-menus",
    "with-icons-in-mobile-menu",
    "with-left-aligned-nav",
    "with-right-aligned-nav",
    "with-centered-logo",
  ],
} as const;

export const notFoundVariants = [
  "simple",
  "split-with-image",
  "with-popular-pages",
  "with-background-image",
  "with-navbar-and-footer",
] as const;

export const pageRecipeVariants = {
  about: [
    "with-image-tiles",
    "with-timeline-and-stats",
    "with-two-column-description",
  ],
  landing: [
    "with-screenshots-and-stats",
    "with-large-screenshot-and-testimonial",
    "with-background-image-hero-and-pricing-section",
    "with-mobile-screenshot-and-testimonials-grid",
  ],
  pricing: [
    "with-four-tiers",
    "with-comparison-table",
    "with-three-tiers-and-testimonials",
  ],
} as const;

const sectionBlockTypes: Record<MarketingSectionFamily, string | undefined> = {
  "bento-grid": "marketing.bento-grid",
  blog: "content.blog",
  contact: "content.contact",
  content: "content.rich-text",
  cta: "marketing.cta",
  faq: "marketing.faq",
  features: "marketing.feature-grid",
  footer: undefined,
  "page-header": "marketing.page-header",
  hero: "marketing.hero",
  "logo-cloud": "marketing.logo-cloud",
  newsletter: "marketing.newsletter",
  pricing: "marketing.pricing",
  stats: "marketing.stats",
  team: "content.team",
  testimonial: "marketing.testimonial",
};

const sectionEntries = Object.entries(marketingSectionVariants).flatMap(([family, variants]) =>
  variants.map((variant) => ({
    id: `marketing.section.${family}.${variant}`,
    family,
    variant,
    label: `${label(family)} — ${label(variant)}`,
    role: family === "footer" ? "site-chrome" as const : "page-block" as const,
    sourceKind: "section" as const,
    blockType: sectionBlockTypes[family as MarketingSectionFamily],
  })),
);

const elementEntries = Object.entries(marketingElementVariants).flatMap(([family, variants]) =>
  variants.map((variant) => ({
    id: `marketing.element.${family}.${variant}`,
    family,
    variant,
    label: `${label(family)} — ${label(variant)}`,
    role: "site-chrome" as const,
    sourceKind: "element" as const,
  })),
);

const feedbackEntries = notFoundVariants.map((variant) => ({
  id: `marketing.feedback.not-found.${variant}`,
  family: "not-found",
  variant,
  label: `Not Found — ${label(variant)}`,
  role: "system-screen" as const,
  sourceKind: "feedback" as const,
}));

const recipeEntries = Object.entries(pageRecipeVariants).flatMap(([family, variants]) =>
  variants.map((variant) => ({
    id: `marketing.recipe.${family}.${variant}`,
    family,
    variant,
    label: `${label(family)} Page — ${label(variant)}`,
    role: "page-recipe" as const,
    sourceKind: "page-example" as const,
  })),
);

export const marketingCatalog = [
  ...sectionEntries,
  ...elementEntries,
  ...feedbackEntries,
  ...recipeEntries,
] satisfies MarketingCatalogEntry[];

export const pageBlockVariants = Object.fromEntries(
  Object.entries(sectionBlockTypes)
    .filter((entry): entry is [MarketingSectionFamily, string] => Boolean(entry[1]))
    .map(([family, blockType]) => [blockType, marketingSectionVariants[family]]),
) as Record<string, readonly string[]>;

export const marketingCatalogSummary = {
  total: marketingCatalog.length,
  sections: marketingCatalog.filter((entry) => entry.sourceKind === "section").length,
  elements: marketingCatalog.filter((entry) => entry.sourceKind === "element").length,
  systemScreens: marketingCatalog.filter((entry) => entry.sourceKind === "feedback").length,
  recipes: marketingCatalog.filter((entry) => entry.sourceKind === "page-example").length,
};

export function variantsForBlock(blockType: string) {
  return pageBlockVariants[blockType] ?? [];
}

export function marketingLabel(value: string) {
  return label(value);
}
