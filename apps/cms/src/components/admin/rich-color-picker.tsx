"use client";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";

const defaultSwatches = ["#FFFFFF", "#F7F3EA", "#DFE4E8", "#14181F", "#56606B", "#1F2A3D", "#AD6843", "#059669", "#DC2626", "#2563EB"];

export function RichColorPicker({ label, value, onChange, swatches = defaultSwatches }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  swatches?: string[];
}) {
  const openingColor = useRef(value);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  function update(next: string) {
    const normalized = next.toUpperCase();
    setDraft(normalized);
    if (/^#[0-9A-F]{6}$/.test(normalized)) onChange(normalized);
  }

  return <div className="color-field">
    <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
    <Popover className="relative mt-2">
      {({ open }) => <>
        <PopoverButton onClick={() => { if (!open) openingColor.current = value; }} className="admin-control flex w-full items-center gap-3 text-left">
          <span aria-hidden="true" className="size-7 shrink-0 rounded-md shadow-inner ring-1 ring-black/10" style={{ backgroundColor: value }} />
          <code className="min-w-0 flex-1 text-sm text-gray-800 dark:text-gray-100">{value}</code>
          <ChevronDownIcon aria-hidden="true" className="size-5 text-gray-400" />
        </PopoverButton>
        <PopoverPanel transition anchor="bottom start" className="z-50 mt-2 w-80 origin-top-left rounded-xl bg-white p-4 shadow-2xl outline outline-black/10 transition data-closed:scale-95 data-closed:opacity-0 dark:bg-gray-800 dark:-outline-offset-1 dark:outline-white/10">
          <HexColorPicker color={value} onChange={update} className="!h-52 !w-full" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div><span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Previous</span><span className="mt-1 block h-9 rounded-md ring-1 ring-black/10" style={{ backgroundColor: openingColor.current }} /></div>
            <div><span className="block text-xs font-medium text-gray-500 dark:text-gray-400">Current</span><span className="mt-1 block h-9 rounded-md ring-1 ring-black/10" style={{ backgroundColor: value }} /></div>
          </div>
          <label className="mt-4 block text-xs font-medium text-gray-600 dark:text-gray-300">Hexadecimal
            <HexColorInput prefixed color={draft} onChange={update} className="admin-control mt-1 w-full font-mono uppercase" aria-label={`${label} hexadecimal value`} />
          </label>
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Theme swatches</p>
            <div className="mt-2 grid grid-cols-10 gap-1.5">
              {[...new Set([value, ...swatches])].slice(0, 10).map((swatch) => <button key={swatch} type="button" onClick={() => update(swatch)} aria-label={`Use ${swatch}`} className="relative aspect-square rounded-md shadow-sm ring-1 ring-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600" style={{ backgroundColor: swatch }}>{swatch.toUpperCase() === value.toUpperCase() && <CheckIcon aria-hidden="true" className="absolute inset-0 m-auto size-4 text-white drop-shadow-[0_1px_1px_rgb(0_0_0/.8)]" />}</button>)}
            </div>
          </div>
        </PopoverPanel>
      </>}
    </Popover>
  </div>;
}
