import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseFeatureSpec } from "./index.js";

const root = path.resolve(process.argv[2] ?? "features");
const catalogRoot = path.resolve(process.argv[3] ?? "../../references/catalog");
const entries = await readdir(root, { withFileTypes: true });
const featureFiles = entries
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(root, entry.name, "feature.json"));

if (featureFiles.length === 0) {
  throw new Error(`No feature specifications found under ${root}`);
}

const catalogIds = new Set<string>();
for (const filename of await markdownFiles(catalogRoot)) {
  const heading = (await readFile(filename, "utf8")).match(/^#\s+([^\s]+)\s*$/m)?.[1];
  if (!heading) throw new Error(`${filename} has no catalog id heading`);
  if (catalogIds.has(heading)) throw new Error(`Duplicate catalog id ${heading}`);
  catalogIds.add(heading);
}

for (const filename of featureFiles) {
  const value: unknown = JSON.parse(await readFile(filename, "utf8"));
  const feature = parseFeatureSpec(value);
  if (path.basename(path.dirname(filename)) !== `${feature.id}-${slug(feature.title)}`) {
    throw new Error(`${filename} does not match the feature id and title`);
  }
  const missing = feature.references.filter((reference) => !catalogIds.has(reference));
  if (missing.length > 0) {
    throw new Error(`${filename} references unknown catalog ids: ${missing.join(", ")}`);
  }
  process.stdout.write(`validated ${feature.id}: ${feature.title}\n`);
}

async function markdownFiles(directory: string): Promise<string[]> {
  const children = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    children.map((child) => {
      const filename = path.join(directory, child.name);
      if (child.isDirectory()) return markdownFiles(filename);
      return child.isFile() && child.name.endsWith(".md") ? [filename] : [];
    }),
  );
  return files.flat();
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
