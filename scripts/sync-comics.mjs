import { readdir, writeFile, mkdir } from "node:fs/promises";
import { dirname, extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(project, "content/comics");
const output = resolve(project, "public/comics.json");
const allowed = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);
const excludedDirectories = new Set(["panels"]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory() && !excludedDirectories.has(entry.name.toLowerCase())) files.push(...await walk(path));
    else if (allowed.has(extname(entry.name).toLowerCase())) files.push(path);
  }
  return files;
}

const files = await walk(source);
const comics = files.map((path, index) => {
  const local = relative(source, path).split(sep).join("/");
  const [collection = "Unsorted"] = local.split("/");
  const filename = local.split("/").at(-1);
  const title = filename.replace(extname(filename), "").replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return {
    id: local.replace(extname(local), "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase(),
    title,
    collection: collection.replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    image: `content/comics/${encodeURI(local)}`,
    order: index + 1
  };
});

await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify({ generatedAt: new Date().toISOString(), comics }, null, 2) + "\n");
console.log(`Indexed ${comics.length} comic images.`);
