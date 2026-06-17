/**
 * Removes outer try/catch from controller handlers when catch only forwards via errorRes.
 * Handlers on createAsyncRouter → asyncHandler → errorHandler.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "controllers");

const SKIP = new Set([
  "index.js",
  "orderQueries.js",
  "orderStatus.js",
  "cartItemHelpers.js",
  "resolveCartUserId.js",
  "favoritesItemHelpers.js",
  "resolveFavoritesUserId.js",
  "controllerAsync.js",
]);

/** Catch blocks with domain-specific branching — do not strip. */
const SKIP_CATCH = [
  "InsufficientLoyaltyPointsError",
  "PremiumAlreadyActiveError",
  "error?.code",
  "error.code",
  "error.message ===",
  "error.name ===",
  "isDuplicateKeyError",
  "instanceof Premium",
  "instanceof Insufficient",
  "ValidationError",
  "CastError",
  "catch {",
  "catch(e)",
  "catch (e)",
  "next(",
];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith(".js") && !SKIP.has(name)) out.push(full);
  }
  return out;
}

function findMatchingBrace(source, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function findHandlerBodyOpens(source) {
  const opens = [];
  const patterns = [
    /export const \w+ = async \([^)]*\) => \{/g,
    /export async function \w+\([^)]*\) \{/g,
  ];

  for (const re of patterns) {
    let match = re.exec(source);
    while (match) {
      const bodyOpen = match.index + match[0].length - 1;
      opens.push(bodyOpen);
      match = re.exec(source);
    }
  }

  return opens.sort((a, b) => b - a);
}

function stripOuterTryCatch(source) {
  let changed = false;
  const bodyOpens = findHandlerBodyOpens(source);

  for (const bodyOpen of bodyOpens) {
    const bodyClose = findMatchingBrace(source, bodyOpen);
    if (bodyClose === -1) continue;

    const body = source.slice(bodyOpen + 1, bodyClose);
    const trimmed = body.trimStart();
    if (!trimmed.startsWith("try {")) continue;

    const tryBodyOpen = bodyOpen + 1 + body.indexOf("try {") + "try ".length;
    const tryBraceOpen = source.indexOf("{", tryBodyOpen - 1);
    const tryBodyClose = findMatchingBrace(source, tryBraceOpen);
    if (tryBodyClose === -1 || tryBodyClose > bodyClose) continue;

    const afterTry = source.slice(tryBodyClose + 1, bodyClose).trimStart();
    if (!afterTry.startsWith("catch")) continue;

    const catchStart =
      tryBodyClose + 1 + source.slice(tryBodyClose + 1, bodyClose).indexOf("catch");
    const catchOpen = source.indexOf("{", catchStart);
    const catchClose = findMatchingBrace(source, catchOpen);
    if (catchClose === -1 || catchClose > bodyClose) continue;

    const catchBlock = source.slice(catchStart, catchClose + 1);
    if (SKIP_CATCH.some((s) => catchBlock.includes(s))) continue;

    const tryInner = source.slice(tryBraceOpen + 1, tryBodyClose).trim();
    const replacement = `\n${tryInner}\n`;
    source = source.slice(0, bodyOpen + 1) + replacement + source.slice(bodyClose);
    changed = true;
  }

  return { source, changed };
}

function cleanupImports(source) {
  if (!source.includes("errorRes(")) {
    source = source.replace(/,\s*errorRes/g, "").replace(/errorRes,\s*/g, "");
    source = source.replace(/import \{ errorRes \} from "[^"]+";\n/g, "");
  }
  if (!source.includes("AppError") && source.includes("AppError.js")) {
    source = source.replace(/\nimport \{ AppError \} from "[^"]+AppError\.js";\n/g, "\n");
  }
  return source;
}

let touched = 0;
for (const file of walk(root)) {
  const original = fs.readFileSync(file, "utf8");
  let { source, changed } = stripOuterTryCatch(original);
  source = cleanupImports(source);
  if (source !== original) {
    fs.writeFileSync(file, source);
    touched += 1;
    console.log("updated:", path.relative(root, file), changed ? "" : "(imports)");
  }
}

console.log(`\nDone. ${touched} files.`);
