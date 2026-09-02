import { NewPageForm } from "./new-page-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "New page — Snipgraph CMS", robots: { index: false } };

export default function NewPage() {
  return <section className="editor-shell admin-editor-shell"><NewPageForm /></section>;
}
