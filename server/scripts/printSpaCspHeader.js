import "dotenv/config";

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

import { buildSpaContentSecurityPolicy } from "../utils/buildSpaContentSecurityPolicy.js";
import { inlineScriptCspHashes } from "../utils/inlineScriptCspHashes.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * VITE_* живут в client/.env (в server/.env их нет), а от них зависит script-src
 * для Plausible. Значения из server/.env и окружения не перетираем.
 */
for (const envFile of [
  ".env.production.local",
  ".env.production",
  ".env.local",
  ".env",
]) {
  dotenv.config({ path: path.join(repoRoot, "client", envFile), override: false });
}

/** Хэши инлайн-скриптов берём из собранного dist, иначе из исходного index.html. */
const htmlCandidates = [
  process.argv[2],
  path.join(repoRoot, "client/dist/index.html"),
  path.join(repoRoot, "client/index.html"),
].filter(Boolean);

let htmlPath = null;
let html = "";
for (const candidate of htmlCandidates) {
  try {
    html = readFileSync(candidate, "utf8");
    htmlPath = candidate;
    break;
  } catch {
    // следующий кандидат
  }
}

if (!htmlPath) {
  console.error(
    `# index.html не найден (искал: ${htmlCandidates.join(", ")}) — хэши инлайн-скриптов не добавлены`,
  );
}

const inlineScriptHashes = inlineScriptCspHashes(html);
const policy = buildSpaContentSecurityPolicy({ inlineScriptHashes });

console.log(`# index.html: ${htmlPath ?? "не найден"}`);
console.log("# Вставь в nginx location / { ... }");
console.log(`add_header Content-Security-Policy "${policy}" always;`);
