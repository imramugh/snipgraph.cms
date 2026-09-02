"use client";

import {
  marketingElementVariants,
  marketingLabel,
  marketingSectionVariants,
  notFoundVariants,
  siteSettingsValueSchema,
  type SiteSettingsRecord,
  type SiteSettingsValue,
  type MediaAsset,
} from "@snipgraph/content-domain";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { googleFontsUrl } from "@/lib/theme";
import { FontFamilyPicker } from "@/components/admin/font-family-picker";
import { InlineMediaPicker } from "@/components/admin/inline-media-picker";
import { RichColorPicker } from "@/components/admin/rich-color-picker";
import type { GoogleFontFamily } from "@/lib/google-fonts";
import { ContentLinkField, type PageTarget } from "@/components/admin/content-link-field";

const settingsSections = ["Identity", "Typography", "Color palette", "Site chrome", "Default SEO", "Navigation", "Footer link groups", "Social profiles", "Redirects"];
const sectionId = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export function SettingsEditor({ initialSettings, initialMedia, fonts, pages }: { initialSettings: SiteSettingsRecord; initialMedia: MediaAsset[]; fonts: GoogleFontFamily[]; pages: PageTarget[] }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [value, setValue] = useState(initialSettings.draftRevision.value);
  const [message, setMessage] = useState("All changes saved");
  const [issues, setIssues] = useState<string[]>([]);
  const [pending, setPending] = useState<"save" | "publish" | null>(null);
  const dirty = useMemo(
    () => JSON.stringify(value) !== JSON.stringify(settings.draftRevision.value),
    [settings.draftRevision.value, value],
  );
  const publishedCurrent = settings.publishedRevision?.id === settings.draftRevision.id;

  function change(next: SiteSettingsValue) {
    setValue(next);
    setMessage("Unsaved changes");
    setIssues([]);
  }

  async function save() {
    const parsed = siteSettingsValueSchema.safeParse(value);
    if (!parsed.success) {
      setIssues(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`));
      setMessage("Fix the validation errors before saving");
      return;
    }
    setPending("save");
    setMessage("Saving…");
    const response = await fetch("/api/site-settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expectedSequence: settings.draftRevision.sequence, value: parsed.data }),
    });
    const result = await response.json();
    setPending(null);
    if (!response.ok) {
      setMessage(result.error ?? "Save failed");
      setIssues((result.issues ?? []).map((issue: { path?: string[]; message?: string }) => `${issue.path?.join(".") ?? "settings"}: ${issue.message ?? "Invalid"}`));
      return;
    }
    setSettings(result.settings);
    setValue(result.settings.draftRevision.value);
    setMessage(`Settings draft revision ${result.settings.draftRevision.sequence} saved`);
    router.refresh();
  }

  async function publish() {
    setPending("publish");
    setMessage("Publishing…");
    const response = await fetch("/api/site-settings/publish", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expectedSequence: settings.draftRevision.sequence }),
    });
    const result = await response.json();
    setPending(null);
    if (!response.ok) {
      setMessage(result.error ?? "Publish failed");
      return;
    }
    setSettings(result.settings);
    setMessage(`Settings revision ${result.settings.publishedRevision.sequence} published`);
    router.refresh();
  }

  const set = <K extends keyof SiteSettingsValue>(key: K, next: SiteSettingsValue[K]) =>
    change({ ...value, [key]: next });

  return (
    <section>
      <link rel="stylesheet" href={googleFontsUrl(value.theme)} />
      <header className="flex flex-col gap-5 border-b border-gray-200 pb-6 lg:flex-row lg:items-end lg:justify-between dark:border-white/10">
        <div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Site configuration</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">Site settings</h1>
          <p className="mt-2 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">Manage the shared shell and metadata as a safe, publishable revision.</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400" aria-live="polite">{message}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-xs outline outline-black/5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/10 dark:text-gray-100 dark:-outline-offset-1 dark:outline-white/10 dark:hover:bg-white/15" disabled={!dirty || pending !== null} onClick={save}>{pending === "save" ? "Saving…" : "Save draft"}</button>
          <button className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400" disabled={dirty || publishedCurrent || pending !== null} onClick={publish}>{pending === "publish" ? "Publishing…" : "Publish settings"}</button>
        </div>
      </header>

      {issues.length > 0 && <section className="mt-6 rounded-md border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-400/10 dark:text-red-200" role="alert"><strong className="font-semibold">Settings need attention</strong><ul className="mt-2 list-disc space-y-1 pl-5">{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul></section>}

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="sticky top-6 hidden lg:block"><ul className="space-y-1">{settingsSections.map((section) => <li key={section}><a href={`#${sectionId(section)}`} className="block rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200/70 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white">{section}</a></li>)}</ul></nav>
        <div className="settings-grid min-w-0">
        <SettingsSection title="Identity" description="Name and language used throughout the public site.">
          <TextField label="Site name" value={value.siteName} onChange={(next) => set("siteName", next)} />
          <TextArea label="Tagline" value={value.tagline} onChange={(next) => set("tagline", next)} />
          <TextArea label="Footer text" value={value.footerText} onChange={(next) => set("footerText", next)} />
          <InlineMediaPicker label="Logo (optional)" value={value.logoMediaId ?? ""} initialMedia={initialMedia} allowEmpty onSelect={(asset) => set("logoMediaId", asset.id)} onClear={() => set("logoMediaId", "")} />
        </SettingsSection>

        <SettingsSection title="Typography" description="Google Fonts applied consistently to semantic display, body, and code roles.">
          <FontFamilyPicker label="Display type" value={value.theme.fonts.display} fonts={fonts} onChange={(display) => set("theme", { ...value.theme, fonts: { ...value.theme.fonts, display } })} />
          <FontFamilyPicker label="Body type" value={value.theme.fonts.body} fonts={fonts} onChange={(body) => set("theme", { ...value.theme, fonts: { ...value.theme.fonts, body } })} />
          <FontFamilyPicker label="Monospace type" value={value.theme.fonts.mono} fonts={fonts} onChange={(mono) => set("theme", { ...value.theme, fonts: { ...value.theme.fonts, mono } })} />
          <div className="theme-type-sample" style={{ fontFamily: `'${value.theme.fonts.body.family}', sans-serif` }}><p>Body copy uses {value.theme.fonts.body.family}.</p><h3 style={{ fontFamily: `'${value.theme.fonts.display.family}', serif` }}>Display type uses {value.theme.fonts.display.family}.</h3><code style={{ fontFamily: `'${value.theme.fonts.mono.family}', monospace` }}>Monospace uses {value.theme.fonts.mono.family}.</code></div>
        </SettingsSection>

        <SettingsSection title="Color palette" description="Semantic colors generate the governed Default, Muted, Brand, Dark, and Image Overlay schemes.">
          <div className="palette-grid">{(Object.keys(value.theme.palette) as Array<keyof SiteSettingsValue["theme"]["palette"]>).map((role) => <RichColorPicker key={role} label={marketingLabel(role.replace(/([A-Z])/g, "-$1").toLowerCase())} value={value.theme.palette[role]} swatches={Object.values(value.theme.palette)} onChange={(color) => set("theme", { ...value.theme, palette: { ...value.theme.palette, [role]: color } })} />)}</div>
          <div className="scheme-preview"><div style={{ background: value.theme.palette.canvas, color: value.theme.palette.text }}>Default</div><div style={{ background: value.theme.palette.mutedSurface, color: value.theme.palette.text }}>Muted</div><div style={{ background: value.theme.palette.brand, color: value.theme.palette.brandContrast }}>Brand</div><div style={{ background: value.theme.palette.dark, color: value.theme.palette.darkContrast }}>Dark</div></div>
        </SettingsSection>

        <SettingsSection title="Site chrome" description="Choose governed variants for the persistent header, navigation flyouts, footer, announcements, and not-found screen.">
          <div className="field-pair"><SelectField label="Header variant" value={value.chrome.headerVariant} options={marketingElementVariants.header} onChange={(headerVariant) => set("chrome", { ...value.chrome, headerVariant: headerVariant as SiteSettingsValue["chrome"]["headerVariant"] })} /><SelectField label="Flyout variant" value={value.chrome.flyoutVariant} options={marketingElementVariants["flyout-menu"]} onChange={(flyoutVariant) => set("chrome", { ...value.chrome, flyoutVariant: flyoutVariant as SiteSettingsValue["chrome"]["flyoutVariant"] })} /></div>
          <div className="field-pair"><SelectField label="Footer variant" value={value.chrome.footerVariant} options={marketingSectionVariants.footer} onChange={(footerVariant) => set("chrome", { ...value.chrome, footerVariant: footerVariant as SiteSettingsValue["chrome"]["footerVariant"] })} /><SelectField label="Not-found variant" value={value.chrome.notFoundVariant} options={notFoundVariants} onChange={(notFoundVariant) => set("chrome", { ...value.chrome, notFoundVariant: notFoundVariant as SiteSettingsValue["chrome"]["notFoundVariant"] })} /></div>
          <div className="field-pair"><TextField label="Header CTA label" value={value.chrome.headerCta.label} onChange={(label) => set("chrome", { ...value.chrome, headerCta: { ...value.chrome.headerCta, label } })} /><ContentLinkField label="Header CTA link" value={value.chrome.headerCta.href} pages={pages} onChange={(href) => set("chrome", { ...value.chrome, headerCta: { ...value.chrome.headerCta, href } })} /></div>
          <fieldset><legend>Announcement banner</legend><label className="checkbox-field"><input type="checkbox" checked={value.chrome.banner.enabled} onChange={(event) => set("chrome", { ...value.chrome, banner: { ...value.chrome.banner, enabled: event.target.checked } })} />Show banner</label><SelectField label="Banner variant" value={value.chrome.banner.variant} options={marketingElementVariants.banner} onChange={(variant) => set("chrome", { ...value.chrome, banner: { ...value.chrome.banner, variant: variant as SiteSettingsValue["chrome"]["banner"]["variant"] } })} /><TextArea label="Message" value={value.chrome.banner.message} onChange={(message) => set("chrome", { ...value.chrome, banner: { ...value.chrome.banner, message } })} /><div className="field-pair"><TextField label="Action label" value={value.chrome.banner.actionLabel} onChange={(actionLabel) => set("chrome", { ...value.chrome, banner: { ...value.chrome.banner, actionLabel } })} /><ContentLinkField label="Action link" value={value.chrome.banner.actionHref ?? ""} pages={pages} allowEmpty onChange={(actionHref) => set("chrome", { ...value.chrome, banner: { ...value.chrome.banner, actionHref } })} /></div><label className="checkbox-field"><input type="checkbox" checked={value.chrome.banner.dismissible} onChange={(event) => set("chrome", { ...value.chrome, banner: { ...value.chrome.banner, dismissible: event.target.checked } })} />Visitors may dismiss it</label></fieldset>
        </SettingsSection>

        <SettingsSection title="Default SEO" description="Fallback metadata for pages and social previews.">
          <TextField label="Title template" hint="Use %s where the page title should appear." value={value.defaultSeo.titleTemplate} onChange={(next) => set("defaultSeo", { ...value.defaultSeo, titleTemplate: next })} />
          <TextArea label="Default description" value={value.defaultSeo.description} onChange={(next) => set("defaultSeo", { ...value.defaultSeo, description: next })} />
          <InlineMediaPicker label="Social preview image (optional)" value={value.defaultSeo.socialImageMediaId ?? ""} initialMedia={initialMedia} allowEmpty onSelect={(asset) => set("defaultSeo", { ...value.defaultSeo, socialImageMediaId: asset.id })} onClear={() => set("defaultSeo", { ...value.defaultSeo, socialImageMediaId: "" })} />
        </SettingsSection>

        <SettingsSection title="Navigation" description="Ordered links displayed in the public header.">
          <Repeater
            items={value.navigation}
            addLabel="Add navigation link"
            onAdd={() => set("navigation", [...value.navigation, { id: crypto.randomUUID(), label: "New link", href: "/" }])}
            onRemove={(id) => set("navigation", value.navigation.filter((item) => item.id !== id))}
            onMove={(id, direction) => set("navigation", moveItem(value.navigation, id, direction))}
            render={(item) => <><div className="field-pair"><TextField label="Label" value={item.label} onChange={(next) => set("navigation", value.navigation.map((candidate) => candidate.id === item.id ? { ...candidate, label: next } : candidate))} /><ContentLinkField label="Link" value={item.href} pages={pages} onChange={(next) => set("navigation", value.navigation.map((candidate) => candidate.id === item.id ? { ...candidate, href: next } : candidate))} /></div><TextField label="Description" value={item.description ?? ""} onChange={(description) => set("navigation", value.navigation.map((candidate) => candidate.id === item.id ? { ...candidate, description } : candidate))} /><div className="nested-links">{item.children?.map((child) => <div className="field-pair" key={child.id}><TextField label="Child label" value={child.label} onChange={(label) => set("navigation", value.navigation.map((candidate) => candidate.id === item.id ? { ...candidate, children: candidate.children?.map((current) => current.id === child.id ? { ...current, label } : current) } : candidate))} /><ContentLinkField label="Child link" value={child.href} pages={pages} onChange={(href) => set("navigation", value.navigation.map((candidate) => candidate.id === item.id ? { ...candidate, children: candidate.children?.map((current) => current.id === child.id ? { ...current, href } : current) } : candidate))} /><button className="text-button danger" type="button" onClick={() => set("navigation", value.navigation.map((candidate) => candidate.id === item.id ? { ...candidate, children: candidate.children?.filter((current) => current.id !== child.id) } : candidate))}>Remove child</button></div>)}<button className="text-button" type="button" onClick={() => set("navigation", value.navigation.map((candidate) => candidate.id === item.id ? { ...candidate, children: [...(candidate.children ?? []), { id: crypto.randomUUID(), label: "Child link", href: "/", description: "" }] } : candidate))}>Add flyout link</button></div></>}
          />
        </SettingsSection>

        <SettingsSection title="Footer link groups" description="Reusable navigation columns available to four-column footer variants.">
          <Repeater items={value.footerGroups} addLabel="Add footer group" onAdd={() => set("footerGroups", [...value.footerGroups, { id: crypto.randomUUID(), title: "Explore", links: [{ id: crypto.randomUUID(), label: "Home", href: "/", description: "" }] }])} onRemove={(id) => set("footerGroups", value.footerGroups.filter((item) => item.id !== id))} onMove={(id, direction) => set("footerGroups", moveItem(value.footerGroups, id, direction))} render={(group) => <><TextField label="Group heading" value={group.title} onChange={(title) => set("footerGroups", value.footerGroups.map((candidate) => candidate.id === group.id ? { ...candidate, title } : candidate))} />{group.links.map((link) => <div className="field-pair" key={link.id}><TextField label="Link label" value={link.label} onChange={(label) => set("footerGroups", value.footerGroups.map((candidate) => candidate.id === group.id ? { ...candidate, links: candidate.links.map((current) => current.id === link.id ? { ...current, label } : current) } : candidate))} /><ContentLinkField label="Link URL" value={link.href} pages={pages} onChange={(href) => set("footerGroups", value.footerGroups.map((candidate) => candidate.id === group.id ? { ...candidate, links: candidate.links.map((current) => current.id === link.id ? { ...current, href } : current) } : candidate))} /></div>)}<button type="button" className="text-button" onClick={() => set("footerGroups", value.footerGroups.map((candidate) => candidate.id === group.id ? { ...candidate, links: [...candidate.links, { id: crypto.randomUUID(), label: "New link", href: "/", description: "" }] } : candidate))}>Add footer link</button></>} />
        </SettingsSection>

        <SettingsSection title="Social profiles" description="External profiles displayed in the public footer.">
          <Repeater
            items={value.socialLinks}
            addLabel="Add social profile"
            onAdd={() => set("socialLinks", [...value.socialLinks, { id: crypto.randomUUID(), label: "LinkedIn", href: "https://linkedin.com/" }])}
            onRemove={(id) => set("socialLinks", value.socialLinks.filter((item) => item.id !== id))}
            onMove={(id, direction) => set("socialLinks", moveItem(value.socialLinks, id, direction))}
            render={(item) => <div className="field-pair"><TextField label="Label" value={item.label} onChange={(next) => set("socialLinks", value.socialLinks.map((candidate) => candidate.id === item.id ? { ...candidate, label: next } : candidate))} /><TextField label="URL" value={item.href} onChange={(next) => set("socialLinks", value.socialLinks.map((candidate) => candidate.id === item.id ? { ...candidate, href: next } : candidate))} /></div>}
          />
        </SettingsSection>

        <SettingsSection title="Redirects" description="Send retired internal paths to their current destination.">
          <Repeater
            items={value.redirects}
            addLabel="Add redirect"
            onAdd={() => set("redirects", [...value.redirects, { id: crypto.randomUUID(), source: "/old-path", target: "/", permanent: true }])}
            onRemove={(id) => set("redirects", value.redirects.filter((item) => item.id !== id))}
            onMove={(id, direction) => set("redirects", moveItem(value.redirects, id, direction))}
            render={(item) => <><div className="field-pair"><TextField label="From" value={item.source} onChange={(next) => set("redirects", value.redirects.map((candidate) => candidate.id === item.id ? { ...candidate, source: next } : candidate))} /><ContentLinkField label="To" value={item.target} pages={pages} onChange={(next) => set("redirects", value.redirects.map((candidate) => candidate.id === item.id ? { ...candidate, target: next } : candidate))} /></div><label className="checkbox-field"><input type="checkbox" checked={item.permanent} onChange={(event) => set("redirects", value.redirects.map((candidate) => candidate.id === item.id ? { ...candidate, permanent: event.target.checked } : candidate))} />Permanent redirect</label></>}
          />
        </SettingsSection>
        </div>
      </div>
    </section>
  );
}

function SettingsSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section id={sectionId(title)} className="settings-section scroll-mt-6 border-b border-gray-200 pb-10 dark:border-white/10"><header><h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2><p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">{description}</p></header><div className="admin-settings-panel grid min-w-0 gap-5 rounded-lg bg-white p-6 shadow-xs outline outline-black/5 dark:bg-gray-900 dark:-outline-offset-1 dark:outline-white/10">{children}</div></section>;
}

function TextField({ label, value, hint, onChange }: { label: string; value: string; hint?: string; onChange: (value: string) => void }) {
  return <label className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}<input className="admin-control mt-2 w-full" value={value} onChange={(event) => onChange(event.target.value)} />{hint && <small className="mt-1 block text-xs font-normal text-gray-500 dark:text-gray-400">{hint}</small>}</label>;
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}<textarea className="admin-control mt-2 w-full" rows={3} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <label className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}<select className="admin-control mt-2 w-full" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option value={option} key={option}>{marketingLabel(option)}</option>)}</select></label>;
}

function Repeater<T extends { id: string }>({ items, addLabel, onAdd, onRemove, onMove, render }: { items: T[]; addLabel: string; onAdd: () => void; onRemove: (id: string) => void; onMove: (id: string, direction: -1 | 1) => void; render: (item: T) => React.ReactNode }) {
  return <div className="settings-repeater">{items.map((item, index) => <fieldset key={item.id} className="rounded-md border border-gray-200 p-4 dark:border-white/10"><legend className="px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Item {index + 1}</legend><div className="repeater-order"><button className="text-button" disabled={index === 0} type="button" onClick={() => onMove(item.id, -1)}>Move up</button><button className="text-button" disabled={index === items.length - 1} type="button" onClick={() => onMove(item.id, 1)}>Move down</button></div>{render(item)}<button className="text-button danger" type="button" onClick={() => onRemove(item.id)}>Remove</button></fieldset>)}<button className="justify-self-start rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-xs outline outline-black/5 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-100 dark:-outline-offset-1 dark:outline-white/10" type="button" onClick={onAdd}>{addLabel}</button></div>;
}

function moveItem<T extends { id: string }>(items: T[], id: string, direction: -1 | 1) {
  const index = items.findIndex((item) => item.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
