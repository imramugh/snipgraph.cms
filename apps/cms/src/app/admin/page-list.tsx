"use client";

import type { PageRecord } from "@snipgraph/content-domain";
import { ChevronRightIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { DocumentPlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo, useState } from "react";

export function PageList({ pages }: { pages: PageRecord[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [sort, setSort] = useState<"updated-desc" | "updated-asc" | "title">("updated-desc");
  const filtered = useMemo(() => pages.filter((page) => {
    const matchesText = `${page.draftRevision.value.title} ${page.draftRevision.value.slug}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "all" || (status === "published" ? Boolean(page.publishedRevision) : !page.publishedRevision || page.publishedRevision.id !== page.draftRevision.id);
    return matchesText && matchesStatus;
  }).sort((left, right) => sort === "title"
    ? left.draftRevision.value.title.localeCompare(right.draftRevision.value.title)
    : (new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime()) * (sort === "updated-desc" ? -1 : 1)), [pages, query, sort, status]);

  return <>
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem_12rem]">
      <label><span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Search pages</span><span className="relative mt-2 block"><MagnifyingGlassIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-2.5 size-5 text-gray-400" /><input className="block w-full rounded-md bg-white py-2 pr-3 pl-10 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-emerald-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-emerald-500" type="search" placeholder="Title or path" value={query} onChange={(event) => setQuery(event.target.value)} /></span></label>
      <label><span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Status</span><select className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-emerald-600 dark:bg-gray-900 dark:text-white dark:outline-white/10" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="all">All</option><option value="published">Published</option><option value="draft">Draft changes</option></select></label>
      <label><span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Sort</span><select className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-emerald-600 dark:bg-gray-900 dark:text-white dark:outline-white/10" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="updated-desc">Newest updated</option><option value="updated-asc">Oldest updated</option><option value="title">Title</option></select></label>
    </div>
    {pages.length === 0 ? <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 px-6 py-14 text-center dark:border-white/15"><DocumentPlusIcon aria-hidden="true" className="mx-auto size-12 text-gray-400" /><h2 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">Create your first page</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Pages begin as drafts and stay private until you publish them.</p><Link className="mt-6 inline-flex rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-500" href="/admin/pages/new">New page</Link></div> : filtered.length === 0 ? <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 px-6 py-14 text-center dark:border-white/15"><h2 className="text-sm font-semibold text-gray-900 dark:text-white">No matching pages</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try a different search or status.</p></div> : <div className="mt-8 overflow-hidden rounded-lg bg-white shadow-xs outline outline-black/5 dark:bg-gray-900 dark:-outline-offset-1 dark:outline-white/10">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10" aria-label="Pages">
        <thead className="bg-gray-50 dark:bg-white/5"><tr><th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:px-6 dark:text-gray-400">Page</th><th scope="col" className="hidden px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:table-cell dark:text-gray-400">Status</th><th scope="col" className="hidden px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 md:table-cell dark:text-gray-400">Updated</th><th scope="col" className="relative py-3 pr-4 pl-3 sm:pr-6"><span className="sr-only">Open</span></th></tr></thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/10">
      {filtered.map((page) => {
        const hasDraftChanges = page.publishedRevision?.id !== page.draftRevision.id;
        const state = page.publishedRevision ? hasDraftChanges ? "Draft changes" : "Published" : "Draft only";
        return <tr className="group hover:bg-gray-50 dark:hover:bg-white/5" key={page.id}>
          <td className="w-full max-w-0 px-4 py-4 text-sm sm:px-6"><Link className="font-medium text-gray-900 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-300" href={`/admin/pages/${page.id}`}>{page.draftRevision.value.title}</Link><p className="mt-1 truncate text-gray-500 dark:text-gray-400">{page.draftRevision.value.slug}</p><dl className="mt-2 sm:hidden"><dt className="sr-only">Status</dt><dd><StateBadge state={state} /></dd><dt className="sr-only">Updated</dt><dd className="mt-1 text-xs text-gray-500 dark:text-gray-400">Updated {new Date(page.updatedAt).toLocaleDateString()}</dd></dl></td>
          <td className="relative hidden px-3 py-4 text-sm sm:table-cell"><StateBadge state={state} /></td>
          <td className="hidden px-3 py-4 text-sm text-gray-500 md:table-cell dark:text-gray-400"><time dateTime={String(page.updatedAt)}>{new Date(page.updatedAt).toLocaleDateString()}</time></td>
          <td className="relative py-4 pr-4 pl-3 text-right sm:pr-6"><ChevronRightIcon aria-hidden="true" className="ml-auto size-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" /></td>
        </tr>;
      })}
        </tbody>
      </table>
    </div>}
  </>;
}

function StateBadge({ state }: { state: string }) {
  const published = state === "Published";
  return <span className={`${published ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20" : "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20"} inline-flex rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset`}>{state}</span>;
}
