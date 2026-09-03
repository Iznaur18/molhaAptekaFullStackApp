import { resolveSafeDealBadgeCopy } from "../lib/safeDealBadgeCopy.js";

import "./SafeDealSellerBadge.css";

const SAFE_DEAL_BADGE_GREEN = "#15803d";

/**
 * Щит рядом с именем продавца — там же, где премиум и «данные подтверждены».
 *
 * Цвет задан явно, а не токеном: значок опознают по форме и зелёному щиту, и
 * в тёмной теме он должен остаться тем же самым.
 *
 * @param {{ size?: number; className?: string }} props
 */
export function SafeDealSellerBadge({ size = 18, className = "" }) {
  const svgClass = ["safe-deal-seller-badge", className].filter(Boolean).join(" ");

  return (
    <svg
      className={svgClass}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path fill={SAFE_DEAL_BADGE_GREEN} d="M12 1.5 3.5 5v6.2c0 5.3 3.6 9.7 8.5 11.3 4.9-1.6 8.5-6 8.5-11.3V5L12 1.5Z" />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12.2 10.9 15 16 9.4"
      />
    </svg>
  );
}

/**
 * @param {{ hasSafeDeal?: boolean; size?: number; className?: string }} props
 */
export function SafeDealSellerBadgeMark({ hasSafeDeal = false, size = 18, className = "" }) {
  if (!hasSafeDeal) {
    return null;
  }
  const copy = resolveSafeDealBadgeCopy();
  return (
    <span
      className={["safe-deal-seller-badge__mark", className].filter(Boolean).join(" ")}
      aria-label={copy.SHORT_ARIA}
      title={copy.TITLE}
    >
      <SafeDealSellerBadge size={size} />
    </span>
  );
}
