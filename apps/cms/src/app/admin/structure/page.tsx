import { pageRepository, siteSettingsRepository } from "@/lib/content";
import { defaultSite } from "@/lib/site";
import { analyzeSiteLinks } from "@/lib/site-links";
import { ArrowTopRightOnSquareIcon, ExclamationTriangleIcon, LinkIcon, Squares2X2Icon } from "@heroicons/react/20/solid";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Site structure — Snipgraph CMS", robots: { index: false } };

export default async function SiteStructurePage() {
  const currentSite = await defaultSite();
  const [pages, settings] = await Promise.all([pageRepository.list(currentSite.id), siteSettingsRepository.find(currentSite.id)]);
  if (!settings) throw new Error("Site settings have not been initialized");
  const graph = analyzeSiteLinks(pages, settings.draftRevision.value);
  const published = graph.nodes.filter((node) => node.published).length;
  const brokenGroups = Array.from(Map.groupBy(graph.broken, (reference) => reference.target));

  return <section>
    <header className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between dark:border-white/10">
      <div><p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Information architecture</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">Site structure</h1><p className="mt-2 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">See page layouts, navigation, and content relationships in one place.</p></div>
      <Link href="/admin/settings#navigation" className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500">Manage navigation</Link>
    </header>

    <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Metric label="Pages" value={graph.nodes.length} detail={`${published} published`} />
      <Metric label="Navigation items" value={settings.draftRevision.value.navigation.length} detail="Top-level links" />
      <Metric label="Broken links" value={graph.broken.length} detail={graph.broken.length ? "Needs attention" : "All internal targets resolve"} danger={graph.broken.length > 0} />
      <Metric label="Unlinked pages" value={graph.unlinked.length} detail="No inbound links" danger={graph.unlinked.length > 0} />
    </dl>

    <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="rounded-xl bg-white shadow-xs outline outline-black/5 dark:bg-gray-900 dark:-outline-offset-1 dark:outline-white/10">
        <header className="border-b border-gray-100 px-5 py-4 sm:px-6 dark:border-white/10"><h2 className="font-semibold text-gray-950 dark:text-white">Pages and layouts</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Blocks are shown in their rendered order.</p></header>
        {graph.nodes.length === 0 ? <p className="p-8 text-center text-sm text-gray-500">No pages have been created.</p> : <ul className="divide-y divide-gray-100 dark:divide-white/10">{graph.nodes.map((node) => <li key={node.id} className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-gray-950 dark:text-white">{node.title}</h3><StatusBadge published={node.published} draftChanges={node.draftChanges} />{node.inNavigation && <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20 ring-inset dark:bg-blue-400/10 dark:text-blue-300">In navigation</span>}</div><code className="mt-1 block text-xs text-gray-500 dark:text-gray-400">{node.href}</code></div>
            <div className="flex shrink-0 gap-3"><Link href={`/admin/pages/${node.id}`} className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-400">Edit layout</Link>{node.published && <a href={node.href} target="_blank" className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">View<ArrowTopRightOnSquareIcon className="size-4" /></a>}</div>
          </div>
          <ol className="mt-4 flex flex-wrap items-center gap-2" aria-label={`${node.title} block layout`}>{node.blockTypes.map((type, index) => <li key={`${type}-${index}`} className="flex items-center gap-2"><span className="rounded-md bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200">{type.replace(/^(marketing|content|media)\./, "")}</span>{index < node.blockTypes.length - 1 && <span className="text-gray-300 dark:text-gray-600">→</span>}</li>)}</ol>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{node.inboundLinks} inbound link{node.inboundLinks === 1 ? "" : "s"}{node.href !== "/" && node.inboundLinks === 0 ? " · This page is not linked from other content" : ""}</p>
        </li>)}</ul>}
      </section>

      <aside className="grid gap-6 xl:sticky xl:top-6">
        <section className="rounded-xl bg-white p-5 shadow-xs outline outline-black/5 dark:bg-gray-900 dark:-outline-offset-1 dark:outline-white/10"><div className="flex items-center gap-2"><Squares2X2Icon className="size-5 text-gray-400" /><h2 className="font-semibold text-gray-950 dark:text-white">Navigation draft</h2></div>{settings.draftRevision.value.navigation.length === 0 ? <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No navigation links yet.</p> : <ol className="mt-4 space-y-3">{settings.draftRevision.value.navigation.map((item) => <li key={item.id} className="text-sm"><div className="flex justify-between gap-3"><span className="font-medium text-gray-800 dark:text-gray-100">{item.label}</span><code className="text-xs text-gray-500">{item.href}</code></div>{item.children && item.children.length > 0 && <ul className="mt-2 space-y-1 border-l border-gray-200 pl-3 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">{item.children.map((child) => <li key={child.id}>{child.label} · {child.href}</li>)}</ul>}</li>)}</ol>}</section>
        <section className={`${graph.broken.length ? "border-amber-300 bg-amber-50 dark:border-amber-400/30 dark:bg-amber-400/10" : "border-emerald-200 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/10"} max-h-[38rem] overflow-y-auto rounded-xl border p-5`}><div className="flex items-center gap-2">{graph.broken.length ? <ExclamationTriangleIcon className="size-5 text-amber-600 dark:text-amber-400" /> : <LinkIcon className="size-5 text-emerald-600 dark:text-emerald-400" />}<h2 className="font-semibold text-gray-950 dark:text-white">Link health</h2></div>{graph.broken.length === 0 ? <p className="mt-3 text-sm text-emerald-800 dark:text-emerald-200">Every internal link in the current drafts resolves to a page or redirect.</p> : <><p className="mt-3 text-sm text-amber-800 dark:text-amber-200">{graph.broken.length} references point to {brokenGroups.length} missing destination{brokenGroups.length === 1 ? "" : "s"}.</p><ul className="mt-4 space-y-4">{brokenGroups.map(([target, references]) => <li key={target} className="text-sm"><strong className="block break-all text-amber-900 dark:text-amber-100">{target}</strong><span className="block text-xs text-amber-800 dark:text-amber-200">{references.length} reference{references.length === 1 ? "" : "s"}</span><ul className="mt-1 space-y-1 border-l border-amber-300 pl-2 dark:border-amber-400/30">{references.slice(0, 3).map((item, index) => <li key={`${item.sourceId}-${item.location}-${index}`} className="text-xs text-amber-700 dark:text-amber-300">{item.sourceLabel} · <code>{item.location}</code></li>)}</ul>{references.length > 3 && <span className="mt-1 block text-xs text-amber-700 dark:text-amber-300">+ {references.length - 3} more</span>}</li>)}</ul></>}</section>
      </aside>
    </div>
  </section>;
}

function Metric({ label, value, detail, danger = false }: { label: string; value: number; detail: string; danger?: boolean }) {
  return <div className="rounded-xl bg-white p-5 shadow-xs outline outline-black/5 dark:bg-gray-900 dark:-outline-offset-1 dark:outline-white/10"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt><dd className={`${danger ? "text-amber-600 dark:text-amber-400" : "text-gray-950 dark:text-white"} mt-2 text-3xl font-semibold tracking-tight`}>{value}</dd><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{detail}</p></div>;
}

function StatusBadge({ published, draftChanges }: { published: boolean; draftChanges: boolean }) {
  const label = !published ? "Draft only" : draftChanges ? "Draft changes" : "Published";
  return <span className={`${published && !draftChanges ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300" : "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300"} rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset`}>{label}</span>;
}
