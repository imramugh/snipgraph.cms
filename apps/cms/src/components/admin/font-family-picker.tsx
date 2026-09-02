"use client";

import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useMemo, useState } from "react";
import { reconcileFontWeights, type GoogleFontFamily, type GoogleFontWeight } from "@/lib/google-fonts";

export interface FontRoleValue {
  family: string;
  weights: GoogleFontWeight[];
}

function previewUrl(fonts: GoogleFontFamily[]) {
  const families = fonts.map((font) => `family=${encodeURIComponent(font.family).replace(/%20/g, "+")}:wght@${font.weights.includes(400) ? 400 : font.weights[0]}`);
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

export function FontFamilyPicker({ label, value, fonts, onChange }: {
  label: string;
  value: FontRoleValue;
  fonts: GoogleFontFamily[];
  onChange: (value: FontRoleValue) => void;
}) {
  const [query, setQuery] = useState("");
  const catalog = useMemo(() => fonts.some((font) => font.family === value.family) ? fonts : [
    { family: value.family, category: "Configured", weights: value.weights, popularity: -1 },
    ...fonts,
  ], [fonts, value.family, value.weights]);
  const selected = catalog.find((font) => font.family === value.family) ?? catalog[0];
  const matches = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return catalog.slice(0, 40);
    return catalog.filter((font) => `${font.family} ${font.category}`.toLocaleLowerCase().includes(normalized)).slice(0, 60);
  }, [catalog, query]);
  const previewFonts = useMemo(() => {
    const visible = [selected, ...matches].filter((font): font is GoogleFontFamily => Boolean(font));
    return visible.filter((font, index) => visible.findIndex((candidate) => candidate.family === font.family) === index).slice(0, 24);
  }, [matches, selected]);

  function select(font: GoogleFontFamily | null) {
    if (!font) return;
    onChange({ family: font.family, weights: reconcileFontWeights(value.weights, font.weights) });
    setQuery("");
  }

  function toggleWeight(weight: GoogleFontWeight, checked: boolean) {
    if (checked) {
      onChange({ ...value, weights: [...new Set([...value.weights, weight])].sort((left, right) => left - right) });
    } else if (value.weights.length > 1) {
      onChange({ ...value, weights: value.weights.filter((current) => current !== weight) });
    }
  }

  return <fieldset className="font-role-editor rounded-lg border border-gray-200 p-4 dark:border-white/10">
    <legend className="px-1 text-sm font-semibold text-gray-900 dark:text-white">{label}</legend>
    <link rel="stylesheet" href={previewUrl(previewFonts)} />
    <Combobox value={selected} onChange={select} by="family" onClose={() => setQuery("") }>
      <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Font family</label>
      <div className="relative mt-2">
        <MagnifyingGlassIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 z-10 size-5 -translate-y-1/2 text-gray-400" />
        <ComboboxInput
          aria-label={`${label} font family`}
          className="admin-control w-full pr-10 pl-10"
          displayValue={(font: GoogleFontFamily | null) => font?.family ?? ""}
          onChange={(event) => setQuery(event.target.value)}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <ChevronUpDownIcon aria-hidden="true" className="size-5" />
        </ComboboxButton>
        <ComboboxOptions transition anchor="bottom start" className="z-50 mt-2 max-h-80 w-[var(--input-width)] overflow-auto rounded-lg bg-white p-1 shadow-xl outline outline-black/10 transition data-closed:opacity-0 dark:bg-gray-800 dark:-outline-offset-1 dark:outline-white/10">
          {matches.length === 0 ? <div className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No matching Google Font</div> : matches.map((font) =>
            <ComboboxOption key={font.family} value={font} className="group flex cursor-default items-center gap-3 rounded-md px-3 py-2.5 text-gray-900 select-none data-focus:bg-emerald-50 data-focus:text-emerald-900 dark:text-white dark:data-focus:bg-emerald-400/10 dark:data-focus:text-emerald-200">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base" style={{ fontFamily: `'${font.family}', sans-serif` }}>{font.family}</span>
                <span className="mt-0.5 block text-xs text-gray-500 group-data-focus:text-emerald-700 dark:text-gray-400 dark:group-data-focus:text-emerald-300">{font.category} · {font.weights.length} weight{font.weights.length === 1 ? "" : "s"}</span>
              </span>
              <CheckIcon aria-hidden="true" className="invisible size-5 shrink-0 text-emerald-600 group-data-selected:visible dark:text-emerald-400" />
            </ComboboxOption>)}
        </ComboboxOptions>
      </div>
    </Combobox>
    <div className="mt-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide dark:text-gray-400">Available weights</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {selected?.weights.map((weight) => <label key={weight} className={`${value.weights.includes(weight) ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-400/10 dark:text-emerald-200" : "border-gray-200 bg-white text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"} cursor-pointer rounded-md border px-2.5 py-1.5 text-xs font-medium`}>
          <input className="sr-only" type="checkbox" checked={value.weights.includes(weight)} onChange={(event) => toggleWeight(weight, event.target.checked)} />
          <span style={{ fontFamily: `'${value.family}', sans-serif`, fontWeight: weight }}>{weight}</span>
        </label>)}
      </div>
      <p className="mt-3 text-lg text-gray-900 dark:text-white" style={{ fontFamily: `'${value.family}', sans-serif`, fontWeight: value.weights.includes(400) ? 400 : value.weights[0] }}>The quick brown fox jumps over the lazy dog.</p>
    </div>
  </fieldset>;
}
