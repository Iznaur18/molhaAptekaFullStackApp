import "./UserPremiumUi.css";

/** Пятиконечная звезда, скругление через stroke-linejoin (viewBox 40×40). */
const PREMIUM_STAR_PATH =
  "M20 6.15 24.05 14.75 33.35 14.75 26.15 20.55 29.15 30.05 20 24.95 10.85 30.05 13.85 20.55 6.65 14.75 15.95 14.75 20 6.15Z";

const PREMIUM_STAR_FILL = "#ffa200";

/**
 * @param {{ size?: number; className?: string }} props
 */
export function UserPremiumVerifiedBadge({ size = 18, className = "" }) {
  const svgClass = ["user-premium-verified-badge", className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      className={svgClass}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={PREMIUM_STAR_PATH}
        fill={PREMIUM_STAR_FILL}
        stroke={PREMIUM_STAR_FILL}
        strokeWidth="5.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
