import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.join(__dirname, "../src");

/** @type {Record<string, string>} */
const HEX_REPLACEMENTS = {
  "#ffffff": "var(--iz-color-on-contrast)",
  "#fff": "var(--iz-color-on-contrast)",
  "#111827": "var(--iz-color-text)",
  "#1f6feb": "var(--iz-color-action)",
  "#1557b3": "var(--iz-color-action-hover)",
  "#2563eb": "var(--iz-color-link)",
  "#1d4ed8": "var(--iz-color-link-hover)",
  "#3b82f6": "var(--iz-color-primary-bright)",
  "#284b7e": "var(--iz-color-primary)",
  "#4f46e5": "var(--iz-color-link-deep)",
  "#60a5fa": "var(--iz-color-action-light)",
  "#93c5fd": "var(--iz-color-action-light)",
  "#6b7280": "var(--iz-color-text-muted)",
  "#374151": "var(--iz-color-text-secondary)",
  "#4b5563": "var(--iz-color-text-tertiary)",
  "#64748b": "var(--iz-color-text-subtle)",
  "#9ca3af": "var(--iz-color-text-placeholder)",
  "#0f172a": "var(--iz-color-ink)",
  "#1e3a5f": "var(--iz-color-primary)",
  "#334155": "var(--iz-color-slate)",
  "#475569": "var(--iz-color-slate-muted)",
  "#e5e7eb": "var(--iz-color-border)",
  "#d1d5db": "var(--iz-color-border-strong)",
  "#e2e8f0": "var(--iz-color-border-subtle)",
  "#cbd5e1": "var(--iz-color-border-muted)",
  "#f5fbff": "var(--iz-color-bg)",
  "#f9fafb": "var(--iz-color-surface-muted)",
  "#f3f4f6": "var(--iz-color-surface-subtle)",
  "#f8fafc": "var(--iz-color-surface-elevated)",
  "#f1f5f9": "var(--iz-color-surface-alt)",
  "#eff6ff": "var(--iz-color-action-soft)",
  "#dbeafe": "var(--iz-color-action-border)",
  "#c62828": "var(--iz-color-danger)",
  "#b42318": "var(--iz-color-danger-strong)",
  "#b91c1c": "var(--iz-color-danger-deep)",
  "#991b1b": "var(--iz-color-danger-text)",
  "#dc2626": "var(--iz-color-danger-accent)",
  "#fee2e2": "var(--iz-color-danger-soft)",
  "#fecaca": "var(--iz-color-danger-border)",
  "#fef2f2": "var(--iz-color-danger-surface)",
  "#16a34a": "var(--iz-color-success)",
  "#047857": "var(--iz-color-success-strong)",
  "#ecfdf5": "var(--iz-color-success-soft)",
  "#067647": "var(--iz-color-success-strong)",
  "#d97706": "var(--iz-color-warning)",
  "#92400e": "var(--iz-color-warning-text)",
  "#fbbf24": "var(--iz-color-warning-soft)",
  "#7c3aed": "var(--iz-color-accent-purple)",
  "#ede9fe": "var(--iz-color-accent-purple-soft)",
  "#ddd6fe": "var(--iz-color-accent-purple-hover)",
  "#5b21b6": "var(--iz-color-accent-purple-text)",
  "#f87171": "var(--iz-color-danger-border)",
  "#000": "var(--iz-color-black)",
  "#000000": "var(--iz-color-black)",
  "#111": "var(--iz-color-near-black)",
  "#111111": "var(--iz-color-near-black)",
  "#020617": "var(--iz-color-midnight)",
  "#1e3a8a": "var(--iz-color-info-navy)",
  "#1e40af": "var(--iz-color-info-deep)",
  "#0369a1": "var(--iz-color-info)",
  "#0ea5e9": "var(--iz-color-info-bright)",
  "#0284c7": "var(--iz-color-info-sky)",
  "#bfdbfe": "var(--iz-color-info-muted)",
  "#e0f2fe": "var(--iz-color-info-soft)",
  "#f0f9ff": "var(--iz-color-info-pale)",
  "#7dd3fc": "var(--iz-color-info-light)",
  "#bae6fd": "var(--iz-color-info-lighter)",
  "#166534": "var(--iz-color-success-muted)",
  "#86efac": "var(--iz-color-success-light)",
  "#059669": "var(--iz-color-success-bright)",
  "#15803d": "var(--iz-color-success-deep)",
  "#22c55e": "var(--iz-color-success-vivid)",
  "#dcfce7": "var(--iz-color-success-pale)",
  "#f0fdf4": "var(--iz-color-success-surface)",
  "#ecfdf3": "var(--iz-color-success-mint)",
  "#027a48": "var(--iz-color-success-mint-deep)",
  "#065f46": "var(--iz-color-success-forest)",
  "#0f766e": "var(--iz-color-success-teal)",
  "#0d9488": "var(--iz-color-success-teal-bright)",
  "#1b7a3d": "var(--iz-color-success-deep)",
  "#d4af37": "var(--iz-color-gold)",
  "#d4a017": "var(--iz-color-gold-deep)",
  "#7a5a00": "var(--iz-color-gold-muted)",
  "#fef3c7": "var(--iz-color-gold-soft)",
  "#fde68a": "var(--iz-color-gold-border)",
  "#ffefb8": "var(--iz-color-gold-highlight)",
  "#e8d48a": "var(--iz-color-gold)",
  "#e8b82e": "var(--iz-color-gold)",
  "#e8a317": "var(--iz-color-gold-deep)",
  "#d49212": "var(--iz-color-warning-gold)",
  "#edc93a": "var(--iz-color-star)",
  "#ffefaf": "var(--iz-color-gold-highlight)",
  "#ffecb8": "var(--iz-color-gold-highlight)",
  "#6d28d9": "var(--iz-color-premium-purple)",
  "#f5f3ff": "var(--iz-color-premium-purple-soft)",
  "#c4b5fd": "var(--iz-color-premium-purple-muted)",
  "#a78bfa": "var(--iz-color-premium-purple-light)",
  "#4338ca": "var(--iz-color-premium-indigo)",
  "#eef2ff": "var(--iz-color-premium-indigo-soft)",
  "#c7d2fe": "var(--iz-color-premium-indigo-muted)",
  "#a5b4fc": "var(--iz-color-premium-indigo-muted)",
  "#b45309": "var(--iz-color-warning-deep)",
  "#f59e0b": "var(--iz-color-warning-bright)",
  "#eab308": "var(--iz-color-warning-amber)",
  "#ca8a04": "var(--iz-color-warning-gold)",
  "#facc15": "var(--iz-color-warning-yellow)",
  "#fde047": "var(--iz-color-warning-yellow-pale)",
  "#fcd34d": "var(--iz-color-warning-yellow-light)",
  "#fefce8": "var(--iz-color-warning-yellow-soft)",
  "#fef0c7": "var(--iz-color-warning-cream)",
  "#ffedd5": "var(--iz-color-warning-peach)",
  "#78350f": "var(--iz-color-warning-brown)",
  "#93370d": "var(--iz-color-warning-brown-deep)",
  "#854d0e": "var(--iz-color-warning-brown-dark)",
  "#8f4915": "var(--iz-color-warning-brown-rich)",
  "#422006": "var(--iz-color-warning-brown-text)",
  "#9a3412": "var(--iz-color-warning-brown-deep)",
  "#fca5a5": "var(--iz-color-danger-coral)",
  "#d92d20": "var(--iz-color-danger-rose)",
  "#912018": "var(--iz-color-danger-rose-deep)",
  "#be123c": "var(--iz-color-danger-rose-dark)",
  "#fef3f2": "var(--iz-color-danger-blush)",
  "#fee4e2": "var(--iz-color-danger-blush-deep)",
  "#fda29b": "var(--iz-color-danger-salmon)",
  "#fecdca": "var(--iz-color-danger-salmon-soft)",
  "#fecdd3": "var(--iz-color-danger-pink)",
  "#db2777": "var(--iz-color-accent-pink)",
  "#9d174d": "var(--iz-color-accent-pink-deep)",
  "#fce7f3": "var(--iz-color-accent-pink-soft)",
  "#faf5ff": "var(--iz-color-accent-pink-surface)",
  "#e9d5ff": "var(--iz-color-accent-pink-lavender)",
  "#f8f4ff": "var(--iz-color-accent-pink-lilac)",
  "#94a3b8": "var(--iz-color-neutral-gray)",
  "#667085": "var(--iz-color-neutral-gray-deep)",
  "#344054": "var(--iz-color-neutral-gray-dark)",
  "#d0d5dd": "var(--iz-color-neutral-gray-border)",
  "#e8edf5": "var(--iz-color-neutral-gray-surface)",
  "#eef2f7": "var(--iz-color-neutral-gray-subtle)",
  "#f2f4f7": "var(--iz-color-neutral-gray-pale)",
  "#ccc": "var(--iz-color-neutral-disabled)",
  "#cccccc": "var(--iz-color-neutral-disabled)",
  "#1d9bf0": "var(--iz-color-social-twitter)",
  "#d1fae5": "var(--iz-color-success-pale)",
};

/** @type {Record<string, string>} */
const RGBA_REPLACEMENTS = {
  "rgba(17, 24, 39, 0.55)": "var(--iz-color-overlay-backdrop)",
  "rgba(17, 24, 39, 0.28)": "var(--iz-shadow-dialog)",
  "rgba(17, 24, 39, 0.18)": "var(--iz-shadow-select)",
  "rgba(17, 24, 39, 0.08)": "var(--iz-color-overlay-hover)",
  "rgba(17, 24, 39, 0.06)": "var(--iz-color-overlay-subtle)",
  "rgba(31, 111, 235, 0.45)": "var(--iz-color-action-border-strong)",
  "rgba(31, 111, 235, 0.28)": "var(--iz-color-action-border-muted)",
  "rgba(31, 111, 235, 0.25)": "var(--iz-color-action-spinner-track)",
  "rgba(31, 111, 235, 0.2)": "var(--iz-color-action-bg-selected-strong)",
  "rgba(31, 111, 235, 0.15)": "var(--iz-color-action-focus-ring)",
  "rgba(31, 111, 235, 0.12)": "var(--iz-color-action-bg-selected)",
  "rgba(31, 111, 235, 0.1)": "var(--iz-color-action-bg-active)",
  "rgba(31, 111, 235, 0.08)": "var(--iz-color-action-bg-hover)",
  "rgba(31, 111, 235, 0.06)": "var(--iz-color-action-bg-hover)",
  "rgba(59, 130, 246, 0.12)": "var(--iz-color-status-info-soft)",
  "rgba(245, 158, 11, 0.15)": "var(--iz-color-status-warning-soft)",
  "rgba(124, 58, 237, 0.12)": "var(--iz-color-status-purple-soft)",
  "rgba(124, 58, 237, 0.1)": "var(--iz-color-accent-purple-ring-soft)",
  "rgba(16, 185, 129, 0.15)": "var(--iz-color-status-success-soft)",
  "rgba(180, 35, 24, 0.4)": "var(--iz-color-status-danger-border)",
  "rgba(180, 35, 24, 0.12)": "var(--iz-color-status-danger-soft)",
  "rgba(180, 35, 24, 0.08)": "var(--iz-color-status-danger-surface)",
  "rgba(180, 35, 24, 0.06)": "var(--iz-color-status-danger-subtle)",
  "rgba(180, 83, 9, 0.45)": "var(--iz-color-status-warning-border)",
  "rgba(180, 83, 9, 0.08)": "var(--iz-color-status-warning-surface)",
  "rgba(55, 65, 81, 0.12)": "var(--iz-color-status-neutral-soft)",
  "rgba(8, 16, 30, 0.5)": "var(--iz-color-overlay-midnight)",
  "rgba(0, 0, 0, 0.5)": "var(--iz-color-overlay-dark)",
  "rgba(0, 0, 0, 0.12)": "var(--iz-color-overlay-border)",
  "rgba(0, 0, 0, 0.1)": "var(--iz-color-overlay-border)",
  "rgba(255, 255, 255, 0.35)": "var(--iz-color-overlay-white-border)",
  "rgba(255, 255, 255, 0.92)": "var(--iz-color-overlay-white)",
  "rgb(17 24 39 / 8%)": "var(--iz-color-overlay-hover)",
  "rgb(17 24 39 / 12%)": "var(--iz-shadow-media)",
  "rgb(15 23 42 / 0.04)": "var(--iz-shadow-card-subtle)",
  "rgb(15 23 42 / 4%)": "var(--iz-shadow-card-subtle)",
  "rgb(15 23 42 / 0.05)": "var(--iz-shadow-card)",
  "rgb(15 23 42 / 5%)": "var(--iz-shadow-card)",
  "rgb(15 23 42 / 8%)": "var(--iz-color-overlay-hover)",
  "rgb(15 23 42 / 0.08)": "var(--iz-color-overlay-hover)",
  "rgb(15 23 42 / 0.12)": "var(--iz-shadow-card-hover)",
  "rgb(15 23 42 / 12%)": "var(--iz-shadow-category-tile)",
  "rgb(15 23 42 / 0.14)": "var(--iz-shadow-panel)",
  "rgb(15 23 42 / 0.2)": "var(--iz-shadow-dialog-dark)",
  "rgb(15 23 42 / 20%)": "var(--iz-shadow-dialog-dark)",
  "rgb(15 23 42 / 0.45)": "var(--iz-color-overlay-ink)",
  "rgb(15 23 42 / 45%)": "var(--iz-color-overlay-ink)",
  "rgb(15 23 42 / 72%)": "var(--iz-color-overlay-ink-strong)",
  "rgb(15 23 42 / 88%)": "var(--iz-color-overlay-ink-heavy)",
  "rgb(15 23 42 / 7%)": "var(--iz-shadow-lg)",
  "rgb(15 23 42 / 10%)": "var(--iz-shadow-md)",
  "rgb(0 0 0 / 12%)": "var(--iz-shadow-suggest)",
  "rgb(0 0 0 / 18%)": "var(--iz-color-overlay-black-soft)",
  "rgb(0 0 0 / 20%)": "var(--iz-shadow-story)",
  "rgb(0 0 0 / 28%)": "var(--iz-shadow-badge)",
  "rgb(0 0 0 / 35%)": "var(--iz-shadow-focus-neutral)",
  "rgb(0 0 0 / 45%)": "var(--iz-color-overlay-black-strong)",
  "rgb(0 0 0 / 52%)": "var(--iz-color-overlay-media)",
  "rgb(0 0 0 / 55%)": "var(--iz-color-overlay-dark-strong)",
  "rgb(0 0 0 / 72%)": "var(--iz-color-overlay-media-strong)",
  "rgb(0 0 0 / 80%)": "var(--iz-text-shadow-strong)",
  "rgb(8 16 30 / 50%)": "var(--iz-color-overlay-midnight)",
  "rgb(31 111 235 / 15%)": "var(--iz-color-action-focus-ring)",
  "rgb(31 111 235 / 25%)": "var(--iz-color-action-outline)",
  "rgb(37 99 235 / 12%)": "var(--iz-color-action-outline-soft)",
  "rgb(37 99 235 / 22%)": "var(--iz-color-action-outline-muted)",
  "rgb(37 99 235 / 25%)": "var(--iz-color-action-outline)",
  "rgb(124 58 237 / 12%)": "var(--iz-color-accent-purple-shadow)",
  "rgb(124 58 237 / 22%)": "var(--iz-color-accent-purple-shadow-strong)",
  "rgb(79 70 229 / 10%)": "var(--iz-color-accent-indigo-shadow)",
  "rgb(22 163 74 / 12%)": "var(--iz-color-accent-success-shadow)",
  "rgb(6 20 42 / 26%)": "var(--iz-color-accent-installment-shadow)",
  "rgb(255 255 255 / 14%)": "var(--iz-color-overlay-white-subtle)",
  "rgb(255 255 255 / 25%)": "var(--iz-color-overlay-white-muted)",
  "rgb(255 255 255 / 92%)": "var(--iz-color-overlay-white)",
  "rgb(248 250 252 / 45%)": "var(--iz-color-overlay-slate-border)",
  "rgb(220 38 38 / 85%)": "var(--iz-color-status-danger-strong)",
};

const SHADOW_FIXES = [
  {
    from: "0 10px 28px var(--iz-color-shadow-lg)",
    to: "var(--iz-shadow-lg)",
  },
  {
    from: "0 2px 6px var(--iz-color-shadow-lg)",
    to: "0 2px 6px rgb(15 23 42 / 7%)",
  },
  {
    from: "0 1px 2px rgb(15 23 42 / 0.04)",
    to: "var(--iz-shadow-card-subtle)",
  },
  {
    from: "0 1px 2px rgb(15 23 42 / 0.05)",
    to: "var(--iz-shadow-card)",
  },
  {
    from: "0 6px 18px rgb(15 23 42 / 0.12)",
    to: "var(--iz-shadow-card-hover)",
  },
  {
    from: "0 20px 45px rgba(17, 24, 39, 0.28)",
    to: "var(--iz-shadow-dialog)",
  },
  {
    from: "0 12px 40px rgb(0 0 0 / 20%)",
    to: "var(--iz-shadow-story)",
  },
  {
    from: "0 8px 32px rgb(0 0 0 / 45%)",
    to: "var(--iz-shadow-story-viewer)",
  },
  {
    from: "0 12px 40px rgb(0 0 0 / 35%)",
    to: "var(--iz-shadow-lightbox)",
  },
  {
    from: "0 4px 12px rgb(0 0 0 / 12%)",
    to: "var(--iz-shadow-suggest)",
  },
  {
    from: "0 8px 20px rgb(17 24 39 / 12%)",
    to: "var(--iz-shadow-media)",
  },
  {
    from: "0 4px 14px rgb(15 23 42 / 0.08)",
    to: "var(--iz-shadow-media-soft)",
  },
  {
    from: "0 1px 4px rgb(0 0 0 / 18%)",
    to: "var(--iz-shadow-chip)",
  },
  {
    from: "0 1px 6px rgb(0 0 0 / 28%)",
    to: "var(--iz-shadow-badge)",
  },
  {
    from: "0 8px 20px rgb(79 70 229 / 10%)",
    to: "var(--iz-shadow-category)",
  },
  {
    from: "0 4px 12px rgb(79 70 229 / 10%)",
    to: "var(--iz-shadow-category-soft)",
  },
  {
    from: "0 2px 8px rgb(15 23 42 / 12%)",
    to: "var(--iz-shadow-category-tile)",
  },
  {
    from: "0 10px 28px rgba(17, 24, 39, 0.18)",
    to: "var(--iz-shadow-select)",
  },
  {
    from: "0 12px 32px rgb(15 23 42 / 0.12)",
    to: "var(--iz-shadow-elevated)",
  },
  {
    from: "0 4px 16px rgba(0, 0, 0, 0.1)",
    to: "var(--iz-shadow-popover)",
  },
  {
    from: "0 12px 38px rgb(124 58 237 / 22%)",
    to: "var(--iz-shadow-dialog)",
  },
  {
    from: "0 12px 38px rgb(6 20 42 / 26%)",
    to: "var(--iz-shadow-dialog)",
  },
  {
    from: "0 8px 24px rgb(124 58 237 / 12%)",
    to: "var(--iz-shadow-elevated)",
  },
  {
    from: "0 8px 24px rgb(22 163 74 / 12%)",
    to: "var(--iz-shadow-elevated)",
  },
  {
    from: "0 20px 40px rgb(15 23 42 / 18%)",
    to: "var(--iz-shadow-dialog-alt)",
  },
  {
    from: "0 12px 40px rgb(15 23 42 / 0.2)",
    to: "var(--iz-shadow-dialog-dark)",
  },
  {
    from: "0 0 0 3px rgba(124, 58, 237, 0.12)",
    to: "0 0 0 3px var(--iz-color-accent-purple-ring)",
  },
  {
    from: "0 0 0 3px rgba(124, 58, 237, 0.1)",
    to: "0 0 0 3px var(--iz-color-accent-purple-ring-soft)",
  },
  {
    from: "0 0 0 2px rgb(37 99 235 / 12%)",
    to: "0 0 0 2px var(--iz-color-action-outline-soft)",
  },
  {
    from: "0 0 0 1px rgb(0 0 0 / 35%)",
    to: "var(--iz-shadow-focus-neutral)",
  },
  {
    from: "0 1px 2px rgb(15 23 42 / 8%)",
    to: "var(--iz-shadow-card)",
  },
  {
    from: "0 4px 6px rgb(15 23 42 / 4%),\n    0 12px 24px rgb(15 23 42 / 10%)",
    to: "var(--iz-shadow-dropdown)",
  },
  {
    from: "0 10px 28px rgb(15 23 42 / 0.14),\n    0 3px 10px rgb(15 23 42 / 0.08)",
    to: "var(--iz-shadow-panel)",
  },
  {
    from: "0 6px 18px rgb(15 23 42 / 0.12),\n    0 2px 6px rgb(15 23 42 / 7%)",
    to: "var(--iz-shadow-card-hover)",
  },
  {
    from: "0 1px 2px rgba(15, 23, 42, 0.04)",
    to: "var(--iz-shadow-card-subtle)",
  },
];

/** @type {[string, string][]} */
const STRING_REPLACEMENTS = [
  [
    "linear-gradient(180deg, var(--iz-color-surface-elevated) 0%, var(--iz-color-on-contrast) 70%)",
    "var(--iz-gradient-surface-fade)",
  ],
  [
    "linear-gradient(180deg, var(--iz-color-info-pale) 0%, var(--iz-color-on-contrast) 55%)",
    "var(--iz-gradient-info-panel)",
  ],
  [
    "linear-gradient(180deg, var(--iz-color-promotion-boost-bg) 0%, var(--iz-color-on-contrast) 55%)",
    "var(--iz-gradient-premium-panel)",
  ],
  [
    "linear-gradient(135deg, var(--iz-color-accent-pink-surface) 0%, var(--iz-color-accent-pink-lilac) 55%, Canvas 100%)",
    "var(--iz-gradient-raffle-pink)",
  ],
  [
    "linear-gradient(135deg, var(--iz-color-success-surface) 0%, var(--iz-color-success-soft) 55%, Canvas 100%)",
    "var(--iz-gradient-raffle-success)",
  ],
  [
    "linear-gradient(135deg, var(--iz-color-accent-pink-surface) 0%, var(--iz-color-on-contrast) 55%, var(--iz-color-on-contrast) 100%)",
    "var(--iz-gradient-raffle-modal)",
  ],
  [
    "linear-gradient(165deg, var(--iz-color-surface-elevated) 0%, var(--iz-color-surface-alt) 100%)",
    "var(--iz-gradient-details-price)",
  ],
  [
    "linear-gradient(180deg, var(--iz-color-premium-purple-muted), var(--iz-color-accent-pink-lavender))",
    "var(--iz-gradient-admin-accent)",
  ],
  [
    "linear-gradient(135deg, var(--iz-color-info-navy) 0%, var(--iz-color-accent-purple) 55%, var(--iz-color-accent-pink) 100%)",
    "var(--iz-gradient-app-intro)",
  ],
  [
    "linear-gradient(145deg, var(--iz-color-premium-indigo-soft), var(--iz-color-surface-elevated))",
    "var(--iz-gradient-feed-indigo)",
  ],
  [
    "linear-gradient(145deg, var(--iz-color-gold-soft), var(--iz-color-filter-tile-bg))",
    "var(--iz-gradient-feed-gold)",
  ],
  [
    "linear-gradient(90deg, var(--iz-color-premium-purple-light), var(--iz-color-accent-purple))",
    "var(--iz-gradient-purple-bar)",
  ],
  [
    "linear-gradient(90deg, var(--iz-color-success-light), var(--iz-color-success))",
    "var(--iz-gradient-success-bar)",
  ],
  [
    "linear-gradient(90deg, var(--iz-color-action) 0%, var(--iz-color-action-light) 45%, var(--iz-color-action) 100%)",
    "var(--iz-gradient-header-accent)",
  ],
  [
    "linear-gradient(120deg, var(--iz-color-ink) 0%, var(--iz-color-primary) 55%, var(--iz-color-action) 100%)",
    "var(--iz-gradient-header-brand)",
  ],
  [
    "linear-gradient(180deg, var(--iz-color-primary-bright) 0%, var(--iz-color-action) 100%)",
    "var(--iz-gradient-header-btn)",
  ],
  ["--admin-panel-surface: var(--iz-color-on-contrast)", "--admin-panel-surface: var(--iz-color-surface)"],
  [
    "var(--color-surface, var(--iz-color-on-contrast))",
    "var(--iz-color-surface)",
  ],
  ["CanvasText", "var(--iz-color-canvas-text)"],
  ["Canvas", "var(--iz-color-canvas)"],
];

const EXCLUDED = new Set(["shared/styles/designTokens.css"]);

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
 */
function migrateContent(content) {
  let next = content;

  const hexKeys = Object.keys(HEX_REPLACEMENTS).sort((a, b) => b.length - a.length);
  for (const hex of hexKeys) {
    const token = HEX_REPLACEMENTS[hex];
    const escaped = hex.replace("#", "\\#");
    const pattern = new RegExp(`${escaped}(?![0-9a-f])`, "gi");
    next = next.replace(pattern, token);
  }

  for (const [rgba, token] of Object.entries(RGBA_REPLACEMENTS)) {
    next = next.split(rgba).join(token);
  }

  next = next.replace(/background:\s*var\(--iz-color-on-contrast\)/g, "background: var(--iz-color-surface)");
  next = next.replace(/background-color:\s*var\(--iz-color-on-contrast\)/g, "background-color: var(--iz-color-surface)");

  for (const { from, to } of SHADOW_FIXES) {
    next = next.split(from).join(to);
  }

  const sortedStrings = [...STRING_REPLACEMENTS].sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of sortedStrings) {
    next = next.split(from).join(to);
  }

  return next;
}

const files = collectCssFiles(SRC_ROOT);
let changedCount = 0;

for (const filePath of files) {
  const relative = path.relative(SRC_ROOT, filePath);
  if (isExcluded(relative)) {
    continue;
  }

  const original = fs.readFileSync(filePath, "utf8");
  const migrated = migrateContent(original);
  if (migrated !== original) {
    fs.writeFileSync(filePath, migrated, "utf8");
    changedCount += 1;
  }
}

console.log(`Migrated ${changedCount} CSS files.`);
