import { z } from "zod";
import {
  marketingElementVariants,
  marketingSectionVariants,
  notFoundVariants,
  pageRecipeVariants,
} from "./marketing-catalog";

export * from "./marketing-catalog";

export const PAGE_SCHEMA_VERSION = 4;
export const SITE_SETTINGS_SCHEMA_VERSION = 2;

function isSafeLink(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return ["https:", "mailto:", "tel:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

const linkSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(isSafeLink, "Use an internal path, HTTPS URL, email link, or telephone link.");
const optionalLinkSchema = z.union([z.literal(""), linkSchema]).optional();
const internalPathSchema = z
  .string()
  .trim()
  .regex(/^\/(?!\/)(?:[^\s]*)$/, "Use a rooted internal path.");
const shortText = z.string().trim().min(1).max(160);
const longText = z.string().trim().min(1).max(5000);
const mediaIdSchema = z.union([z.literal(""), z.string().uuid()]).optional();
const schemeSchema = z.enum(["default", "muted", "brand", "dark", "image"]).optional();
const commonItemSchema = z.object({
  id: z.string().min(1),
  title: shortText,
  body: z.string().trim().min(1).max(1000),
  href: optionalLinkSchema,
  imageMediaId: mediaIdSchema,
});

export const heroBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("marketing.hero"),
  version: z.literal(1),
  data: z.object({
    variant: z.enum(marketingSectionVariants.hero).optional(),
    scheme: schemeSchema,
    eyebrow: z.string().trim().max(80).optional(),
    heading: shortText,
    body: longText,
    primaryLabel: z.string().trim().max(80).optional(),
    primaryHref: optionalLinkSchema,
    secondaryLabel: z.string().trim().max(80).optional(),
    secondaryHref: optionalLinkSchema,
    imageMediaId: mediaIdSchema,
    code: z.string().trim().max(5000).optional(),
  }),
});

export const richTextBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("content.rich-text"),
  version: z.literal(1),
  data: z.object({
    variant: z.enum(marketingSectionVariants.content).optional(),
    scheme: schemeSchema,
    eyebrow: z.string().trim().max(80).optional(),
    heading: shortText,
    body: longText,
    imageMediaId: mediaIdSchema,
    quote: z.string().trim().max(1500).optional(),
    quoteAuthor: z.string().trim().max(160).optional(),
    stats: z.array(z.object({ id: z.string().min(1), value: z.string().trim().min(1).max(40), label: z.string().trim().min(1).max(120) })).max(8).optional(),
  }),
});

export const featureGridBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("marketing.feature-grid"),
  version: z.literal(1),
  data: z.object({
    variant: z.enum(marketingSectionVariants.features).optional(),
    scheme: schemeSchema,
    eyebrow: z.string().trim().max(80).optional(),
    heading: shortText,
    intro: z.string().trim().max(1000).optional(),
    items: z
      .array(
        z.object({
          id: z.string().min(1),
          title: shortText,
          body: z.string().trim().min(1).max(1000),
          icon: z.string().trim().max(80).optional(),
        }),
      )
      .min(1)
      .max(12),
    imageMediaId: mediaIdSchema,
    code: z.string().trim().max(5000).optional(),
    quote: z.string().trim().max(1500).optional(),
  }),
});

export const ctaBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("marketing.cta"),
  version: z.literal(1),
  data: z.object({
    variant: z.enum(marketingSectionVariants.cta).optional(),
    scheme: schemeSchema,
    heading: shortText,
    body: z.string().trim().max(1000).optional(),
    buttonLabel: shortText,
    buttonHref: linkSchema,
    imageMediaId: mediaIdSchema,
  }),
});

export const imageBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("media.image"),
  version: z.literal(1),
  data: z.object({
    mediaId: z.string().uuid(),
    alt: z.string().trim().max(500),
    caption: z.string().trim().max(500).optional(),
    presentation: z.enum(["wide", "contained", "portrait"]),
  }),
});

export const statsBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("marketing.stats"),
  version: z.literal(1),
  data: z.object({
    variant: z.enum(marketingSectionVariants.stats).optional(),
    scheme: schemeSchema,
    eyebrow: z.string().trim().max(80).optional(),
    heading: shortText,
    intro: z.string().trim().max(1000).optional(),
    items: z.array(z.object({ id: z.string().min(1), value: z.string().trim().min(1).max(40), label: z.string().trim().min(1).max(120) })).min(1).max(8),
    imageMediaId: mediaIdSchema,
  }),
});

export const testimonialBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("marketing.testimonial"),
  version: z.literal(1),
  data: z.object({
    variant: z.enum(marketingSectionVariants.testimonial).optional(),
    scheme: schemeSchema,
    quote: z.string().trim().min(1).max(1500),
    author: shortText,
    role: z.string().trim().max(160).optional(),
    avatarMediaId: z.union([z.literal(""), z.string().uuid()]).optional(),
    backgroundMediaId: mediaIdSchema,
    rating: z.number().int().min(1).max(5).optional(),
    items: z.array(z.object({
      id: z.string().min(1),
      quote: z.string().trim().min(1).max(1500),
      author: shortText,
      role: z.string().trim().max(160).optional(),
      avatarMediaId: mediaIdSchema,
      rating: z.number().int().min(1).max(5).optional(),
    })).max(12).optional(),
  }),
});

export const logoCloudBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("marketing.logo-cloud"),
  version: z.literal(1),
  data: z.object({
    variant: z.enum(marketingSectionVariants["logo-cloud"]).optional(),
    scheme: schemeSchema,
    heading: shortText,
    body: z.string().trim().max(1000).optional(),
    actionLabel: z.string().trim().max(80).optional(),
    actionHref: optionalLinkSchema,
    logos: z.array(z.object({ id: z.string().min(1), name: z.string().trim().min(1).max(100), mediaId: z.string().uuid(), href: optionalLinkSchema })).min(1).max(12),
  }),
});

export const projectGridBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("content.project-grid"),
  version: z.literal(1),
  data: z.object({
    eyebrow: z.string().trim().max(80).optional(),
    heading: shortText,
    intro: z.string().trim().max(1000).optional(),
    items: z.array(z.object({
      id: z.string().min(1),
      title: shortText,
      body: z.string().trim().min(1).max(1000),
      href: optionalLinkSchema,
      imageMediaId: z.union([z.literal(""), z.string().uuid()]).optional(),
    })).min(1).max(12),
  }),
});

export const contactBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("content.contact"),
  version: z.literal(1),
  data: z.object({
    variant: z.enum(marketingSectionVariants.contact).optional(),
    scheme: schemeSchema,
    eyebrow: z.string().trim().max(80).optional(),
    heading: shortText,
    body: z.string().trim().max(1000).optional(),
    email: z.union([z.literal(""), z.email()]).optional(),
    phone: z.string().trim().max(50).optional(),
    location: z.string().trim().max(160).optional(),
    imageMediaId: mediaIdSchema,
    quote: z.string().trim().max(1500).optional(),
    quoteAuthor: z.string().trim().max(160).optional(),
  }),
});

export const bentoGridBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("marketing.bento-grid"),
  version: z.literal(1),
  data: z.object({
    variant: z.enum(marketingSectionVariants["bento-grid"]),
    scheme: schemeSchema,
    eyebrow: z.string().trim().max(80).optional(),
    heading: shortText,
    intro: z.string().trim().max(1000).optional(),
    items: z.array(commonItemSchema).min(3).max(8),
  }),
});

export const blogBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("content.blog"),
  version: z.literal(1),
  data: z.object({
    variant: z.enum(marketingSectionVariants.blog),
    scheme: schemeSchema,
    eyebrow: z.string().trim().max(80).optional(),
    heading: shortText,
    intro: z.string().trim().max(1000).optional(),
    posts: z.array(z.object({
      id: z.string().min(1),
      title: shortText,
      excerpt: z.string().trim().min(1).max(1000),
      href: linkSchema,
      publishedAt: z.string().trim().max(80).optional(),
      author: z.string().trim().max(160).optional(),
      imageMediaId: mediaIdSchema,
      featured: z.boolean().optional(),
    })).min(1).max(12),
  }),
});

export const faqBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("marketing.faq"),
  version: z.literal(1),
  data: z.object({
    variant: z.enum(marketingSectionVariants.faq),
    scheme: schemeSchema,
    eyebrow: z.string().trim().max(80).optional(),
    heading: shortText,
    intro: z.string().trim().max(1000).optional(),
    items: z.array(z.object({ id: z.string().min(1), question: shortText, answer: longText })).min(1).max(20),
  }),
});

export const pageHeaderBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("marketing.page-header"),
  version: z.literal(1),
  data: z.object({
    variant: z.enum(marketingSectionVariants["page-header"]),
    scheme: schemeSchema,
    eyebrow: z.string().trim().max(80).optional(),
    heading: shortText,
    body: z.string().trim().max(1500).optional(),
    imageMediaId: mediaIdSchema,
    items: z.array(commonItemSchema).max(8).optional(),
    stats: z.array(z.object({ id: z.string().min(1), value: z.string().trim().min(1).max(40), label: z.string().trim().min(1).max(120) })).max(8).optional(),
  }),
});

export const newsletterBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("marketing.newsletter"),
  version: z.literal(1),
  data: z.object({
    variant: z.enum(marketingSectionVariants.newsletter),
    scheme: schemeSchema,
    eyebrow: z.string().trim().max(80).optional(),
    heading: shortText,
    body: z.string().trim().max(1000).optional(),
    buttonLabel: shortText,
    buttonHref: linkSchema,
    details: z.array(z.object({ id: z.string().min(1), title: shortText, body: z.string().trim().max(500).optional() })).max(6).optional(),
  }),
});

export const pricingBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("marketing.pricing"),
  version: z.literal(1),
  data: z.object({
    variant: z.enum(marketingSectionVariants.pricing),
    scheme: schemeSchema,
    eyebrow: z.string().trim().max(80).optional(),
    heading: shortText,
    intro: z.string().trim().max(1000).optional(),
    tiers: z.array(z.object({
      id: z.string().min(1),
      name: shortText,
      description: z.string().trim().max(1000).optional(),
      price: z.string().trim().min(1).max(80),
      period: z.string().trim().max(80).optional(),
      buttonLabel: shortText,
      buttonHref: linkSchema,
      emphasized: z.boolean().optional(),
      features: z.array(z.string().trim().min(1).max(200)).min(1).max(30),
    })).min(1).max(6),
  }),
});

export const teamBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("content.team"),
  version: z.literal(1),
  data: z.object({
    variant: z.enum(marketingSectionVariants.team),
    scheme: schemeSchema,
    eyebrow: z.string().trim().max(80).optional(),
    heading: shortText,
    intro: z.string().trim().max(1000).optional(),
    people: z.array(z.object({
      id: z.string().min(1),
      name: shortText,
      role: z.string().trim().min(1).max(160),
      bio: z.string().trim().max(1000).optional(),
      imageMediaId: mediaIdSchema,
      links: z.array(z.object({ id: z.string().min(1), label: shortText, href: linkSchema })).max(6).optional(),
    })).min(1).max(24),
  }),
});

export const blockSchema = z.discriminatedUnion("type", [
  heroBlockSchema,
  richTextBlockSchema,
  featureGridBlockSchema,
  ctaBlockSchema,
  imageBlockSchema,
  statsBlockSchema,
  testimonialBlockSchema,
  logoCloudBlockSchema,
  projectGridBlockSchema,
  contactBlockSchema,
  bentoGridBlockSchema,
  blogBlockSchema,
  faqBlockSchema,
  pageHeaderBlockSchema,
  newsletterBlockSchema,
  pricingBlockSchema,
  teamBlockSchema,
]);

export const pageValueSchema = z
  .object({
    title: shortText,
    slug: z
      .string()
      .trim()
      .regex(
        /^\/$|^\/(?:[a-z0-9][a-z0-9_-]*)(?:\/(?:[a-z0-9][a-z0-9_-]*))*$/,
        "Use a rooted lowercase path without spaces or a trailing slash.",
      ),
    description: z.string().trim().min(1).max(500),
    blocks: z.array(blockSchema).min(1).max(40),
  })
  .superRefine((value, context) => {
    const seen = new Set<string>();
    value.blocks.forEach((block, index) => {
      if (seen.has(block.id)) {
        context.addIssue({
          code: "custom",
          message: "Block IDs must be unique within a page.",
          path: ["blocks", index, "id"],
        });
      }
      seen.add(block.id);
    });
  });

export type ContentBlock = z.infer<typeof blockSchema>;
export type BlockType = ContentBlock["type"];
export type PageValue = z.infer<typeof pageValueSchema>;

const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hexadecimal color.");
const googleFontFamilySchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[A-Za-z0-9 .&'-]+$/, "Use a Google Fonts family name without URL or CSS characters.");
const fontWeightSchema = z.union([
  z.literal(100), z.literal(200), z.literal(300), z.literal(400), z.literal(500),
  z.literal(600), z.literal(700), z.literal(800), z.literal(900),
]);
const fontRoleSchema = z.object({
  family: googleFontFamilySchema,
  weights: z.array(fontWeightSchema).min(1).max(9),
});

type ThemeFontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export const defaultTheme = {
  fonts: {
    display: { family: "Playfair Display", weights: [400, 500, 600, 700] as ThemeFontWeight[] },
    body: { family: "Inter", weights: [400, 500, 600, 700] as ThemeFontWeight[] },
    mono: { family: "Roboto Mono", weights: [400, 500, 600] as ThemeFontWeight[] },
  },
  palette: {
    canvas: "#FDFCF8",
    surface: "#F7F3EA",
    mutedSurface: "#DFE4E8",
    text: "#14181F",
    mutedText: "#56606B",
    brand: "#1F2A3D",
    brandContrast: "#FFFFFF",
    accent: "#AD6843",
    accentText: "#8F4E2C",
    accentContrast: "#FFFFFF",
    dark: "#161F2E",
    darkContrast: "#FFFFFF",
    border: "#C7CDD2",
    focus: "#AD6843",
  },
};

export const defaultSiteChrome = {
  headerVariant: "constrained",
  footerVariant: "four-column-simple",
  flyoutVariant: "simple-with-descriptions",
  notFoundVariant: "simple",
  headerCta: { label: "Get in touch", href: "/contact" },
  banner: {
    enabled: false,
    variant: "with-link",
    message: "Add an announcement for visitors.",
    actionLabel: "Learn more",
    actionHref: "/",
    dismissible: false,
  },
} as const;

function relativeLuminance(hex: string) {
  const channels = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const [red, green, blue] = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(first: string, second: string) {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

const themeSchema = z.object({
  fonts: z.object({ display: fontRoleSchema, body: fontRoleSchema, mono: fontRoleSchema }),
  palette: z.object({
    canvas: hexColorSchema,
    surface: hexColorSchema,
    mutedSurface: hexColorSchema,
    text: hexColorSchema,
    mutedText: hexColorSchema,
    brand: hexColorSchema,
    brandContrast: hexColorSchema,
    accent: hexColorSchema,
    accentText: hexColorSchema,
    accentContrast: hexColorSchema,
    dark: hexColorSchema,
    darkContrast: hexColorSchema,
    border: hexColorSchema,
    focus: hexColorSchema,
  }),
}).superRefine((theme, context) => {
  const pairs = [
    ["canvas", "text"],
    ["canvas", "mutedText"],
    ["surface", "text"],
    ["mutedSurface", "text"],
    ["canvas", "accentText"],
    ["surface", "accentText"],
    ["mutedSurface", "accentText"],
    ["brand", "brandContrast"],
    ["dark", "darkContrast"],
  ] as const;
  for (const [background, foreground] of pairs) {
    if (contrastRatio(theme.palette[background], theme.palette[foreground]) < 4.5) {
      context.addIssue({
        code: "custom",
        message: `${foreground} must have at least 4.5:1 contrast against ${background}.`,
        path: ["palette", foreground],
      });
    }
  }
});

const navigationChildSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1).max(80),
  href: linkSchema,
  description: z.string().trim().max(240).optional(),
});

const navigationItemSchema = navigationChildSchema.extend({
  children: z.array(navigationChildSchema).max(12).optional(),
});

export const siteSettingsValueSchema = z
  .object({
    siteName: z.string().trim().min(1).max(100),
    tagline: z.string().trim().max(240),
    footerText: z.string().trim().max(500),
    logoMediaId: z.union([z.literal(""), z.string().uuid()]).optional(),
    navigation: z.array(navigationItemSchema).max(12),
    socialLinks: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().trim().min(1).max(80),
          href: linkSchema,
        }),
      )
      .max(12),
    footerGroups: z.array(z.object({
      id: z.string().min(1),
      title: z.string().trim().min(1).max(80),
      links: z.array(navigationChildSchema).min(1).max(12),
    })).max(6).default([]),
    theme: themeSchema.default(defaultTheme),
    chrome: z.object({
      headerVariant: z.enum(marketingElementVariants.header),
      footerVariant: z.enum(marketingSectionVariants.footer),
      flyoutVariant: z.enum(marketingElementVariants["flyout-menu"]),
      notFoundVariant: z.enum(notFoundVariants),
      headerCta: z.object({ label: shortText, href: linkSchema }),
      banner: z.object({
        enabled: z.boolean(),
        variant: z.enum(marketingElementVariants.banner),
        message: z.string().trim().min(1).max(300),
        actionLabel: z.string().trim().max(80),
        actionHref: optionalLinkSchema,
        dismissible: z.boolean(),
      }),
    }).default(defaultSiteChrome),
    defaultSeo: z.object({
      titleTemplate: z.string().trim().min(1).max(120),
      description: z.string().trim().min(1).max(500),
      socialImageMediaId: z.union([z.literal(""), z.string().uuid()]).optional(),
    }),
    redirects: z
      .array(
        z.object({
          id: z.string().min(1),
          source: internalPathSchema,
          target: linkSchema,
          permanent: z.boolean(),
        }),
      )
      .max(100),
  })
  .superRefine((value, context) => {
    for (const [field, items] of [
      ["navigation", value.navigation],
      ["socialLinks", value.socialLinks],
      ["redirects", value.redirects],
      ["footerGroups", value.footerGroups],
    ] as const) {
      const ids = new Set<string>();
      items.forEach((item, index) => {
        if (ids.has(item.id)) {
          context.addIssue({
            code: "custom",
            message: "Item IDs must be unique.",
            path: [field, index, "id"],
          });
        }
        ids.add(item.id);
      });
    }
    const sources = new Set<string>();
    value.redirects.forEach((item, index) => {
      if (sources.has(item.source)) {
        context.addIssue({
          code: "custom",
          message: "Redirect sources must be unique.",
          path: ["redirects", index, "source"],
        });
      }
      if (item.source === item.target) {
        context.addIssue({
          code: "custom",
          message: "A redirect cannot point to itself.",
          path: ["redirects", index, "target"],
        });
      }
      sources.add(item.source);
    });
  });

export type SiteSettingsValue = z.infer<typeof siteSettingsValueSchema>;

export interface SiteSettingsRevision {
  id: string;
  siteId: string;
  sequence: number;
  value: SiteSettingsValue;
  createdAt: Date;
  createdBy: string;
  source: ActorSource;
}

export interface SiteSettingsRecord {
  siteId: string;
  updatedAt: Date;
  draftRevision: SiteSettingsRevision;
  publishedRevision: SiteSettingsRevision | null;
}

export interface SiteSettingsRepository {
  find(siteId: string): Promise<SiteSettingsRecord | null>;
  createDraft(input: { siteId: string; value: SiteSettingsValue; actor: Actor }): Promise<SiteSettingsRecord>;
  appendDraft(input: { siteId: string; expectedSequence: number; value: SiteSettingsValue; actor: Actor }): Promise<SiteSettingsRecord>;
  publish(input: { siteId: string; expectedSequence: number; actor: Actor }): Promise<SiteSettingsRecord>;
}

export class SiteSettingsService {
  constructor(private readonly repository: SiteSettingsRepository) {}

  async createDraft(input: { siteId: string; value: SiteSettingsValue; actor: Actor }) {
    return this.repository.createDraft({ ...input, value: siteSettingsValueSchema.parse(input.value) });
  }

  async updateDraft(input: { siteId: string; expectedSequence: number; value: SiteSettingsValue; actor: Actor }) {
    return this.repository.appendDraft({ ...input, value: siteSettingsValueSchema.parse(input.value) });
  }

  async publish(input: { siteId: string; expectedSequence: number; actor: Actor }) {
    return this.repository.publish(input);
  }
}

export interface BlockDefinition {
  type: BlockType;
  version: 1;
  label: string;
  description: string;
  variants?: readonly string[];
}

export const blockCatalog = [
  {
    type: "marketing.hero",
    version: 1,
    label: "Hero",
    description: "Primary page introduction with optional actions.",
    variants: marketingSectionVariants.hero,
  },
  {
    type: "content.rich-text",
    version: 1,
    label: "Rich text",
    description: "A readable heading and multi-paragraph text section.",
    variants: marketingSectionVariants.content,
  },
  {
    type: "marketing.feature-grid",
    version: 1,
    label: "Feature grid",
    description: "A heading with a structured list of capabilities or principles.",
    variants: marketingSectionVariants.features,
  },
  {
    type: "marketing.cta",
    version: 1,
    label: "Call to action",
    description: "A focused closing message and link.",
    variants: marketingSectionVariants.cta,
  },
  {
    type: "media.image",
    version: 1,
    label: "Image",
    description: "A reusable media asset with governed alternative text and presentation.",
  },
  {
    type: "marketing.stats",
    version: 1,
    label: "Statistics",
    description: "A concise set of outcomes or measurements with supporting context.",
    variants: marketingSectionVariants.stats,
  },
  {
    type: "marketing.testimonial",
    version: 1,
    label: "Testimonial",
    description: "A prominent attributed quotation with an optional portrait.",
    variants: marketingSectionVariants.testimonial,
  },
  {
    type: "marketing.logo-cloud",
    version: 1,
    label: "Logo cloud",
    description: "A governed collection of client, partner, or publication logos.",
    variants: marketingSectionVariants["logo-cloud"],
  },
  {
    type: "content.project-grid",
    version: 1,
    label: "Project grid",
    description: "A structured portfolio or case-study collection with optional imagery.",
  },
  {
    type: "content.contact",
    version: 1,
    label: "Contact details",
    description: "A direct contact section with validated email and optional location details.",
    variants: marketingSectionVariants.contact,
  },
  {
    type: "marketing.bento-grid",
    version: 1,
    label: "Bento grid",
    description: "A modular collection of visually weighted capabilities or stories.",
    variants: marketingSectionVariants["bento-grid"],
  },
  {
    type: "content.blog",
    version: 1,
    label: "Blog posts",
    description: "A curated list of articles with optional imagery and a featured post.",
    variants: marketingSectionVariants.blog,
  },
  {
    type: "marketing.faq",
    version: 1,
    label: "Frequently asked questions",
    description: "A structured question-and-answer collection.",
    variants: marketingSectionVariants.faq,
  },
  {
    type: "marketing.page-header",
    version: 1,
    label: "Page header",
    description: "An internal-page introduction with optional imagery, cards, or statistics.",
    variants: marketingSectionVariants["page-header"],
  },
  {
    type: "marketing.newsletter",
    version: 1,
    label: "Newsletter",
    description: "A governed newsletter call to action linking to a subscription destination.",
    variants: marketingSectionVariants.newsletter,
  },
  {
    type: "marketing.pricing",
    version: 1,
    label: "Pricing",
    description: "Structured pricing tiers, features, emphasis, and comparison treatments.",
    variants: marketingSectionVariants.pricing,
  },
  {
    type: "content.team",
    version: 1,
    label: "Team",
    description: "A structured collection of people, roles, biographies, and profiles.",
    variants: marketingSectionVariants.team,
  },
] as const satisfies readonly BlockDefinition[];

export function createBlock(type: BlockType, id: string): ContentBlock {
  switch (type) {
    case "marketing.hero":
      return {
        id,
        type,
        version: 1,
        data: {
          variant: "simple-centered",
          scheme: "default",
          eyebrow: "Introduction",
          heading: "A clear statement of value",
          body: "Explain what visitors should understand and why it matters.",
          primaryLabel: "",
          primaryHref: "",
          secondaryLabel: "",
          secondaryHref: "",
        },
      };
    case "content.rich-text":
      return {
        id,
        type,
        version: 1,
        data: {
          variant: "centered",
          scheme: "default",
          eyebrow: "",
          heading: "Section heading",
          body: "Add the section content here.",
        },
      };
    case "marketing.feature-grid":
      return {
        id,
        type,
        version: 1,
        data: {
          variant: "simple-three-column-with-small-icons",
          scheme: "default",
          eyebrow: "Highlights",
          heading: "What makes this different",
          intro: "",
          items: [
            {
              id: `${id}-item-1`,
              title: "First feature",
              body: "Describe the benefit in practical terms.",
            },
          ],
        },
      };
    case "marketing.cta":
      return {
        id,
        type,
        version: 1,
        data: {
          variant: "simple-centered",
          scheme: "dark",
          heading: "Ready to continue?",
          body: "Give visitors a clear next step.",
          buttonLabel: "Get in touch",
          buttonHref: "/contact",
        },
      };
    case "media.image":
      return {
        id,
        type,
        version: 1,
        data: {
          mediaId: "00000000-0000-4000-8000-000000000000",
          alt: "",
          caption: "",
          presentation: "wide",
        },
      };
    case "marketing.stats":
      return { id, type, version: 1, data: { variant: "simple-grid", scheme: "default", eyebrow: "By the numbers", heading: "Experience that creates momentum", intro: "Use a few meaningful figures to make the work concrete.", items: [{ id: `${id}-item-1`, value: "10+", label: "Years of experience" }, { id: `${id}-item-2`, value: "50", label: "Projects delivered" }] } };
    case "marketing.testimonial":
      return { id, type, version: 1, data: { variant: "simple-centered", scheme: "default", quote: "Add a concise, specific endorsement here.", author: "Client name", role: "Role and organisation", avatarMediaId: "" } };
    case "marketing.logo-cloud":
      return { id, type, version: 1, data: { variant: "simple-with-heading", scheme: "default", heading: "Trusted by teams at", logos: [{ id: `${id}-logo-1`, name: "Organisation", mediaId: "00000000-0000-4000-8000-000000000000", href: "" }] } };
    case "content.project-grid":
      return { id, type, version: 1, data: { eyebrow: "Selected work", heading: "Projects", intro: "A selection of recent work and its impact.", items: [{ id: `${id}-project-1`, title: "Project title", body: "Describe the challenge, contribution, and outcome.", href: "", imageMediaId: "" }] } };
    case "content.contact":
      return { id, type, version: 1, data: { variant: "centered", scheme: "default", eyebrow: "Contact", heading: "Let’s work together", body: "Share the best way for visitors to start a conversation.", email: "", phone: "", location: "" } };
    case "marketing.bento-grid":
      return { id, type, version: 1, data: { variant: "three-column", scheme: "muted", eyebrow: "Highlights", heading: "Everything works together", intro: "Combine related capabilities in a flexible visual grid.", items: [1, 2, 3].map((number) => ({ id: `${id}-item-${number}`, title: `Highlight ${number}`, body: "Explain the capability and its value.", href: "", imageMediaId: "" })) } };
    case "content.blog":
      return { id, type, version: 1, data: { variant: "three-column", scheme: "default", eyebrow: "From the journal", heading: "Latest writing", intro: "Share selected thinking, news, or resources.", posts: [1, 2, 3].map((number) => ({ id: `${id}-post-${number}`, title: `Article ${number}`, excerpt: "Summarize what readers will learn.", href: "/", publishedAt: "Recently", author: "Author", imageMediaId: "", featured: number === 1 })) } };
    case "marketing.faq":
      return { id, type, version: 1, data: { variant: "centered-accordion", scheme: "default", eyebrow: "Questions", heading: "Frequently asked questions", intro: "Answer the questions visitors ask most often.", items: [{ id: `${id}-item-1`, question: "What should visitors know?", answer: "Add a clear and useful answer here." }] } };
    case "marketing.page-header":
      return { id, type, version: 1, data: { variant: "simple-with-eyebrow", scheme: "dark", eyebrow: "Page introduction", heading: "A clear internal-page heading", body: "Orient visitors and explain what they will find on this page.", imageMediaId: "", items: [], stats: [] } };
    case "marketing.newsletter":
      return { id, type, version: 1, data: { variant: "simple-side-by-side", scheme: "brand", eyebrow: "Newsletter", heading: "Stay informed", body: "Invite visitors to subscribe using a trusted external destination.", buttonLabel: "Subscribe", buttonHref: "https://www.linkedin.com/", details: [] } };
    case "marketing.pricing":
      return { id, type, version: 1, data: { variant: "three-tiers", scheme: "default", eyebrow: "Pricing", heading: "Choose the right option", intro: "Describe how the options differ.", tiers: [1, 2, 3].map((number) => ({ id: `${id}-tier-${number}`, name: `Tier ${number}`, description: "A concise explanation of who this is for.", price: `$${number * 100}`, period: "per month", buttonLabel: "Get started", buttonHref: "/contact", emphasized: number === 2, features: ["First included feature", "Second included feature"] })) } };
    case "content.team":
      return { id, type, version: 1, data: { variant: "large-images", scheme: "default", eyebrow: "Team", heading: "Meet the team", intro: "Introduce the people behind the work.", people: [{ id: `${id}-person-1`, name: "Team member", role: "Role", bio: "Add a short biography.", imageMediaId: "", links: [] }] } };
  }
}

export interface PageRecipe {
  id: string;
  label: string;
  description: string;
  steps: readonly { type: BlockType; variant?: string; scheme?: "default" | "muted" | "brand" | "dark" | "image" }[];
}

export const pageRecipes = [
  { id: `about.${pageRecipeVariants.about[0]}`, label: "About — image tiles", description: "A visual company or personal introduction.", steps: [{ type: "marketing.page-header", variant: "with-cards", scheme: "dark" }, { type: "content.rich-text", variant: "with-image-tiles" }, { type: "content.team", variant: "large-images" }, { type: "marketing.cta", variant: "simple-centered-on-brand", scheme: "brand" }] },
  { id: `about.${pageRecipeVariants.about[1]}`, label: "About — timeline and stats", description: "A story supported by milestones and measurements.", steps: [{ type: "marketing.page-header", variant: "with-stats", scheme: "dark" }, { type: "content.rich-text", variant: "with-testimonial-and-stats" }, { type: "marketing.stats", variant: "timeline", scheme: "muted" }, { type: "content.team", variant: "grid-with-round-images" }] },
  { id: `about.${pageRecipeVariants.about[2]}`, label: "About — two-column description", description: "A restrained editorial about page.", steps: [{ type: "marketing.page-header", variant: "simple-with-eyebrow", scheme: "dark" }, { type: "content.rich-text", variant: "two-columns-with-screenshot" }, { type: "marketing.stats", variant: "two-column-description" }, { type: "marketing.testimonial", variant: "side-by-side", scheme: "muted" }] },
  { id: `landing.${pageRecipeVariants.landing[0]}`, label: "Landing — screenshots and stats", description: "A product-oriented landing composition.", steps: [{ type: "marketing.hero", variant: "split-with-screenshot", scheme: "default" }, { type: "marketing.logo-cloud", variant: "simple" }, { type: "marketing.feature-grid", variant: "with-product-screenshot" }, { type: "marketing.stats", variant: "simple-grid", scheme: "muted" }, { type: "marketing.cta", variant: "dark-panel-with-app-screenshot", scheme: "dark" }] },
  { id: `landing.${pageRecipeVariants.landing[1]}`, label: "Landing — screenshot and testimonial", description: "A focused landing page with social proof.", steps: [{ type: "marketing.hero", variant: "with-bordered-app-screenshot" }, { type: "marketing.feature-grid", variant: "with-large-screenshot" }, { type: "marketing.testimonial", variant: "with-large-avatar", scheme: "muted" }, { type: "marketing.cta", variant: "simple-centered-on-brand", scheme: "brand" }] },
  { id: `landing.${pageRecipeVariants.landing[2]}`, label: "Landing — image hero and pricing", description: "An image-led landing page with pricing.", steps: [{ type: "marketing.hero", variant: "simple-centered-with-background-image", scheme: "image" }, { type: "marketing.feature-grid", variant: "simple-three-column-with-large-icons" }, { type: "marketing.pricing", variant: "three-tiers-with-emphasized-tier" }, { type: "marketing.faq", variant: "centered-accordion", scheme: "muted" }] },
  { id: `landing.${pageRecipeVariants.landing[3]}`, label: "Landing — mobile screenshot and testimonials", description: "A mobile-product composition with a testimonial grid.", steps: [{ type: "marketing.hero", variant: "with-phone-mockup" }, { type: "marketing.feature-grid", variant: "with-product-screenshot-on-left" }, { type: "marketing.testimonial", variant: "subtle-grid", scheme: "muted" }, { type: "marketing.newsletter", variant: "centered-card", scheme: "brand" }] },
  { id: `pricing.${pageRecipeVariants.pricing[0]}`, label: "Pricing — four tiers", description: "A four-option pricing page.", steps: [{ type: "marketing.page-header", variant: "centered-with-eyebrow" }, { type: "marketing.pricing", variant: "four-tiers-with-toggle" }, { type: "marketing.faq", variant: "three-columns", scheme: "muted" }, { type: "marketing.cta", variant: "simple-centered-on-brand", scheme: "brand" }] },
  { id: `pricing.${pageRecipeVariants.pricing[1]}`, label: "Pricing — comparison table", description: "A detailed feature-comparison composition.", steps: [{ type: "marketing.page-header", variant: "centered" }, { type: "marketing.pricing", variant: "with-comparison-table" }, { type: "marketing.logo-cloud", variant: "simple-with-heading" }, { type: "marketing.faq", variant: "two-columns-with-centered-introduction" }] },
  { id: `pricing.${pageRecipeVariants.pricing[2]}`, label: "Pricing — tiers and testimonials", description: "Three tiers supported by customer evidence.", steps: [{ type: "marketing.page-header", variant: "simple-with-eyebrow" }, { type: "marketing.pricing", variant: "three-tiers" }, { type: "marketing.testimonial", variant: "grid", scheme: "muted" }, { type: "marketing.cta", variant: "simple-justified-on-subtle-brand", scheme: "brand" }] },
] as const satisfies readonly PageRecipe[];

export function createBlocksFromRecipe(recipeId: string, idFactory: () => string): ContentBlock[] {
  const recipe = pageRecipes.find((candidate) => candidate.id === recipeId);
  if (!recipe) throw new Error(`Unknown page recipe ${recipeId}.`);
  return recipe.steps.map((step) => {
    const block = createBlock(step.type, idFactory());
    if (!("variant" in block.data) || !step.variant) return block;
    return blockSchema.parse({
      ...block,
      data: { ...block.data, variant: step.variant, scheme: ("scheme" in step ? step.scheme : undefined) ?? block.data.scheme },
    });
  });
}

const mediaMetadataFields = {
    altText: z.string().trim().max(500),
    decorative: z.boolean(),
};

export const mediaMetadataSchema = z
  .object(mediaMetadataFields)
  .refine((value) => value.decorative || value.altText.length > 0, {
    message: "Alternative text is required unless the image is decorative.",
    path: ["altText"],
  });

export const mediaInputSchema = z
  .object({ filename: z.string().trim().min(1).max(255), ...mediaMetadataFields })
  .refine((value) => value.decorative || value.altText.length > 0, {
    message: "Alternative text is required unless the image is decorative.",
    path: ["altText"],
  });

export interface MediaAsset {
  id: string;
  siteId: string;
  filename: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/avif" | "image/gif";
  byteSize: number;
  width: number;
  height: number;
  checksum: string;
  altText: string;
  decorative: boolean;
  createdAt: Date;
  createdBy: string;
  source: ActorSource;
}

export type ActorSource = "admin" | "inline" | "mcp" | "script";
export interface Actor {
  id: string;
  source: ActorSource;
}

export interface PageRevision {
  id: string;
  pageId: string;
  sequence: number;
  schemaVersion: number;
  value: PageValue;
  createdAt: Date;
  createdBy: string;
  source: ActorSource;
}

export interface PageRecord {
  id: string;
  siteId: string;
  updatedAt: Date;
  draftRevision: PageRevision;
  publishedRevision: PageRevision | null;
}

export interface PublishedPage {
  id: string;
  siteId: string;
  revision: PageRevision;
}

export interface PageAuditEvent {
  id: string;
  action: string;
  actorId: string;
  source: ActorSource;
  revisionId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface PageRepository {
  list(siteId: string): Promise<PageRecord[]>;
  findById(pageId: string): Promise<PageRecord | null>;
  findPublishedBySlug(siteId: string, slug: string): Promise<PublishedPage | null>;
  listRevisions(pageId: string): Promise<PageRevision[]>;
  listAuditEvents(pageId: string): Promise<PageAuditEvent[]>;
  createDraft(input: {
    siteId: string;
    value: PageValue;
    actor: Actor;
  }): Promise<PageRecord>;
  appendDraft(input: {
    pageId: string;
    expectedSequence: number;
    value: PageValue;
    actor: Actor;
  }): Promise<PageRecord>;
  publish(input: {
    pageId: string;
    expectedSequence: number;
    actor: Actor;
  }): Promise<PageRecord>;
}

export class RevisionConflictError extends Error {
  constructor(public readonly currentSequence?: number) {
    super("The draft changed after it was loaded. Refresh and compare before saving again.");
    this.name = "RevisionConflictError";
  }
}

export class DuplicateSlugError extends Error {
  constructor(public readonly slug: string) {
    super(`Another page already uses the path ${slug}.`);
    this.name = "DuplicateSlugError";
  }
}

export class ContentService {
  constructor(private readonly repository: PageRepository) {}

  async createPageDraft(input: {
    siteId: string;
    value: PageValue;
    actor: Actor;
  }): Promise<PageRecord> {
    return this.repository.createDraft({
      ...input,
      value: pageValueSchema.parse(input.value),
    });
  }

  async updatePageDraft(input: {
    pageId: string;
    expectedSequence: number;
    value: PageValue;
    actor: Actor;
  }): Promise<PageRecord> {
    return this.repository.appendDraft({
      ...input,
      value: pageValueSchema.parse(input.value),
    });
  }

  async publishPage(input: {
    pageId: string;
    expectedSequence: number;
    actor: Actor;
  }): Promise<PageRecord> {
    return this.repository.publish(input);
  }
}
