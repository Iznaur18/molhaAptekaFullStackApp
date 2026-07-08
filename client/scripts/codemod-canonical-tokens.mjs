import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.join(__dirname, "../src");

/** @type {Array<[string, string]>} longest token names first */
const TOKEN_REPLACEMENTS = [
  ["--iz-color-danger-rose-deep", "--iz-color-danger-text"],
  ["--iz-color-danger-rose-dark", "--iz-color-danger-text"],
  ["--iz-color-danger-blush-deep", "--iz-color-danger-surface"],
  ["--iz-color-danger-salmon-soft", "--iz-color-danger-surface"],
  ["--iz-color-danger-rose", "--iz-color-danger"],
  ["--iz-color-danger-strong", "--iz-color-danger"],
  ["--iz-color-danger-deep", "--iz-color-danger"],
  ["--iz-color-danger-accent", "--iz-color-danger"],
  ["--iz-color-danger-soft", "--iz-color-danger-surface"],
  ["--iz-color-danger-coral", "--iz-color-danger"],
  ["--iz-color-danger-blush", "--iz-color-danger-surface"],
  ["--iz-color-danger-salmon", "--iz-color-danger-surface"],
  ["--iz-color-danger-pink", "--iz-color-danger-surface"],
  ["--iz-color-success-mint-deep", "--iz-color-success-text"],
  ["--iz-color-success-teal-bright", "--iz-color-success"],
  ["--iz-color-success-strong", "--iz-color-success"],
  ["--iz-color-success-bright", "--iz-color-success"],
  ["--iz-color-success-vivid", "--iz-color-success"],
  ["--iz-color-success-deep", "--iz-color-success-text"],
  ["--iz-color-success-muted", "--iz-color-success-text"],
  ["--iz-color-success-soft", "--iz-color-success-surface"],
  ["--iz-color-success-light", "--iz-color-success-surface"],
  ["--iz-color-success-pale", "--iz-color-success-surface"],
  ["--iz-color-success-badge", "--iz-color-success-surface"],
  ["--iz-color-success-mint", "--iz-color-success-surface"],
  ["--iz-color-success-forest", "--iz-color-success-text"],
  ["--iz-color-success-teal", "--iz-color-success"],
  ["--iz-color-accent-purple-text", "--iz-color-accent"],
  ["--iz-color-accent-purple-soft", "--iz-color-accent-soft"],
  ["--iz-color-accent-purple-hover", "--iz-color-accent-soft"],
  ["--iz-color-accent-purple", "--iz-color-accent"],
  ["--iz-color-premium-purple-soft", "--iz-color-accent-soft"],
  ["--iz-color-premium-purple-muted", "--iz-color-accent-soft"],
  ["--iz-color-premium-purple-light", "--iz-color-accent"],
  ["--iz-color-premium-purple", "--iz-color-accent"],
  ["--iz-color-premium-indigo-soft", "--iz-color-accent-soft"],
  ["--iz-color-premium-indigo-muted", "--iz-color-accent-soft"],
  ["--iz-color-premium-indigo", "--iz-color-accent"],
  ["--iz-color-accent-pink-surface", "--iz-color-accent-soft"],
  ["--iz-color-accent-pink-lavender", "--iz-color-accent-soft"],
  ["--iz-color-accent-pink-lilac", "--iz-color-accent-soft"],
  ["--iz-color-accent-pink-deep", "--iz-color-accent"],
  ["--iz-color-accent-pink-soft", "--iz-color-accent-soft"],
  ["--iz-color-accent-pink", "--iz-color-accent"],
  ["--iz-color-warning-yellow-soft", "--iz-color-warning-surface"],
  ["--iz-color-warning-yellow-pale", "--iz-color-warning"],
  ["--iz-color-warning-yellow-light", "--iz-color-warning"],
  ["--iz-color-warning-yellow", "--iz-color-warning"],
  ["--iz-color-warning-brown-text", "--iz-color-warning-text"],
  ["--iz-color-warning-brown-rich", "--iz-color-warning-text"],
  ["--iz-color-warning-brown-dark", "--iz-color-warning-text"],
  ["--iz-color-warning-brown-deep", "--iz-color-warning-text"],
  ["--iz-color-warning-brown", "--iz-color-warning-text"],
  ["--iz-color-promotion-boost-bg-alt", "--iz-color-warning-surface"],
  ["--iz-color-promotion-boost-bg", "--iz-color-warning-surface"],
  ["--iz-color-filter-tile-bg", "--iz-color-warning-surface"],
  ["--iz-color-gold-highlight", "--iz-color-warning-surface"],
  ["--iz-color-gold-border", "--iz-color-warning-surface"],
  ["--iz-color-gold-muted", "--iz-color-warning-text"],
  ["--iz-color-neutral-gray-pale", "--iz-color-surface-muted"],
  ["--iz-color-neutral-gray-subtle", "--iz-color-surface-muted"],
  ["--iz-color-neutral-gray-surface", "--iz-color-surface-muted"],
  ["--iz-color-neutral-gray-border", "--iz-color-border"],
  ["--iz-color-neutral-gray-dark", "--iz-color-text-secondary"],
  ["--iz-color-neutral-gray-deep", "--iz-color-text-secondary"],
  ["--iz-color-neutral-gray", "--iz-color-text-muted"],
  ["--iz-color-neutral-disabled", "--iz-color-border-strong"],
  ["--iz-color-overlay-dark-strong", "--iz-color-overlay-strong"],
  ["--iz-color-overlay-media-strong", "--iz-color-overlay-strong"],
  ["--iz-color-overlay-ink-heavy", "--iz-color-overlay-strong"],
  ["--iz-color-overlay-ink-strong", "--iz-color-overlay-strong"],
  ["--iz-color-overlay-black-strong", "--iz-color-overlay-strong"],
  ["--iz-color-overlay-black-medium", "--iz-color-overlay"],
  ["--iz-color-overlay-black-soft", "--iz-color-overlay-subtle"],
  ["--iz-color-overlay-backdrop", "--iz-color-overlay"],
  ["--iz-color-overlay-midnight", "--iz-color-overlay"],
  ["--iz-color-overlay-media", "--iz-color-overlay"],
  ["--iz-color-overlay-ink", "--iz-color-overlay"],
  ["--iz-color-overlay-dark", "--iz-color-overlay"],
  ["--iz-color-overlay-hover", "--iz-color-overlay-subtle"],
  ["--iz-color-action-focus-ring", "--iz-color-focus-ring"],
  ["--iz-color-action-border-muted", "--iz-color-focus-ring"],
  ["--iz-color-action-spinner-track", "--iz-color-focus-ring"],
  ["--iz-color-action-outline-muted", "--iz-color-focus-ring"],
  ["--iz-color-action-outline-soft", "--iz-color-focus-ring"],
  ["--iz-color-action-outline", "--iz-color-focus-ring"],
  ["--iz-color-action-selected-strong", "--iz-color-action-soft"],
  ["--iz-color-action-bg-selected-strong", "--iz-color-action-soft"],
  ["--iz-color-action-bg-selected", "--iz-color-action-soft"],
  ["--iz-color-action-bg-active", "--iz-color-action-soft"],
  ["--iz-color-action-bg-hover", "--iz-color-action-soft"],
  ["--iz-color-action-border-strong", "--iz-color-action-border"],
  ["--iz-color-text-tertiary", "--iz-color-text-secondary"],
  ["--iz-color-text-subtle", "--iz-color-text-muted"],
  ["--iz-color-slate-muted", "--iz-color-text-muted"],
  ["--iz-color-surface-subtle", "--iz-color-surface-muted"],
  ["--iz-color-primary-bright", "--iz-color-action"],
  ["--iz-color-action-surface", "--iz-color-action-soft"],
  ["--iz-color-action-light", "--iz-color-action-soft"],
  ["--iz-color-link-hover", "--iz-color-action-hover"],
  ["--iz-color-link-deep", "--iz-color-action"],
  ["--iz-color-info-navy", "--iz-color-info-deep"],
  ["--iz-color-info-bright", "--iz-color-info"],
  ["--iz-color-info-muted", "--iz-color-info-soft"],
  ["--iz-color-info-pale", "--iz-color-info-soft"],
  ["--iz-color-info-light", "--iz-color-info-soft"],
  ["--iz-color-info-lighter", "--iz-color-info-soft"],
  ["--iz-color-info-sky", "--iz-color-info"],
  ["--iz-color-raffle-surface", "--iz-color-warning-surface"],
  ["--iz-color-raffle-border", "--iz-color-warning"],
  ["--iz-color-warning-cream", "--iz-color-warning-surface"],
  ["--iz-color-warning-peach", "--iz-color-warning-surface"],
  ["--iz-color-warning-gold", "--iz-color-warning"],
  ["--iz-color-warning-amber", "--iz-color-warning"],
  ["--iz-color-warning-bright", "--iz-color-warning"],
  ["--iz-color-warning-soft", "--iz-color-warning"],
  ["--iz-color-warning-deep", "--iz-color-warning-text"],
  ["--iz-color-gold-soft", "--iz-color-warning-surface"],
  ["--iz-color-gold-deep", "--iz-color-warning"],
  ["--iz-color-star-muted", "--iz-color-border-strong"],
  ["--iz-color-border-subtle", "--iz-color-border"],
  ["--iz-color-border-muted", "--iz-color-border"],
  ["--iz-color-slate", "--iz-color-text-secondary"],
  ["--iz-color-surface-alt", "--iz-color-surface-elevated"],
  ["--iz-color-near-black", "--iz-color-ink"],
  ["--iz-color-midnight", "--iz-color-ink"],
  ["--iz-color-black", "--iz-color-ink"],
  ["--iz-color-premium", "--iz-color-warning"],
  ["--iz-color-gold", "--iz-color-warning"],
  ["--iz-color-star", "--iz-color-warning"],
  ["--iz-color-canvas-text", "--iz-color-text"],
  ["--iz-color-canvas", "--iz-color-surface"],
  ["--iz-color-banner-gradient-end", "--iz-color-danger-surface"],
  ["--iz-color-banner-badge-text", "--iz-color-danger-text"],
  ["--iz-color-banner-accent-hover", "--iz-color-danger"],
  ["--iz-color-banner-accent-soft", "--iz-color-danger-surface"],
  ["--iz-color-banner-accent", "--iz-color-danger"],
  ["--iz-color-accent-purple-shadow-strong", "--iz-color-accent-shadow-strong"],
  ["--iz-color-accent-purple-shadow", "--iz-color-accent-shadow"],
  ["--iz-color-accent-indigo-shadow", "--iz-color-accent-shadow"],
  ["--iz-color-accent-success-shadow", "--iz-color-accent-shadow"],
  ["--iz-color-accent-installment-shadow", "--iz-color-overlay-strong"],
  ["--iz-color-accent-purple-ring-soft", "--iz-color-accent-ring-soft"],
  ["--iz-color-accent-purple-ring", "--iz-color-accent-ring"],
  ["--iz-color-on-accent", "--iz-color-on-contrast"],
  ["--iz-color-info-softer", "--iz-color-info-soft"],
  ["--iz-color-social-twitter", "--iz-color-info"],
  ["--iz-color-near-black", "--iz-color-ink"],
];

const SKIP_FILES = new Set([
  path.normalize(path.join(SRC_ROOT, "shared/styles/designTokens.css")),
]);

const walk = (dir, files = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".css")) {
      files.push(fullPath);
    }
  }
  return files;
};

const applyReplacements = (content) => {
  let next = content;
  for (const [from, to] of TOKEN_REPLACEMENTS) {
    next = next.replaceAll(from, to);
  }
  return next;
};

let changedFiles = 0;

for (const filePath of walk(SRC_ROOT)) {
  if (SKIP_FILES.has(path.normalize(filePath))) {
    continue;
  }

  const original = fs.readFileSync(filePath, "utf8");
  const updated = applyReplacements(original);
  if (updated !== original) {
    fs.writeFileSync(filePath, updated, "utf8");
    changedFiles += 1;
    console.log(`updated ${path.relative(SRC_ROOT, filePath)}`);
  }
}

console.log(`done: ${changedFiles} files updated`);
