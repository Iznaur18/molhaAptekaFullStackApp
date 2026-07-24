/**
 * @param {{
 *   label: string;
 *   variant: string;
 * }} props
 */
export function ProductCompactCardStatusPill({ label, variant }) {
  return (
    <span
      className={[
        "my-product-compact-card__feature-pill",
        `my-product-compact-card__feature-pill--${variant}`,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
