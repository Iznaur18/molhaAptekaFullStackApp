import "./UserPremiumUi.css";

const SHIELD_CONFIRMED_GREEN = "#16a34a";

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
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill={SHIELD_CONFIRMED_GREEN}
        d="M12 1.5 4 4.5v6.2c0 5.1 3.4 9.9 8 11.3 4.6-1.4 8-6.2 8-11.3V4.5L12 1.5Z"
      />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.2 12.1 10.8 14.6 16 9.4"
      />
    </svg>
  );
}
