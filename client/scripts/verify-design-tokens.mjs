import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.join(__dirname, "../src");

const EXCLUDED = new Set(["shared/styles/designTokens.css"]);

const RAW_COLOR_PATTERNS = [
  { name: "hex", pattern: /#[0-9a-fA-F]{3,8}\b/g },
  { name: "rgba()", pattern: /rgba\s*\(/g },
  { name: "rgb()", pattern: /rgb\s*\(\s*\d/g },
  { name: "Canvas", pattern: /\bCanvas\b/g },
  { name: "CanvasText", pattern: /\bCanvasText\b/g },
];

/**
 * @param {string} relativePath
 */
function isExcluded(relativePath) {
  return EXCLUDED.has(relativePath.replaceAll("\\", "/"));
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
function collectCssFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  /** @type {string[]} */
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectCssFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".css")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * @param {string} content
 * @param {string} patternName
 * @param {RegExp} pattern
 * @returns {number[]}
 */
function findPatternLineNumbers(content, patternName, pattern) {
  const lines = content.split("\n");
  /** @type {number[]} */
  const hits = [];

  lines.forEach((line, index) => {
    pattern.lastIndex = 0;
    if (pattern.test(line)) {
      hits.push(index + 1);
    }
  });

  return hits;
}

const files = collectCssFiles(SRC_ROOT);
/** @type {{ file: string; issues: { rule: string; lines: number[] }[] }[]} */
const violations = [];

for (const filePath of files) {
  const relative = path.relative(SRC_ROOT, filePath).replaceAll("\\", "/");
  if (isExcluded(relative)) {
    continue;
  }

  const content = fs.readFileSync(filePath, "utf8");
  /** @type {{ rule: string; lines: number[] }[]} */
  const issues = [];

  for (const { name, pattern } of RAW_COLOR_PATTERNS) {
    const lines = findPatternLineNumbers(content, name, pattern);
    if (lines.length > 0) {
      issues.push({ rule: name, lines });
    }
  }

  if (issues.length > 0) {
    violations.push({ file: relative, issues });
  }
}

if (violations.length > 0) {
  console.error("Design token violations (raw colors outside designTokens.css):\n");
  for (const { file, issues } of violations) {
    console.error(`  ${file}`);
    for (const { rule, lines } of issues) {
      console.error(`    ${rule}: lines ${lines.join(", ")}`);
    }
  }
  process.exit(1);
}

console.log(`OK: ${files.length - 1} CSS files use tokens only.`);
