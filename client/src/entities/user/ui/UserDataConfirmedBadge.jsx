import "./UserPremiumUi.css";

const VERIFIED_BADGE_BLUE = "#1d9bf0";

/**
 * @param {{ size?: number; className?: string }} props
 */
export function UserDataConfirmedBadge({ size = 18, className = "" }) {
  const svgClass = ["user-data-confirmed-badge", className]
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
        fill={VERIFIED_BADGE_BLUE}
        d="M19.998 3.094 14.638 0l-2.972 5.15H5.455v6.354L0 14.64 3.094 20 0 25.359l5.455 3.137v6.354h6.211L14.638 40l5.36-3.094L25.358 40l3.097-5.15h6.211v-6.354L40 25.359 36.905 20 40 14.641l-5.334-3.137V5.15h-6.74L25.358 0l-5.36 3.094Z"
      />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.5 17.2 25.5 28 14.5"
      />
    </svg>
  );
}
