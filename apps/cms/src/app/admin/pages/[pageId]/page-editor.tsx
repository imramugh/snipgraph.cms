"use client";

import { BlockComposer } from "@/components/editor/block-composer";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { ArrowTopRightOnSquareIcon, ClockIcon, InformationCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { pageValueSchema, type PageAuditEvent, type PageRecord, type PageRevision, type PageValue } from "@snipgraph/content-domain";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { PageTarget } from "@/components/admin/content-link-field";

export function PageEditor({ initialPage, initialRevisions, events, pageTargets }: { initialPage: PageRecord; initialRevisions: PageRevision[]; events: PageAuditEvent[]; pageTargets: PageTarget[] }) {
  const router = useRouter();
  const [page, setPage] = useState(initialPage);
  const [value, setValue] = useState<PageValue>(initialPage.draftRevision.value);
  const [message, setMessage] = useState("All changes saved");
  const [pending, setPending] = useState<"save" | "publish" | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const dirty = useMemo(() => JSON.stringify(value) !== JSON.stringify(page.draftRevision.value), [page.draftRevision.value, value]);
  const publishedCurrent = page.publishedRevision?.id === page.draftRevision.id;

  function change(next: PageValue) {
    setValue(next);
    setMessage("Unsaved changes");
    setIssues([]);
  }

  function field(name: "title" | "slug" | "description", next: string) {
    change({ ...value, [name]: next });
  }

  async function save() {
    const parsed = pageValueSchema.safeParse(value);
    if (!parsed.success) {
      setIssues(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`));
      setMessage("Fix the validation errors before saving");
      return;
    }
    setPending("save");
    setMessage("Saving…");
    const response = await fetch(`/api/pages/${page.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ expectedSequence: page.draftRevision.sequence, value: parsed.data }) });
    const result = await response.json();
    setPending(null);
    if (!response.ok) {
      setMessage(result.error ?? "Save failed");
      setIssues((result.issues ?? []).map((issue: { path?: string[]; message?: string }) => `${issue.path?.join(".") ?? "content"}: ${issue.message ?? "Invalid"}`));
      return;
    }
    setPage(result.page);
    setValue(result.page.draftRevision.value);
    setIssues([]);
    setMessage(`Draft revision ${result.page.draftRevision.sequence} saved`);
    router.refresh();
  }

  async function publish() {
    setPending("publish");
    setMessage("Publishing…");
    const response = await fetch(`/api/pages/${page.id}/publish`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ expectedSequence: page.draftRevision.sequence }) });
    const result = await response.json();
    setPending(null);
    if (!response.ok) return setMessage(result.error ?? "Publish failed");
    setPage(result.page);
    setMessage(`Revision ${result.page.publishedRevision.sequence} published`);
    router.refresh();
  }

  const inspector = (mobile = false) => <Inspector page={page} value={value} revisions={initialRevisions} events={events} onField={field} mobile={mobile} />;

  return <div>
    <header className="flex flex-col gap-5 border-b border-gray-200 pb-6 lg:flex-row lg:items-end lg:justify-between dark:border-white/10">
      <div className="min-w-0"><p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Page editor</p><h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">{value.title || "Untitled page"}</h1><p className="mt-2 text-sm text-gray-500 dark:text-gray-400" aria-live="polite">{message}</p></div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setInspectorOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-xs outline outline-black/5 hover:bg-gray-50 xl:hidden dark:bg-white/10 dark:text-gray-100 dark:-outline-offset-1 dark:outline-white/10 dark:hover:bg-white/15"><InformationCircleIcon aria-hidden="true" className="size-5" />Page details</button>
        <a className={`${dirty ? "pointer-events-none opacity-50" : ""} inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-xs outline outline-black/5 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-100 dark:-outline-offset-1 dark:outline-white/10 dark:hover:bg-white/15`} aria-disabled={dirty} href={dirty ? undefined : `/preview/${page.id}`} target="_blank">Preview<ArrowTopRightOnSquareIcon aria-hidden="true" className="size-4" /></a>
        <button className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-xs outline outline-black/5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/10 dark:text-gray-100 dark:-outline-offset-1 dark:outline-white/10 dark:hover:bg-white/15" disabled={!dirty || pending !== null} onClick={save}>{pending === "save" ? "Saving…" : "Save draft"}</button>
        <button className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400" disabled={dirty || publishedCurrent || pending !== null} onClick={publish}>{pending === "publish" ? "Publishing…" : "Publish"}</button>
      </div>
    </header>

    {issues.length > 0 && <section className="mt-6 rounded-md border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-400/10 dark:text-red-200" role="alert"><strong className="font-semibold">Content needs attention</strong><ul className="mt-2 list-disc space-y-1 pl-5">{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul></section>}

    <div className="mt-8 grid grid-cols-1 items-start gap-6 xl:grid-cols-[12rem_minmax(0,1fr)_24rem]">
      <BlockComposer blocks={value.blocks} pageTargets={pageTargets} onChange={(blocks) => change({ ...value, blocks })} />
      <aside className="sticky top-6 hidden max-h-[calc(100vh-7rem)] overflow-y-auto xl:block">{inspector()}</aside>
    </div>

    <Dialog open={inspectorOpen} onClose={setInspectorOpen} className="relative z-50 xl:hidden">
      <DialogBackdrop transition className="fixed inset-0 bg-gray-900/70 transition-opacity data-closed:opacity-0" />
      <div className="fixed inset-0 overflow-hidden"><div className="absolute inset-0 overflow-hidden"><div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10"><DialogPanel transition className="pointer-events-auto w-screen max-w-md transform bg-white shadow-xl transition duration-300 data-closed:translate-x-full dark:bg-gray-900"><div className="flex h-full flex-col"><div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-white/10"><DialogTitle className="font-semibold text-gray-900 dark:text-white">Page details and history</DialogTitle><button type="button" onClick={() => setInspectorOpen(false)} className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"><span className="sr-only">Close page details</span><XMarkIcon aria-hidden="true" className="size-6" /></button></div><div className="min-h-0 flex-1 overflow-y-auto p-5">{inspector(true)}</div></div></DialogPanel></div></div></div>
    </Dialog>
  </div>;
}

function Inspector({ page, value, revisions, events, onField, mobile = false }: { page: PageRecord; value: PageValue; revisions: PageRevision[]; events: PageAuditEvent[]; onField: (name: "title" | "slug" | "description", value: string) => void; mobile?: boolean }) {
  const inputClass = "mt-2 block w-full rounded-md bg-white px-3.5 py-2.5 text-sm/5 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-emerald-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-emerald-500";
  return <div className={`${mobile ? "" : "rounded-lg bg-white p-5 shadow-xs outline outline-black/5 dark:bg-gray-900 dark:-outline-offset-1 dark:outline-white/10"}`}>
    <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-gray-900 dark:text-white">Page details</h2><StateBadge published={Boolean(page.publishedRevision)} /></div>
    <div className="mt-5 grid gap-5"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title<input className={inputClass} value={value.title} onChange={(event) => onField("title", event.target.value)} /></label><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Path<input className={inputClass} value={value.slug} onChange={(event) => onField("slug", event.target.value)} /></label><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description<textarea className={inputClass} rows={4} value={value.description} onChange={(event) => onField("description", event.target.value)} /></label></div>
    <div className="mt-6 border-t border-gray-100 pt-5 dark:border-white/10"><div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"><ClockIcon aria-hidden="true" className="size-5 text-gray-400" />Revision timeline</div><ol className="mt-4 space-y-4">{revisions.map((revision) => { const event = events.find((candidate) => candidate.revisionId === revision.id); const state = page.draftRevision.id === revision.id && page.publishedRevision?.id === revision.id ? "Draft + live" : page.draftRevision.id === revision.id ? "Current draft" : page.publishedRevision?.id === revision.id ? "Published" : null; return <li className="relative border-l border-gray-200 pl-4 text-xs dark:border-white/15" key={revision.id}><span className="absolute -left-1 top-1 size-2 rounded-full bg-gray-300 ring-4 ring-white dark:bg-gray-600 dark:ring-gray-900" /><div className="flex items-start justify-between gap-2"><strong className="font-semibold text-gray-900 dark:text-white">Revision {revision.sequence}</strong>{state && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[.65rem] font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">{state}</span>}</div><p className="mt-1 text-gray-500 dark:text-gray-400">{new Date(revision.createdAt).toLocaleString()} · {revision.source}</p>{event && <code className="mt-1 block text-emerald-700 dark:text-emerald-400">{event.action}</code>}</li>; })}</ol></div>
  </div>;
}

function StateBadge({ published }: { published: boolean }) {
  return <span className={`${published ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"} rounded-md px-2 py-1 text-xs font-medium`}>{published ? "Published" : "Draft only"}</span>;
}
