"use client";

export interface PageTarget {
  id: string;
  title: string;
  href: string;
  published: boolean;
}

export function ContentLinkField({ label, value, pages, allowEmpty = false, onChange }: { label: string; value: string; pages: PageTarget[]; allowEmpty?: boolean; onChange: (value: string) => void }) {
  const known = pages.some((page) => page.href === value);
  return <div className="content-link-field">
    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}
      <select className="admin-control mt-2 w-full" aria-label={`${label} internal page`} value={known ? value : "custom"} onChange={(event) => { if (event.target.value !== "custom") onChange(event.target.value); }}>
        <option value="custom">Custom link…</option>
        {pages.map((page) => <option key={page.id} value={page.href}>{page.title} · {page.href}{page.published ? "" : " (draft)"}</option>)}
      </select>
    </label>
    <label className="mt-2 block text-xs font-medium text-gray-500 dark:text-gray-400">Destination
      <input className="admin-control mt-1 w-full font-mono text-xs" value={value} placeholder={allowEmpty ? "Optional" : "/page or https://…"} onChange={(event) => onChange(event.target.value)} />
    </label>
  </div>;
}
