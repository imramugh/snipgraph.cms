"use client";

import { createBlock, createBlocksFromRecipe, pageRecipes, pageValueSchema } from "@snipgraph/content-domain";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

export function NewPageForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [recipe, setRecipe] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  function suggestedSlug(nextTitle: string) {
    return `/${nextTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const blocks = recipe ? createBlocksFromRecipe(recipe, () => crypto.randomUUID()) : [createBlock("marketing.hero", crypto.randomUUID())];
    const value = { title, slug, description, blocks };
    const parsed = pageValueSchema.safeParse(value);
    if (!parsed.success) {
      setMessage(parsed.error.issues.map((issue) => issue.message).join(" "));
      return;
    }
    setPending(true);
    setMessage("Creating draft…");
    const response = await fetch("/api/pages", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(parsed.data) });
    const result = await response.json();
    if (!response.ok) {
      setPending(false);
      setMessage(result.error ?? "Page creation failed");
      return;
    }
    router.push(`/admin/pages/${result.page.id}`);
  }

  const inputClass = "mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-emerald-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-emerald-500";
  return <form onSubmit={submit}>
    <header className="border-b border-gray-200 pb-6 dark:border-white/10"><p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">New page</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">Create an unpublished draft</h1><p className="mt-2 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">Start from a governed page recipe or a single hero. Every generated block remains fully editable.</p></header>
    <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-3">
      <div><h2 className="text-base font-semibold text-gray-900 dark:text-white">Page identity</h2><p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">These details establish the route and initial structure. Nothing is published by this action.</p></div>
      <section className="grid gap-6 rounded-lg bg-white p-6 shadow-xs outline outline-black/5 lg:col-span-2 dark:bg-gray-900 dark:-outline-offset-1 dark:outline-white/10">
        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Title<input className={inputClass} autoFocus required value={title} onChange={(event) => { const next = event.target.value; if (!slug || slug === suggestedSlug(title)) setSlug(suggestedSlug(next)); setTitle(next); }} /></label>
        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Path<input className={inputClass} required placeholder="/about" value={slug} onChange={(event) => setSlug(event.target.value)} /></label>
        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Description<textarea className={inputClass} required rows={4} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <fieldset><legend className="text-sm font-medium text-gray-900 dark:text-gray-100">Starting recipe</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{[{ id: "", label: "Blank", description: "Begin with one hero block." }, ...pageRecipes].map((candidate) => <label key={candidate.id || "blank"} className={`${recipe === candidate.id ? "border-emerald-600 ring-1 ring-emerald-600 dark:border-emerald-400 dark:ring-emerald-400" : "border-gray-200 dark:border-white/10"} relative flex cursor-pointer gap-3 rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-white/5`}><input className="mt-1 size-4 accent-emerald-600" type="radio" name="recipe" value={candidate.id} checked={recipe === candidate.id} onChange={(event) => setRecipe(event.target.value)} /><span><span className="block text-sm font-semibold text-gray-900 dark:text-white">{candidate.label}</span><span className="mt-1 block text-xs/5 text-gray-500 dark:text-gray-400">{candidate.description}</span></span></label>)}</div></fieldset>
        {message && <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-400/10 dark:text-blue-300" role="status">{message}</div>}
        <div className="flex justify-end border-t border-gray-100 pt-5 dark:border-white/10"><button className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400" disabled={pending}><DocumentTextIcon aria-hidden="true" className="size-5" />{pending ? "Creating…" : "Create draft"}</button></div>
      </section>
    </div>
  </form>;
}
