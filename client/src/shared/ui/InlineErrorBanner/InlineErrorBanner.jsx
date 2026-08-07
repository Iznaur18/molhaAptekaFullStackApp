import "./InlineErrorBanner.css";

/**
 * @param {{
 *   children: import('react').ReactNode;
 *   className?: string;
 * }} props
 */
export function InlineErrorBanner({ children, className = "" }) {
  return (
    <div
      className={["inline-error-banner", className].filter(Boolean).join(" ")}
      role="alert"
    >
      <span className="inline-error-banner__mark" aria-hidden="true">
        !
      </span>
      <p className="inline-error-banner__text">{children}</p>
    </div>
  );
}
