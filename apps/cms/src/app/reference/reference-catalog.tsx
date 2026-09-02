"use client";

import {
  ArrowLongRightIcon,
  ArrowsRightLeftIcon,
  Bars3BottomLeftIcon,
  CircleStackIcon,
  CodeBracketSquareIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  MagnifyingGlassIcon,
  PaintBrushIcon,
  RectangleGroupIcon,
  Squares2X2Icon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import { blockCatalog, marketingCatalogSummary } from "@snipgraph/content-domain";
import Link from "next/link";
import { useMemo, useState } from "react";

type CategoryId = "blocks" | "screens" | "flows" | "patterns";
type ViewportId = "desktop" | "tablet" | "mobile";
type CatalogItem = {
  id: string;
  label: string;
  description: string;
  category: CategoryId;
  blockType?: string;
  variants?: readonly string[];
};

const screens: CatalogItem[] = [
  ["screen.content-list.v1", "Content list", "Browse, search, filter, and open one content type."],
  ["screen.content-editor.v1", "Content editor", "Edit a versioned item in a three-pane authoring workspace."],
  ["screen.page-create.v1", "Page creation", "Create a valid unpublished page from a governed recipe."],
  ["screen.revision-history.v1", "Revision history", "Read immutable revision and publication evidence."],
  ["screen.site-settings.v1", "Site settings", "Manage the shared public shell as a publishable revision."],
  ["screen.media-library.v1", "Media library", "Upload, find, inspect, and reuse validated images."],
  ["screen.theme-settings.v1", "Theme settings", "Configure governed typography, palette, and chrome."],
  ["screen.reference-catalog.v1", "Reference catalog", "Discover and evaluate visual product patterns."],
].map(([id, label, description]) => ({ id, label, description, category: "screens" }));

const flows: CatalogItem[] = [
  ["flow.draft-publish.v1", "Draft and publish", "Move from a mutable draft to an immutable public revision."],
  ["flow.mcp-content-operation.v1", "MCP content operation", "Give agents the same authenticated and validated service path."],
  ["flow.uat-production-promotion.v1", "UAT to production", "Promote one verified image through recoverable environments."],
].map(([id, label, description]) => ({ id, label, description, category: "flows" }));

const patterns: CatalogItem[] = [
  ["pattern.admin-application-shell.v1", "Application shell", "A stacked workspace shell with responsive navigation."],
  ["pattern.block-composer.v1", "Block composer", "Compose a page from typed, reorderable blocks."],
  ["pattern.inline-editing.v1", "Inline editing", "Edit in context without obscuring the live page."],
  ["pattern.revision-conflict.v1", "Revision conflict", "Reject stale writes and offer a deliberate recovery path."],
  ["pattern.admin-typography.v1", "Admin typography", "A restrained hierarchy for operational interfaces."],
  ["pattern.media-picker.v1", "Media picker", "Choose accessible media without losing form state."],
  ["pattern.personal-site-blocks.v1", "Personal-site blocks", "Semantic building blocks for portfolio and personal sites."],
  ["pattern.exhaustive-marketing-catalog.v1", "Marketing catalog", "Every licensed pattern accounted for by product-owned IDs."],
  ["pattern.page-recipes.v1", "Page recipes", "Reusable compositions expanded into editable blocks."],
  ["pattern.site-chrome.v1", "Site chrome", "Governed persistent headers, banners, navigation, and footers."],
  ["pattern.governed-theme.v1", "Governed theme", "Accessible semantic typography and color tokens."],
].map(([id, label, description]) => ({ id, label, description, category: "patterns" }));

const blocks: CatalogItem[] = blockCatalog.map((block) => ({
  id: `${block.type}.v${block.version}`,
  label: block.label,
  description: block.description,
  category: "blocks",
  blockType: block.type,
  variants: "variants" in block ? block.variants : undefined,
}));

const categoryItems: Record<CategoryId, CatalogItem[]> = { blocks, screens, flows, patterns };
const categories: { id: CategoryId; label: string; icon: typeof Squares2X2Icon }[] = [
  { id: "blocks", label: "Blocks", icon: Squares2X2Icon },
  { id: "screens", label: "Screens", icon: ComputerDesktopIcon },
  { id: "flows", label: "Flows", icon: ArrowsRightLeftIcon },
  { id: "patterns", label: "Patterns", icon: RectangleGroupIcon },
];
const viewportWidths: Record<ViewportId, string> = { desktop: "100%", tablet: "768px", mobile: "390px" };

export function ReferenceCatalog() {
  const [category, setCategory] = useState<CategoryId>("blocks");
  const [selectedId, setSelectedId] = useState(blocks[0].id);
  const [query, setQuery] = useState("");
  const [variant, setVariant] = useState(blocks[0].variants?.[0] ?? "");
  const [scheme, setScheme] = useState("default");
  const [viewport, setViewport] = useState<ViewportId>("desktop");
  const items = categoryItems[category];
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? items.filter((item) => `${item.label} ${item.id} ${item.description}`.toLowerCase().includes(needle)) : items;
  }, [items, query]);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  function chooseCategory(next: CategoryId) {
    const first = categoryItems[next][0];
    setCategory(next);
    setSelectedId(first.id);
    setVariant(first.variants?.[0] ?? "");
    setQuery("");
  }

  function chooseItem(item: CatalogItem) {
    setSelectedId(item.id);
    setVariant(item.variants?.[0] ?? "");
    setScheme("default");
  }

  return <main className="visual-catalog">
    <header className="visual-catalog-header">
      <div className="visual-catalog-brand-row"><Link className="brand" href="/">Snipgraph CMS</Link><span>Reference framework</span></div>
      <div className="visual-catalog-intro"><div><p className="eyebrow">Visual reference catalog</p><h1>See the pattern before you use it.</h1><p>Browse real rendered blocks, screen structures, interaction patterns, and delivery flows. Stable IDs and notes are still here—now they support the visual rather than replacing it.</p></div><dl><div><dt>Block families</dt><dd>{blocks.length}</dd></div><div><dt>Visual variants</dt><dd>{marketingCatalogSummary.sections}</dd></div><div><dt>Total patterns</dt><dd>{marketingCatalogSummary.total}</dd></div></dl></div>
    </header>

    <nav className="visual-category-tabs" aria-label="Reference categories">
      {categories.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={category === id} onClick={() => chooseCategory(id)}><Icon aria-hidden="true" /><span><h2>{label}</h2><small>{categoryItems[id].length} specimens</small></span></button>)}
    </nav>

    <div className="visual-workbench">
      <aside className="visual-index" aria-label={`${categories.find((entry) => entry.id === category)?.label} index`}>
        <label><span>Find a specimen</span><span className="visual-search"><MagnifyingGlassIcon aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${category}`} /></span></label>
        <div className="visual-index-heading"><h2>{categories.find((entry) => entry.id === category)?.label}</h2><span>{filtered.length}</span></div>
        <div className="visual-index-list">
          {filtered.map((item) => <button key={item.id} type="button" aria-pressed={selected.id === item.id} onClick={() => chooseItem(item)}><span className="visual-index-glyph" aria-hidden="true">{item.label.slice(0, 1)}</span><span><strong>{item.label}</strong><small>{item.id}</small></span></button>)}
          {filtered.length === 0 && <p className="visual-empty">No specimens match “{query}”.</p>}
        </div>
      </aside>

      <section className="visual-stage" aria-labelledby="visual-stage-title">
        <header className="visual-stage-header"><div><p>{category.slice(0, -1)}</p><h2 id="visual-stage-title">{selected.label}</h2></div><code>{selected.id}</code></header>
        <div className="visual-toolbar">
          <div className="visual-toolbar-fields">
            {selected.category === "blocks" && selected.variants?.length ? <label><span>Variant</span><select aria-label="Preview variant" value={variant} onChange={(event) => setVariant(event.target.value)}>{selected.variants.map((item) => <option value={item} key={item}>{humanize(item)}</option>)}</select></label> : null}
            {selected.category === "blocks" && selected.blockType !== "media.image" ? <label><span>Surface</span><select aria-label="Preview surface" value={scheme} onChange={(event) => setScheme(event.target.value)}><option value="default">Default</option><option value="muted">Muted</option><option value="brand">Brand</option><option value="dark">Dark</option><option value="image">Image-led</option></select></label> : null}
          </div>
          <div className="visual-viewport-controls" aria-label="Preview width">{(["desktop", "tablet", "mobile"] as const).map((item) => { const Icon = item === "mobile" ? DevicePhoneMobileIcon : item === "tablet" ? RectangleGroupIcon : ComputerDesktopIcon; return <button type="button" key={item} aria-label={`${humanize(item)} preview`} aria-pressed={viewport === item} onClick={() => setViewport(item)}><Icon aria-hidden="true" /><span>{humanize(item)}</span></button>; })}</div>
        </div>

        <div className="visual-canvas" data-viewport={viewport}>
          <div className="visual-browser" style={{ width: viewportWidths[viewport] }}>
            <div className="visual-browser-bar" aria-hidden="true"><span /><span /><span /><p>{selected.id}</p></div>
            <div className="visual-specimen">
              {selected.category === "blocks" ? <iframe title={`${selected.label} — ${humanize(variant || "default")} preview`} src={`/reference/preview?type=${encodeURIComponent(selected.blockType!)}&variant=${encodeURIComponent(variant)}&scheme=${encodeURIComponent(scheme)}`} /> : null}
              {selected.category === "screens" ? <ScreenSpecimen id={selected.id} /> : null}
              {selected.category === "flows" ? <FlowSpecimen id={selected.id} /> : null}
              {selected.category === "patterns" ? <PatternSpecimen id={selected.id} /> : null}
            </div>
          </div>
        </div>

        <footer className="visual-stage-notes"><div><span>Use when</span><p>{selected.description}</p></div><div><span>Coverage</span><p>{selected.variants?.length ? `${selected.variants.length} selectable visual variants` : "One governed visual specimen"}</p></div><div><span>Reference ID</span><code>{selected.id}</code></div></footer>
      </section>
    </div>
  </main>;
}

function ScreenSpecimen({ id }: { id: string }) {
  const kind = id.split(".")[1];
  if (kind === "content-list") return <div className="screen-miniature"><MiniTop title="Pages" action="New page" /><div className="mini-filters"><i /><i /><i /></div><div className="mini-table"><b /><span /><span /><span /><span /></div></div>;
  if (kind === "content-editor") return <div className="screen-miniature"><MiniTop title="Page editor" action="Publish" /><div className="mini-three-pane"><div><b /><i /><i /><i /></div><div><b /><span /><span /><span /><span /></div><div><b /><i /><i /><em /></div></div></div>;
  if (kind === "page-create") return <div className="screen-miniature"><MiniTop title="Create an unpublished draft" action="Create draft" /><div className="mini-split"><div><b /><span /><span /><span /></div><div><b /><i /><i /><i /></div></div></div>;
  if (kind === "revision-history") return <div className="screen-miniature"><MiniTop title="Revision timeline" action="Current" /><div className="mini-timeline"><span /><div><b>Revision 4</b><i /></div><span /><div><b>Revision 3</b><i /></div><span /><div><b>Revision 2</b><i /></div></div></div>;
  if (kind === "media-library") return <div className="screen-miniature"><MiniTop title="Media" action="Upload" /><div className="mini-upload"><i /><i /><b /></div><div className="mini-media-grid">{Array.from({ length: 8 }, (_, index) => <span key={index} />)}</div></div>;
  if (kind === "reference-catalog") return <div className="screen-miniature"><MiniTop title="Visual catalog" action="17 blocks" /><div className="mini-catalog"><div><i /><i /><i /><i /></div><div><b /><span /><span /></div></div></div>;
  return <div className="screen-miniature"><MiniTop title={kind === "theme-settings" ? "Typography and color" : "Site settings"} action="Publish settings" /><div className="mini-settings"><div><i /><i /><i /><i /><i /></div><div><b /><span /><span /><span /></div><div><b /><span /><span /></div></div></div>;
}

function MiniTop({ title, action }: { title: string; action: string }) { return <header className="mini-top"><div><i /><b>{title}</b></div><span>{action}</span></header>; }

function FlowSpecimen({ id }: { id: string }) {
  const steps = id.includes("draft-publish") ? ["Draft", "Validate", "Preview", "Publish", "Live revision"] : id.includes("mcp") ? ["Agent", "OAuth scopes", "CMS service", "Draft revision", "Explicit publish"] : ["Build once", "UAT", "Automated checks", "Exact image", "Production"];
  return <div className="flow-specimen"><div className="flow-track">{steps.map((step, index) => <div className="flow-step" key={step}><span>{index + 1}</span><strong>{step}</strong>{index < steps.length - 1 && <ArrowLongRightIcon aria-hidden="true" />}</div>)}</div><div className="flow-guardrail"><CircleStackIcon aria-hidden="true" /><p>{id.includes("draft-publish") ? "Publication never mutates the draft in place." : id.includes("mcp") ? "Agents and humans share authorization, validation, revisions, and audit." : "UAT and production run the identical verified image."}</p></div></div>;
}

function PatternSpecimen({ id }: { id: string }) {
  if (id.includes("typography")) return <div className="pattern-type"><p>Display / 32 / semibold</p><strong>A clear operational hierarchy</strong><h3>Section heading remains easy to scan</h3><span>Body copy uses regular weight for sustained reading.</span><small>LABEL · MEDIUM · 12</small><code>content.revision.v3</code></div>;
  if (id.includes("theme")) return <div className="pattern-theme"><div><SwatchIcon aria-hidden="true" /><strong>Semantic palette</strong></div><section><i /><i /><i /><i /><i /></section><div className="pattern-theme-type"><b>Aa</b><span>Display and body roles</span></div></div>;
  if (id.includes("conflict")) return <div className="pattern-conflict"><div><CodeBracketSquareIcon aria-hidden="true" /><strong>Revision 7</strong></div><ArrowLongRightIcon /><div className="conflict-branches"><span>Save revision 8</span><span>409 · Review changes</span></div></div>;
  if (id.includes("inline-editing")) return <div className="pattern-inline"><div className="pattern-page"><i /><b>Live page section</b><span>Editable content remains in context.</span><button type="button">Edit</button></div><aside><strong>Edit selected block</strong><i /><i /><i /><button type="button">Save draft</button></aside></div>;
  if (id.includes("media-picker")) return <div className="pattern-picker"><div>{Array.from({ length: 6 }, (_, index) => <span className={index === 1 ? "selected" : ""} key={index} />)}</div><aside><strong>Selected asset</strong><i /><p>Accessible description</p><button type="button">Use image</button></aside></div>;
  if (id.includes("page-recipes")) return <div className="pattern-recipe"><b>Landing page recipe</b><span>Hero</span><ArrowLongRightIcon /><span>Features</span><ArrowLongRightIcon /><span>Evidence</span><ArrowLongRightIcon /><span>CTA</span></div>;
  if (id.includes("site-chrome")) return <div className="pattern-chrome"><header><b>Brand</b><span>Work&nbsp;&nbsp; About&nbsp;&nbsp; Contact</span></header><main><i /><i /><i /></main><footer><b>Brand</b><span>Navigation groups</span></footer></div>;
  if (id.includes("marketing-catalog")) return <div className="pattern-matrix"><div><strong>Family</strong><strong>Variant</strong><strong>Role</strong></div>{["Hero", "Features", "Pricing", "Footer", "404"].map((item, index) => <div key={item}><span>{item}</span><i /><em>{index < 3 ? "Block" : index === 3 ? "Chrome" : "System"}</em></div>)}</div>;
  if (id.includes("application-shell")) return <div className="pattern-shell"><header><b>S</b><span>Content&nbsp;&nbsp; Media&nbsp;&nbsp; Settings</span><i /></header><main><div /><section><b>Workspace content</b><span /><span /><span /></section><aside /></main></div>;
  return <div className="pattern-composer"><aside><Bars3BottomLeftIcon aria-hidden="true" /><b>Block outline</b><i /><i /><i /></aside><main><PaintBrushIcon aria-hidden="true" /><b>Selected block</b><span /><span /><span /><button type="button">Save draft</button></main></div>;
}

function humanize(value: string) { return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
