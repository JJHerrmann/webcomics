import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import "./sync-comics.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const types = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json", ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".gif":"image/gif", ".webp":"image/webp", ".avif":"image/avif" };

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    let path = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
    if (!path.startsWith(root)) throw new Error("Invalid path");
    if ((await stat(path)).isDirectory()) path = resolve(path, "index.html");
    response.writeHead(200, { "Content-Type": types[extname(path).toLowerCase()] || "application/octet-stream" });
    response.end(await readFile(path));
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

const port = Number(process.env.PORT || 8890);
server.listen(port, "127.0.0.1", () => console.log(`No Clue archive: http://127.0.0.1:${port}`));
