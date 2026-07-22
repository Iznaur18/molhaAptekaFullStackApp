/**
 * Диагностика: какие значения web-CSS реально расходятся с мобилой.
 *
 * Сравнивает не с «идеальной» шкалой, а с фактическим множеством значений,
 * которые встречаются в mobile/**. Значение, у которого в мобиле есть точный
 * двойник, уже в паритете — трогать его нельзя.
 *
 *   node scripts/analyze-parity-gap.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_SRC = path.join(__dirname, "../src");
const MOBILE_ROOT = path.join(__dirname, "../../mobile");
const REM_BASE = 16;
const EPS = 0.11; // допуск на округление rem→px

const MOBILE_DIRS = ["app", "components", "entities", "features", "shared"];

/** @param {string} dir @param {(name: string) => boolean} match @returns {string[]} */
function collect(dir, match) {
  /** @type {string[]} */
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collect(full, match));
    else if (entry.isFile() && match(entry.name)) files.push(full);
  }
  return files;
}

/** Значения из мобилы: prop → Map<value, count> */
function readMobile(/** @type {string} */ prop) {
  /** @type {Map<number, number>} */
  const values = new Map();
  const re = new RegExp(`${prop}:\\s*([0-9.]+)`, "g");
  for (const dir of MOBILE_DIRS) {
    for (const file of collect(path.join(MOBILE_ROOT, dir), (n) => /\.tsx?$/.test(n))) {
      const content = fs.readFileSync(file, "utf8");
      for (const m of content.matchAll(re)) {
        const v = Number.parseFloat(m[1]);
        if (Number.isFinite(v)) values.set(v, (values.get(v) ?? 0) + 1);
      }
    }
  }
  return values;
}

/** @param {string} raw @returns {number | null} */
function toPx(raw) {
  const value = raw.trim();
  if (/var\(|calc\(|%|inherit|initial|unset|clamp\(|min\(|max\(|\s|\//.test(value)) return null;
  const rem = value.match(/^(-?[\d.]+)rem$/);
  if (rem) return Number.parseFloat(rem[1]) * REM_BASE;
  const px = value.match(/^(-?[\d.]+)px$/);
  if (px) return Number.parseFloat(px[1]);
  return null;
}

/** @param {number} px @param {Map<number, number>} mobile */
function nearest(px, mobile) {
  let best = null;
  let bestDist = Infinity;
  for (const [v, count] of mobile) {
    const d = Math.abs(v - px);
    // При равном расстоянии предпочитаем более частотное значение в мобиле.
    if (d < bestDist || (d === bestDist && count > (mobile.get(best ?? 0) ?? 0))) {
      best = v;
      bestDist = d;
    }
  }
  return { value: best, dist: bestDist };
}

for (const [cssProp, rnProp] of [
  ["font-size", "fontSize"],
  ["border-radius", "borderRadius"],
  ["padding", "padding"],
  ["gap", "gap"],
]) {
  const mobile = readMobile(rnProp);
  /** @type {Map<string, { count: number, px: number, match: number | null, dist: number }>} */
  const web = new Map();

  const re = new RegExp(`\\b${cssProp}:\\s*([^;{}]+);`, "g");
  for (const file of collect(WEB_SRC, (n) => n.endsWith(".css"))) {
    if (/designTokens\.css|controls\.css|AppButton\.css/.test(file)) continue;
    for (const m of fs.readFileSync(file, "utf8").matchAll(re)) {
      const raw = m[1].trim();
      const px = toPx(raw);
      if (px === null) continue;
      if (!web.has(raw)) {
        const { value, dist } = nearest(px, mobile);
        web.set(raw, { count: 0, px, match: value, dist });
      }
      web.get(raw).count += 1;
    }
  }

  const rows = [...web].sort((a, b) => b[1].count - a[1].count);
  const inParity = rows.filter(([, r]) => r.dist <= EPS);
  const diverged = rows.filter(([, r]) => r.dist > EPS);
  const sum = (/** @type {typeof rows} */ list) =>
    list.reduce((acc, [, r]) => acc + r.count, 0);

  console.log(`\n########## ${cssProp} ##########`);
  console.log(`Уникальных значений в мобиле: ${mobile.size}`);
  console.log(
    `В паритете (точный двойник в мобиле): ${inParity.length} значений / ${sum(inParity)} вхождений`,
  );
  console.log(
    `Расходится: ${diverged.length} значений / ${sum(diverged)} вхождений\n`,
  );
  console.log("  РАСХОДЯЩИЕСЯ (web → ближайшее в мобиле):");
  for (const [raw, r] of diverged) {
    console.log(
      `  ${String(r.count).padStart(4)}×  ${raw.padEnd(12)} = ${String(r.px).padEnd(7)}px → ${r.match}px  (Δ${r.dist.toFixed(2)})`,
    );
  }
}
