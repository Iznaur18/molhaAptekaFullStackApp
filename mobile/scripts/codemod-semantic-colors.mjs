import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MOBILE_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/** @type {Record<string, string>} */
const THEME_CONST_MAP = {
  DANGER_STRONG: "theme.colors.danger",
  DANGER_ACCENT: "theme.colors.danger",
  DANGER_SURFACE: "theme.colors.dangerSurface",
  DANGER_SOFT: "theme.colors.dangerSurface",
  DANGER_DEEP: "theme.colors.danger",
  DANGER_BORDER: "theme.colors.dangerSurface",
  LINK_DEEP: "theme.colors.action",
  LINK: "theme.colors.link",
  LINK_HOVER: "theme.colors.actionHover",
  SUCCESS_TEAL_BRIGHT: "theme.colors.success",
  SUCCESS_TEAL: "theme.colors.success",
  SUCCESS_VIVID: "theme.colors.success",
  SUCCESS_PALE: "theme.colors.successSurface",
  SUCCESS_SURFACE: "theme.colors.successSurface",
  SUCCESS_SOFT: "theme.colors.successSurface",
  SUCCESS_LIGHT: "theme.colors.successSurface",
  SUCCESS_STRONG: "theme.colors.successText",
  SUCCESS_FOREST: "theme.colors.successText",
  SUCCESS_BORDER: "theme.colors.successSurface",
  WARNING_BRIGHT: "theme.colors.warning",
  WARNING_TEXT: "theme.colors.warningText",
  WARNING_DEEP: "theme.colors.warningText",
  WARNING_BROWN_DARK: "theme.colors.warningText",
  WARNING_YELLOW_SOFT: "theme.colors.warningSurface",
  ACCENT_PURPLE: "theme.colors.accent",
  ACCENT_PURPLE_SOFT: "theme.colors.accentSoft",
  NEUTRAL_GRAY: "theme.colors.textMuted",
  NEUTRAL_GRAY_DEEP: "theme.colors.textSecondary",
  INFO_LIGHT: "theme.colors.infoSoft",
  INFO_PALE: "theme.colors.infoSoft",
  INFO_SOFT: "theme.colors.infoSoft",
  INFO_SKY: "theme.colors.info",
  INFO_DEEP: "theme.colors.infoDeep",
  INFO_NAVY: "theme.colors.infoDeep",
  INFO_MUTED: "theme.colors.infoSoft",
  GOLD: "theme.colors.warning",
  GOLD_MUTED: "theme.colors.warningText",
  GOLD_DEEP: "theme.colors.warning",
  GOLD_HIGHLIGHT: "theme.colors.warningSurface",
  GOLD_BORDER: "theme.colors.warningSurface",
  GOLD_SOFT: "theme.colors.warningSurface",
  PURPLE_SOFT: "theme.colors.accentSoft",
  PURPLE_BORDER: "theme.colors.accentSoft",
  PROMOTION_BOOST_BG: "theme.colors.warningSurface",
  SLATE: "theme.colors.textSecondary",
  SURFACE_FADE_TOP: "theme.colors.surfaceElevated",
};

/** @type {Record<string, string>} */
const SEMANTIC_CONST_MAP = {
  LINK_DEEP: "semanticColors.action",
  LINK: "semanticColors.link",
  SUCCESS_TEAL_BRIGHT: "semanticColors.success",
  SUCCESS_VIVID: "semanticColors.success",
  WARNING_BRIGHT: "semanticColors.warning",
  DANGER_ACCENT: "semanticColors.danger",
};

const HEX_REPLACEMENTS = [
  ["#b42318", "semanticColors.danger"],
  ["#dc2626", "semanticColors.danger"],
  ["#c62828", "semanticColors.danger"],
  ["#991b1b", "semanticColors.dangerText"],
  ["#4f46e5", "semanticColors.action"],
  ["#2563eb", "semanticColors.link"],
  ["#1f6feb", "semanticColors.action"],
  ["#1d4ed8", "semanticColors.actionHover"],
  ["#7c3aed", "semanticColors.accent"],
  ["#6d28d9", "semanticColors.accent"],
  ["#9ca3af", "semanticColors.textMuted"],
  ["#ffffff", "semanticColors.onContrast"],
  ["#fff", "semanticColors.onContrast"],
  ["#16a34a", "semanticColors.success"],
  ["#047857", "semanticColors.successText"],
  ["#d97706", "semanticColors.warning"],
  ["#92400e", "semanticColors.warningText"],
  ["#0369a1", "semanticColors.info"],
  ["#1d9bf0", "semanticColors.info"],
  ["#111827", "semanticColors.text"],
  ["#0f172a", "semanticColors.text"],
  ["#e5e7eb", "semanticColors.border"],
  ["#f8fafc", "semanticColors.surfaceElevated"],
  ["#f0fdf4", "semanticColors.successSurface"],
  ["#eff6ff", "semanticColors.actionSoft"],
  ["#eef2ff", "semanticColors.actionSoft"],
  ["#ecfdf3", "semanticColors.successSurface"],
  ["#ecfdf5", "semanticColors.successSurface"],
  ["#ede9fe", "semanticColors.accentSoft"],
  ["#faf5ff", "semanticColors.accentSoft"],
  ["#fffbeb", "semanticColors.warningSurface"],
  ["#fef2f2", "semanticColors.dangerSurface"],
  ["#dbeafe", "semanticColors.actionBorder"],
  ["#f59e0b", "semanticColors.warning"],
  ["#eab308", "semanticColors.warning"],
  ["#854d0e", "semanticColors.warningText"],
  ["#027a48", "semanticColors.successText"],
  ["#4b5563", "semanticColors.textSecondary"],
  ["#374151", "semanticColors.textSecondary"],
  ["#475569", "semanticColors.textSecondary"],
  ["#5b21b6", "semanticColors.accent"],
  ["#be123c", "semanticColors.danger"],
  ["#fecdd3", "semanticColors.dangerSurface"],
  ["#000000", "semanticColors.ink"],
  ["#000", "semanticColors.ink"],
];

const COLOR_CONST_RE = /^const ([A-Z0-9_]+) = "#[0-9A-Fa-f]{3,8}";\r?$/gm;

const walk = (dir, files = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }
    if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      files.push(fullPath);
    }
  }
  return files;
};

const replaceHexLiterals = (content, usesTheme) => {
  let next = content;
  let changed = false;

  for (const [hex, replacement] of HEX_REPLACEMENTS) {
    const themedReplacement = usesTheme
      ? replacement.replaceAll("semanticColors.", "theme.colors.")
      : replacement;

    if (next.includes(hex)) {
      next = next.replaceAll(`"${hex}"`, themedReplacement);
      next = next.replaceAll(`'${hex}'`, themedReplacement);
      changed = true;
    }
  }

  return { next, changed };
};

const transformFile = (filePath, content) => {
  const usesTheme = content.includes("createThemedStyles((theme)");
  const constMap = usesTheme ? THEME_CONST_MAP : SEMANTIC_CONST_MAP;

  const declared = new Set();
  let next = content.replace(COLOR_CONST_RE, (_match, name) => {
    if (constMap[name]) {
      declared.add(name);
      return "";
    }
    return _match;
  });

  let changed = next !== content;

  for (const name of declared) {
    const replacement = constMap[name];
    next = next.replaceAll(new RegExp(`\\b${name}\\b`, "g"), replacement);
  }

  const hexResult = replaceHexLiterals(next, usesTheme);
  next = hexResult.next;
  changed = changed || hexResult.changed || declared.size > 0;

  if (!changed) {
    return content;
  }

  next = next.replace(/\n{3,}/g, "\n\n");

  if (!usesTheme && !next.includes('from "@/shared/theme/semanticColors"')) {
    next = `import { semanticColors } from "@/shared/theme/semanticColors";\n${next}`;
  }

  return next;
};

let changedFiles = 0;

const targetRoots = [
  path.join(MOBILE_ROOT, "shared/theme"),
  path.join(MOBILE_ROOT, "entities"),
  path.join(MOBILE_ROOT, "features"),
];

for (const root of targetRoots) {
  if (!fs.existsSync(root)) {
    continue;
  }

  for (const filePath of walk(root)) {
    if (root.includes("entities") && !filePath.includes(`${path.sep}lib${path.sep}`) && !filePath.includes(`${path.sep}ui${path.sep}`)) {
      continue;
    }

    const original = fs.readFileSync(filePath, "utf8");
    const updated = transformFile(filePath, original);
    if (updated !== original) {
      fs.writeFileSync(filePath, updated, "utf8");
      changedFiles += 1;
      console.log(`updated ${path.relative(MOBILE_ROOT, filePath)}`);
    }
  }
}

console.log(`done: ${changedFiles} files updated`);
