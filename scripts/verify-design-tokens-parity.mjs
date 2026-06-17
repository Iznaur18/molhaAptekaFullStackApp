import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { izColors } from "../packages/design-tokens/src/colors.ts";
import { izRadius } from "../packages/design-tokens/src/radius.ts";
import { izSpacing } from "../packages/design-tokens/src/spacing.ts";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.resolve(scriptDir, "../client/src/shared/styles/designTokens.css");

const cssContent = await fs.readFile(cssPath, "utf8");

/** @type {Map<string, string>} */
const cssVars = new Map();
for (const match of cssContent.matchAll(/(--iz-[a-z0-9-]+)\s*:\s*([^;]+);/gim)) {
  const varName = match[1].trim();
  const rawValue = match[2].trim();
  cssVars.set(varName, rawValue);
}

const camelToKebab = (value) => value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);

const normalizeHex = (value) => String(value).trim().toLowerCase();

const parseCssLengthToPx = (value) => {
  const normalized = String(value).trim().toLowerCase();
  if (/^-?\d+(\.\d+)?px$/.test(normalized)) {
    return Number.parseFloat(normalized.replace("px", ""));
  }
  if (/^-?\d+(\.\d+)?rem$/.test(normalized)) {
    return Number.parseFloat(normalized.replace("rem", "")) * 16;
  }
  const calcMatch = normalized.match(
    /^calc\(\s*(-?\d+(?:\.\d+)?)px\s*\*\s*(-?\d+(?:\.\d+)?)\s*\)$/,
  );
  if (calcMatch) {
    return Number.parseFloat(calcMatch[1]) * Number.parseFloat(calcMatch[2]);
  }
  return Number.NaN;
};

/** @type {string[]} */
const violations = [];

for (const [tokenKey, tokenValue] of Object.entries(izColors)) {
  const varName = `--iz-color-${camelToKebab(tokenKey)}`;
  const cssValue = cssVars.get(varName);
  if (!cssValue) {
    violations.push(`missing color var ${varName}`);
    continue;
  }
  if (normalizeHex(cssValue) !== normalizeHex(tokenValue)) {
    violations.push(
      `color mismatch ${varName}: css=${cssValue} tokens=${tokenValue}`,
    );
  }
}

const FLOAT_TOLERANCE = 0.51;

for (const [tokenKey, tokenValue] of Object.entries(izRadius)) {
  const varName = `--iz-radius-${camelToKebab(tokenKey)}`;
  const cssValue = cssVars.get(varName);
  if (!cssValue) {
    violations.push(`missing radius var ${varName}`);
    continue;
  }
  const cssPx = parseCssLengthToPx(cssValue);
  if (!Number.isFinite(cssPx) || Math.abs(cssPx - tokenValue) > FLOAT_TOLERANCE) {
    violations.push(
      `radius mismatch ${varName}: css=${cssValue} tokens=${tokenValue}px`,
    );
  }
}

for (const [tokenKey, tokenValue] of Object.entries(izSpacing)) {
  const varName = `--iz-space-${tokenKey}`;
  const cssValue = cssVars.get(varName);
  if (!cssValue) {
    violations.push(`missing spacing var ${varName}`);
    continue;
  }
  const cssPx = parseCssLengthToPx(cssValue);
  if (!Number.isFinite(cssPx) || Math.abs(cssPx - tokenValue) > FLOAT_TOLERANCE) {
    violations.push(
      `spacing mismatch ${varName}: css=${cssValue} tokens=${tokenValue}px`,
    );
  }
}

if (violations.length > 0) {
  console.error("Design tokens parity check failed:\n");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("[design-tokens-parity] ok");
