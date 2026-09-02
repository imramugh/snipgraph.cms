import {
  blockCatalog,
  createBlock,
  type BlockType,
  type ContentBlock,
} from "@snipgraph/content-domain";
import { BlockRenderer } from "@/components/content/block-renderer";

export default async function ReferencePreviewPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const parameters = await searchParams;
  const requestedType = single(parameters.type);
  const definition = blockCatalog.find((entry) => entry.type === requestedType) ?? blockCatalog[0];
  const requestedVariant = single(parameters.variant);
  const variants = "variants" in definition ? definition.variants : undefined;
  const variant = variants?.includes(requestedVariant as never) ? requestedVariant : variants?.[0];
  const requestedScheme = single(parameters.scheme);
  const scheme = ["default", "muted", "brand", "dark", "image"].includes(requestedScheme) ? requestedScheme : "default";
  const block = specimen(definition.type, variant, scheme);

  return <main className="reference-preview-page site-shell"><BlockRenderer block={block} /></main>;
}

function specimen(type: BlockType, variant: string | undefined, scheme: string): ContentBlock {
  const block = createBlock(type, `reference-${type.replaceAll(".", "-")}`);
  const data = { ...block.data } as Record<string, unknown>;
  if ("variant" in data && variant) data.variant = variant;
  if ("scheme" in data) data.scheme = scheme;
  enrich(type, data);
  addReferenceMedia(data);
  return { ...block, data } as ContentBlock;
}

function enrich(type: BlockType, data: Record<string, unknown>) {
  if (type === "marketing.hero") Object.assign(data, { eyebrow: "Reference specimen", heading: "Make the value unmistakably clear", body: "A representative hero shows hierarchy, rhythm, responsive behavior, actions, and optional media before it becomes part of a page.", primaryLabel: "Primary action", primaryHref: "/reference", secondaryLabel: "Secondary action", secondaryHref: "/reference", code: "const patterns = catalog.select({ proven: true });" });
  if (type === "content.rich-text") Object.assign(data, { eyebrow: "Editorial content", heading: "Build confidence through clear explanation", body: "Strong content patterns establish a readable measure and a dependable hierarchy. They make long-form ideas feel considered rather than improvised.\n\nThe visual catalog lets the team inspect those decisions before choosing a pattern.", quote: "A pattern earns its place when it makes the next decision easier.", quoteAuthor: "Reference principle", stats: [{ id: "stat-1", value: "17", label: "Block families" }, { id: "stat-2", value: "179", label: "Catalog patterns" }] });
  if (type === "marketing.feature-grid") Object.assign(data, { intro: "Representative content makes layout differences visible.", items: [1, 2, 3, 4, 5, 6].map((number) => ({ id: `feature-${number}`, icon: `0${number}`, title: ["Governed", "Reusable", "Responsive", "Accessible", "Inspectable", "Proven"][number - 1], body: "A concise explanation demonstrates spacing and hierarchy in this variant." })), quote: "Design choices become infrastructure when they are visible and repeatable.", code: "pattern.use({ variant, content, constraints });" });
  if (type === "marketing.cta") Object.assign(data, { heading: "Ready to build from a proven pattern?", body: "Choose the variant that fits the job, then carry its constraints into the feature specification.", buttonLabel: "Use this pattern" });
  if (type === "media.image") Object.assign(data, { alt: "Abstract green reference composition", caption: "Representative wide media with an optional caption.", presentation: "wide" });
  if (type === "marketing.testimonial") Object.assign(data, { quote: "The visual reference removes ambiguity before implementation begins.", author: "Product collaborator", role: "Design and engineering", rating: 5 });
  if (type === "marketing.logo-cloud") Object.assign(data, { heading: "Used by teams that value consistency", body: "Representative organization marks", logos: ["North", "Field", "Arc", "Form", "Signal"].map((name, index) => ({ id: `logo-${index}`, name, mediaId: "reference-preview", href: "" })), actionLabel: "Read their stories", actionHref: "/reference" });
  if (type === "content.project-grid") Object.assign(data, { items: [1, 2, 3].map((number) => ({ id: `project-${number}`, title: `Selected project ${number}`, body: "A short case-study summary demonstrates image, copy, and action rhythm.", href: "/reference", imageMediaId: "reference-preview" })) });
  if (type === "content.contact") Object.assign(data, { email: "hello@example.com", phone: "+44 20 1234 5678", location: "London · Available worldwide", quote: "Start with the outcome you want to create.", quoteAuthor: "Contact principle" });
  if (type === "marketing.newsletter") Object.assign(data, { details: [{ id: "detail-1", title: "Monthly", body: "One useful update." }, { id: "detail-2", title: "Practical", body: "Patterns you can apply." }] });
  if (type === "content.team") Object.assign(data, { people: [1, 2, 3, 4].map((number) => ({ id: `person-${number}`, name: ["Amina Khan", "Jon Bell", "Maya Patel", "Theo Martin"][number - 1], role: ["Strategy", "Design", "Engineering", "Content"][number - 1], bio: "A concise biography shows the intended density of this treatment.", imageMediaId: "reference-preview", links: [{ id: `profile-${number}`, label: "Profile", href: "/reference" }] })) });
}

function addReferenceMedia(value: unknown) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) return value.forEach(addReferenceMedia);
  const record = value as Record<string, unknown>;
  for (const [key, child] of Object.entries(record)) {
    if (key === "mediaId" || key.endsWith("MediaId")) record[key] = "reference-preview";
    else addReferenceMedia(child);
  }
}

function single(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] ?? "" : value ?? ""; }
