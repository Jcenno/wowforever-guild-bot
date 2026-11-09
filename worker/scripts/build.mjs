#!/usr/bin/env node
// Bundles src/strings.js + src/index.js into one file for the Cloudflare editor (no bundler needed).
// Writes dist/worker.js (readable) and dist/worker.flat.js (leading indentation stripped, for pasting).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const strings = readFileSync(join(root, "src/strings.js"), "utf8").replace(/^export const S/m, "const S");
const index = readFileSync(join(root, "src/index.js"), "utf8").replace(/^import \{ S \} from "\.\/strings\.js";\n/m, "");
const [head, ...rest] = index.split("\n");
const out = `${head}\n// ---- strings.js (inlined)\n${strings.trim()}\n\n// ---- index.js\n${rest.join("\n")}`;
mkdirSync(join(root, "dist"), { recursive: true });
writeFileSync(join(root, "dist/worker.js"), out);
const flat = out.split("\n").map((l) => l.replace(/^\s+/, ""));
writeFileSync(join(root, "dist/worker.flat.js"), flat.join("\n"));
// paste.js: no comments, no blank lines; what goes into the Cloudflare editor (check the last line after pasting).
writeFileSync(join(root, "dist/worker.paste.js"), flat.filter((l) => l && !l.startsWith("//")).join("\n") + "\n");
console.log(`dist/worker.js ${out.length} chars`);
