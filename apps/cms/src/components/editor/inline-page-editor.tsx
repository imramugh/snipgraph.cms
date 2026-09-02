"use client";

import { BlockRenderer } from "@/components/content/block-renderer";
import { BlockFields } from "@/components/editor/block-fields";
import type { ContentBlock, PageRecord, PageValue, SiteSettingsValue } from "@snipgraph/content-domain";
import Link from "next/link";
import { useMemo, useState } from "react";

export function InlinePageEditor({ initialPage, settings }: { initialPage: PageRecord; settings: SiteSettingsValue }) {
  const [page, setPage] = useState(initialPage);
  const [value, setValue] = useState<PageValue>(initialPage.draftRevision.value);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("Draft loaded");
  const [pending, setPending] = useState<"save" | "publish" | null>(null);
  const selected = value.blocks.find((block) => block.id === selectedId) ?? null;
  const dirty = useMemo(() => JSON.stringify(value) !== JSON.stringify(page.draftRevision.value), [page.draftRevision.value, value]);
  const publishedCurrent = page.publishedRevision?.id === page.draftRevision.id;

  function updateBlock(block: ContentBlock) {
    setValue((current) => ({ ...current, blocks: current.blocks.map((candidate) => candidate.id === block.id ? block : candidate) }));
    setMessage("Unsaved inline changes");
  }

  async function save() {
    setPending("save");
    setMessage("Saving draft…");
    const response = await fetch(`/api/inline/pages/${page.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expectedSequence: page.draftRevision.sequence, value }),
    });
    const result = await response.json();
    setPending(null);
    if (!response.ok) {
      setMessage(result.error ?? "Save failed");
      return;
    }
    setPage(result.page);
    setValue(result.page.draftRevision.value);
    setMessage(`Draft revision ${result.page.draftRevision.sequence} saved`);
  }

  async function publish() {
    setPending("publish");
    setMessage("Publishing…");
    const response = await fetch(`/api/inline/pages/${page.id}/publish`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expectedSequence: page.draftRevision.sequence }),
    });
    const result = await response.json();
    setPending(null);
    if (!response.ok) {
      setMessage(result.error ?? "Publish failed");
      return;
    }
    setPage(result.page);
    setMessage(`Revision ${result.page.publishedRevision.sequence} published`);
  }

  return <div className={open ? "inline-workspace panel-open" : "inline-workspace"}>
    <div className="inline-toolbar">
      <div><strong>Inline editor</strong><span>{message}</span></div>
      <div>
        <Link className="button secondary" href={`/admin/pages/${page.id}`}>Full editor</Link>
        <button className="button secondary" disabled={!dirty || pending !== null} onClick={save}>{pending === "save" ? "Saving…" : "Save draft"}</button>
        <button className="button primary" disabled={dirty || publishedCurrent || pending !== null} onClick={publish}>{pending === "publish" ? "Publishing…" : "Publish"}</button>
      </div>
    </div>
    <main className="site-shell inline-canvas" data-cms-entry={page.id} data-cms-revision={page.draftRevision.id}>
      <nav className="topbar" aria-label="Primary navigation"><Link className="brand site-brand" href="/">{settings.logoMediaId && <img src={`/api/media/${settings.logoMediaId}`} alt="" />}{settings.siteName}</Link><div>{settings.navigation.map((item) => item.href.startsWith("/") ? <Link href={item.href} key={item.id}>{item.label}</Link> : <a href={item.href} key={item.id}>{item.label}</a>)}</div></nav>
      {value.blocks.map((block) => <div className={selectedId === block.id ? "editable-block is-selected" : "editable-block"} key={block.id}><BlockRenderer block={block} /><button className="edit-block-trigger" onClick={() => { setSelectedId(block.id); setOpen(true); }}>Edit {block.type}</button></div>)}
      <footer className="site-footer"><div><span className="brand">{settings.siteName}</span><p>{settings.footerText}</p></div><nav aria-label="Social profiles">{settings.socialLinks.map((item) => <a href={item.href} key={item.id} rel="me noreferrer">{item.label}</a>)}</nav></footer>
    </main>
    {open && selected && <aside className="inline-panel" aria-label="Edit selected block"><header><div><p className="eyebrow">Contextual editor</p><h2>{selected.type}</h2></div><button aria-label="Close editor" onClick={() => setOpen(false)}>×</button></header><div className="inline-panel-fields"><BlockFields block={selected} onChange={updateBlock} /></div></aside>}
  </div>;
}
