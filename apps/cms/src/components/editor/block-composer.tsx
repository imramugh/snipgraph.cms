"use client";

import {
  blockCatalog,
  createBlock,
  type BlockType,
  type ContentBlock,
} from "@snipgraph/content-domain";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { Bars3BottomLeftIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { BlockFields } from "./block-fields";
import type { PageTarget } from "@/components/admin/content-link-field";

export function BlockComposer({
  blocks,
  pageTargets,
  onChange,
}: {
  blocks: ContentBlock[];
  pageTargets: PageTarget[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const [selectedId, setSelectedId] = useState(blocks[0]?.id ?? "");
  const [newType, setNewType] = useState<BlockType>("content.rich-text");
  const [outlineOpen, setOutlineOpen] = useState(false);
  const selected = blocks.find((block) => block.id === selectedId) ?? blocks[0];

  function replace(block: ContentBlock) {
    onChange(blocks.map((candidate) => candidate.id === block.id ? block : candidate));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function add() {
    const block = createBlock(newType, crypto.randomUUID());
    onChange([...blocks, block]);
    setSelectedId(block.id);
  }

  function remove(id: string) {
    if (blocks.length === 1) return;
    const index = blocks.findIndex((block) => block.id === id);
    const next = blocks.filter((block) => block.id !== id);
    onChange(next);
    setSelectedId(next[Math.max(0, index - 1)]?.id ?? "");
  }

  function outline(mobile = false) {
    const addControls = <div className="add-block"><select aria-label="Block type" value={newType} onChange={(event) => setNewType(event.target.value as BlockType)}>{blockCatalog.map((entry) => <option value={entry.type} key={entry.type}>{entry.label}</option>)}</select><button className="button secondary" type="button" onClick={() => { add(); if (mobile) setOutlineOpen(false); }}>Add block</button></div>;
    return <section className={`${mobile ? "w-full min-w-0 border-0 shadow-none !gap-4 !p-0" : "sticky top-6 max-h-[calc(100vh-7rem)] overflow-y-auto max-xl:!hidden xl:!grid"} editor-card block-outline`}>
        <div className="card-heading"><div><p className="eyebrow">Page structure</p><h2>Blocks</h2></div><span>{blocks.length}</span></div>
        {mobile && addControls}
        <ol>
          {blocks.map((block, index) => {
            const definition = blockCatalog.find((entry) => entry.type === block.type);
            return <li className={block.id === selected?.id ? "selected" : ""} key={block.id}>
              <button type="button" className="block-select" onClick={() => { setSelectedId(block.id); if (mobile) setOutlineOpen(false); }}><strong>{definition?.label ?? block.type}</strong><small>{block.type}.v{block.version}</small></button>
              <div className="block-order">
                <button type="button" aria-label="Move block up" disabled={index === 0} onClick={() => move(index, -1)}>↑</button>
                <button type="button" aria-label="Move block down" disabled={index === blocks.length - 1} onClick={() => move(index, 1)}>↓</button>
                <button type="button" aria-label="Remove block" disabled={blocks.length === 1} onClick={() => remove(block.id)}>×</button>
              </div>
            </li>;
          })}
        </ol>
        {!mobile && addControls}
      </section>;
  }

  return (
    <div className="contents">
      <button type="button" onClick={() => setOutlineOpen(true)} className="mb-4 inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-xs outline outline-black/5 hover:bg-gray-50 xl:hidden dark:bg-white/10 dark:text-gray-100 dark:-outline-offset-1 dark:outline-white/10 dark:hover:bg-white/15"><Bars3BottomLeftIcon aria-hidden="true" className="size-5" />Open block outline</button>
      <Dialog open={outlineOpen} onClose={setOutlineOpen} className="relative z-50 xl:hidden">
        <DialogBackdrop transition className="fixed inset-0 bg-gray-900/70 transition-opacity data-closed:opacity-0" />
        <div className="fixed inset-0 overflow-hidden"><div className="absolute inset-0 overflow-hidden"><div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-12"><DialogPanel transition className="pointer-events-auto w-screen max-w-sm transform bg-white shadow-xl transition duration-300 data-closed:-translate-x-full dark:bg-gray-900"><div className="flex h-full flex-col"><div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-white/10"><DialogTitle className="font-semibold text-gray-900 dark:text-white">Page structure</DialogTitle><button type="button" onClick={() => setOutlineOpen(false)} className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"><span className="sr-only">Close block outline</span><XMarkIcon aria-hidden="true" className="size-6" /></button></div><div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4">{outline(true)}</div></div></DialogPanel></div></div></div>
      </Dialog>
      {outline()}
      {selected && <section className="editor-card selected-block min-w-0"><div className="block-label"><span>Edit block</span><code>{selected.type}.v{selected.version}</code></div><BlockFields block={selected} pageTargets={pageTargets} onChange={replace} /></section>}
    </div>
  );
}
