import { pageRepository } from "@/lib/content";
import { defaultSite } from "@/lib/site";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/20/solid";
import { PageList } from "./page-list";

export const dynamic = "force-dynamic";
export const metadata = { title: "Content — Snipgraph CMS", robots: { index: false } };

export default async function AdminPage() {
  const currentSite = await defaultSite();
  const pages = await pageRepository.list(currentSite.id);

  return (
    <section>
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between dark:border-white/10">
        <div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Content</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">Pages</h1>
          <p className="mt-2 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">Draft safely, preview deliberately, and publish an immutable revision.</p>
        </div>
        <Link className="inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-400" href="/admin/pages/new"><PlusIcon aria-hidden="true" className="size-5" />New page</Link>
      </header>
      <div className="mt-8"><PageList pages={pages} /></div>
    </section>
  );
}
