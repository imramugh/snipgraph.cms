"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { ArrowUpTrayIcon, CheckCircleIcon, MagnifyingGlassIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/20/solid";
import type { MediaAsset } from "@snipgraph/content-domain";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cropImage } from "@/lib/crop-image";

const acceptedImages = "image/jpeg,image/png,image/webp,image/avif,image/gif";
const ratios = [
  { label: "Original", value: "original" },
  { label: "Square · 1:1", value: "1" },
  { label: "Landscape · 16:9", value: String(16 / 9) },
  { label: "Photo · 4:3", value: String(4 / 3) },
  { label: "Portrait · 4:5", value: String(4 / 5) },
] as const;

export function InlineMediaPicker({ label, value, initialMedia = [], allowEmpty = false, onSelect, onClear }: {
  label: string;
  value: string;
  initialMedia?: MediaAsset[];
  allowEmpty?: boolean;
  onSelect: (asset: MediaAsset) => void;
  onClear?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState(initialMedia);
  const selected = media.find((asset) => asset.id === value) ?? initialMedia.find((asset) => asset.id === value);

  useEffect(() => {
    if (initialMedia.length > 0) return;
    let active = true;
    fetch("/api/media").then(async (response) => {
      const result = await response.json();
      if (response.ok && active) setMedia(result.media);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [initialMedia.length]);

  return <div className="inline-media-field">
    <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
    {selected ? <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5">
      <img src={`/api/media/${selected.id}`} alt="" className="aspect-video w-full bg-gray-100 object-contain dark:bg-gray-950" />
      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        <span className="min-w-0"><strong className="block truncate text-sm font-medium text-gray-900 dark:text-white">{selected.filename}</strong><span className="block text-xs text-gray-500 dark:text-gray-400">{selected.width} × {selected.height}{selected.altText ? ` · ${selected.altText}` : " · Decorative"}</span></span>
        <button type="button" className="shrink-0 text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-400" onClick={() => setOpen(true)}>Replace</button>
      </div>
    </div> : <button type="button" onClick={() => setOpen(true)} className="mt-2 flex min-h-28 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-4 text-center hover:border-emerald-500 hover:bg-emerald-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-white/15 dark:bg-white/[.03] dark:hover:border-emerald-400 dark:hover:bg-emerald-400/5">
      <PhotoIcon aria-hidden="true" className="size-7 text-gray-400" /><span className="mt-2 text-sm font-semibold text-gray-800 dark:text-gray-100">Choose or upload image</span><span className="mt-1 text-xs text-gray-500 dark:text-gray-400">Preview and crop without leaving this page</span>
    </button>}
    {allowEmpty && value && onClear && <button type="button" onClick={onClear} className="mt-2 text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400">Remove image</button>}
    <MediaStudioDialog open={open} initialMedia={media} onClose={() => setOpen(false)} onSelect={(asset) => { setMedia((current) => [asset, ...current.filter((item) => item.id !== asset.id)]); onSelect(asset); setOpen(false); }} />
  </div>;
}

export function MediaStudioDialog({ open, initialMedia = [], initialView = "library", onClose, onSelect }: {
  open: boolean;
  initialMedia?: MediaAsset[];
  initialView?: "library" | "upload";
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
}) {
  const [view, setView] = useState<"library" | "upload">(initialView);
  const [media, setMedia] = useState(initialMedia);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    fetch("/api/media").then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Media unavailable");
      if (active) setMedia(result.media);
    }).catch(() => undefined).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [initialView, open]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return media.filter((asset) => `${asset.filename} ${asset.altText}`.toLowerCase().includes(needle));
  }, [media, query]);

  return <Dialog open={open} onClose={onClose} className="relative z-[70]">
    <DialogBackdrop transition className="fixed inset-0 bg-gray-950/75 backdrop-blur-sm transition-opacity data-closed:opacity-0" />
    <div className="fixed inset-0 overflow-y-auto p-3 sm:p-6">
      <div className="flex min-h-full items-center justify-center">
        <DialogPanel transition className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl transition data-closed:scale-95 data-closed:opacity-0 dark:bg-gray-900 dark:ring-1 dark:ring-white/10">
          <header className="flex items-start justify-between border-b border-gray-200 px-5 py-4 sm:px-6 dark:border-white/10">
            <div><DialogTitle className="text-lg font-semibold text-gray-950 dark:text-white">Media studio</DialogTitle><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose an existing asset or prepare a new image in place.</p></div>
            <button type="button" onClick={onClose} className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"><span className="sr-only">Close media studio</span><XMarkIcon aria-hidden="true" className="size-6" /></button>
          </header>
          <div className="border-b border-gray-200 px-5 sm:px-6 dark:border-white/10"><nav className="-mb-px flex gap-6" aria-label="Media studio views">
            {(["library", "upload"] as const).map((item) => <button key={item} type="button" onClick={() => setView(item)} className={`${view === item ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300" : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"} border-b-2 py-3 text-sm font-semibold capitalize`}>{item}</button>)}
          </nav></div>
          {view === "library" ? <div className="min-h-[32rem] p-5 sm:p-6">
            <label className="relative block max-w-xl"><span className="sr-only">Search media</span><MagnifyingGlassIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-400" /><input type="search" className="admin-control admin-control-with-leading-icon w-full" placeholder="Search filename or alternative text" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            {loading && media.length === 0 ? <p className="mt-10 text-center text-sm text-gray-500">Loading media…</p> : filtered.length === 0 ? <div className="mt-10 rounded-xl border-2 border-dashed border-gray-200 py-12 text-center dark:border-white/10"><PhotoIcon className="mx-auto size-10 text-gray-400" /><p className="mt-3 text-sm font-semibold text-gray-800 dark:text-gray-100">{media.length === 0 ? "No images yet" : "No matching images"}</p>{media.length === 0 && <button type="button" className="mt-4 text-sm font-semibold text-emerald-700 dark:text-emerald-400" onClick={() => setView("upload")}>Upload the first image</button>}</div> : <ul className="mt-6 grid max-h-[29rem] grid-cols-2 gap-4 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">{filtered.map((asset) => <li key={asset.id}><button type="button" onClick={() => onSelect(asset)} className="group w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-left hover:border-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-white/10 dark:bg-white/5 dark:hover:border-emerald-400"><img src={`/api/media/${asset.id}`} alt="" className="aspect-square w-full bg-gray-100 object-cover transition group-hover:opacity-85 dark:bg-gray-950" /><span className="block p-2.5"><strong className="block truncate text-sm font-medium text-gray-900 dark:text-white">{asset.filename}</strong><span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">{asset.width} × {asset.height} · {asset.decorative ? "Decorative" : asset.altText}</span></span></button></li>)}</ul>}
          </div> : <MediaUploader onUploaded={(asset) => { setMedia((current) => [asset, ...current]); onSelect(asset); }} />}
        </DialogPanel>
      </div>
    </div>
  </Dialog>;
}

function MediaUploader({ onUploaded }: { onUploaded: (asset: MediaAsset) => void }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [sourceAspect, setSourceAspect] = useState(4 / 3);
  const [ratio, setRatio] = useState("original");
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [altText, setAltText] = useState("");
  const [decorative, setDecorative] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const onCropComplete = useCallback((_area: Area, pixels: Area) => setCroppedArea(pixels), []);

  function chooseFile(next: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    setFile(next); setMessage(""); setCrop({ x: 0, y: 0 }); setZoom(1); setRotation(0); setRatio("original");
    if (!next) return setPreview("");
    const url = URL.createObjectURL(next);
    setPreview(url);
    const image = new Image();
    image.onload = () => setSourceAspect(image.naturalWidth / image.naturalHeight);
    image.src = url;
  }

  async function upload(event: React.FormEvent) {
    event.preventDefault();
    if (!file || !croppedArea) return setMessage("Choose and position an image first.");
    if (!decorative && !altText.trim()) return setMessage("Add alternative text or mark the image decorative.");
    setPending(true); setMessage("Cropping and validating image…");
    try {
      const edited = await cropImage(file, croppedArea, rotation);
      const body = new FormData();
      body.set("file", edited); body.set("altText", altText); body.set("decorative", String(decorative));
      const response = await fetch("/api/media", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Upload failed");
      setMessage("Image saved and selected.");
      onUploaded(result.asset);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  const aspect = ratio === "original" ? sourceAspect : Number(ratio);
  return <form className="grid min-h-[32rem] gap-6 p-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,.7fr)] sm:p-6" onSubmit={upload}>
    <div>
      {!preview ? <button type="button" onClick={() => fileInput.current?.click()} className="flex h-[27rem] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 text-center hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-white/15 dark:bg-gray-950 dark:hover:border-emerald-400"><ArrowUpTrayIcon className="size-10 text-gray-400" /><span className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">Choose an image</span><span className="mt-1 text-xs text-gray-500 dark:text-gray-400">JPEG, PNG, WebP, AVIF, or GIF · up to 10 MB</span></button> : <div className="relative h-[27rem] overflow-hidden rounded-xl bg-gray-950"><Cropper image={preview} crop={crop} zoom={zoom} rotation={rotation} aspect={aspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} objectFit="contain" showGrid /></div>}
      <input ref={fileInput} aria-label="Image" className="sr-only" type="file" accept={acceptedImages} onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} />
    </div>
    <div className="grid content-start gap-5">
      <div><p className="text-sm font-semibold text-gray-900 dark:text-white">Crop and details</p><p className="mt-1 text-xs/5 text-gray-500 dark:text-gray-400">The saved asset uses exactly the crop shown at left.</p></div>
      <button type="button" onClick={() => fileInput.current?.click()} className="justify-self-start text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-400">{file ? "Choose a different file" : "Choose file"}</button>
      <label className="text-sm font-medium text-gray-800 dark:text-gray-200">Aspect ratio<select className="admin-control mt-2 w-full" disabled={!file} value={ratio} onChange={(event) => { setRatio(event.target.value); setCrop({ x: 0, y: 0 }); }}>{ratios.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
      <label className="text-sm font-medium text-gray-800 dark:text-gray-200">Zoom <span className="float-right font-normal text-gray-500">{zoom.toFixed(1)}×</span><input className="mt-2 w-full accent-emerald-600" type="range" min="1" max="3" step="0.05" disabled={!file} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></label>
      <label className="text-sm font-medium text-gray-800 dark:text-gray-200">Rotation<select className="admin-control mt-2 w-full" disabled={!file} value={rotation} onChange={(event) => setRotation(Number(event.target.value))}><option value={0}>None</option><option value={90}>90° clockwise</option><option value={180}>180°</option><option value={270}>270° clockwise</option></select></label>
      <label className="text-sm font-medium text-gray-800 dark:text-gray-200">Alternative text<textarea className="admin-control mt-2 w-full" rows={3} disabled={!file || decorative} value={altText} onChange={(event) => setAltText(event.target.value)} /></label>
      <label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300"><input className="size-4 accent-emerald-600" type="checkbox" disabled={!file} checked={decorative} onChange={(event) => setDecorative(event.target.checked)} />Decorative image</label>
      {message && <p role="status" className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">{message}</p>}
      <button disabled={!file || pending} className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"><CheckCircleIcon aria-hidden="true" className="size-5" />{pending ? "Saving image…" : "Save and use image"}</button>
    </div>
  </form>;
}
