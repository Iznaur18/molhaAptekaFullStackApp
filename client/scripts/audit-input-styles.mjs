/**
 * Инвентаризация полей ввода в web-CSS: какие геометрии реально используются.
 *
 * Мобильные эталоны (mobile/shared/theme/formChromeStyles.ts):
 *   auth     — px 16, py 14, r 10, 16px, border 1 borderStrong
 *   field    — px 12, py 10, r 10, 16px, border hairline border
 *   checkout — px 14, py 9,  r 8,  15px, border 1 border
 *
 *   node scripts/audit-input-styles.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "../src");
const REM = 16;

/** @param {string} dir @returns {string[]} */
function collect(dir) {
  /** @type {string[]} */
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...collect(full));
    else if (e.isFile() && e.name.endsWith(".css")) out.push(full);
  }
  return out;
}

/** @param {string} v @returns {string} */
function px(v) {
  return v
    .trim()
    .split(/\s+/)
    .map((part) => {
      const m = part.match(/^(-?[\d.]+)rem$/);
      if (m) return `${Math.round(Number.parseFloat(m[1]) * REM * 100) / 100}px`;
      return part;
    })
    .join(" ");
}

/** Селектор похож на поле ввода? @param {string} sel */
const isInputSelector = (sel) =>
  /(^|[\s,>])(input|textarea|select)\b/.test(sel) ||
  /__(input|textarea|select|field)\b/.test(sel) ||
  /\b(input|textarea|select)(--|_)/.test(sel);

const rows = [];

for (const file of collect(SRC)) {
  const rel = path.relative(SRC, file).replaceAll("\\", "/");
  if (rel === "shared/styles/controls.css") continue;
  const css = fs.readFileSync(file, "utf8");

  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const sel = m[1].trim().replace(/\s+/g, " ");
    if (sel.startsWith("@") || !isInputSelector(sel)) continue;
    const body = m[2];
    const grab = (prop) => {
      const r = new RegExp(`(?:^|;)\\s*${prop}:\\s*([^;]+)`, "i").exec(body);
      return r ? px(r[1]) : "";
    };
    const padding = grab("padding");
    const radius = grab("border-radius");
    const font = grab("font-size");
    const border = grab("border");
    if (!padding && !radius && !font && !border) continue;
    rows.push({ rel, sel: sel.slice(0, 58), padding, radius, font, border: border.slice(0, 40) });
  }
}

console.log(`Найдено правил, стилизующих поля: ${rows.length}\n`);
console.log(
  `${"файл".padEnd(52)} ${"padding".padEnd(16)} ${"radius".padEnd(9)} ${"font".padEnd(8)} border`,
);
console.log("-".repeat(120));
for (const r of rows) {
  console.log(
    `${r.rel.slice(-50).padEnd(52)} ${r.padding.padEnd(16)} ${r.radius.padEnd(9)} ${r.font.padEnd(8)} ${r.border}`,
  );
}

// Сводка по уникальным геометриям
const combo = new Map();
for (const r of rows) {
  if (!r.padding && !r.radius && !r.font) continue;
  const k = `padding ${r.padding || "—"} | radius ${r.radius || "—"} | font ${r.font || "—"}`;
  combo.set(k, (combo.get(k) ?? 0) + 1);
}
console.log(`\nУникальных геометрий: ${combo.size}`);
for (const [k, n] of [...combo].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}×  ${k}`);
}
