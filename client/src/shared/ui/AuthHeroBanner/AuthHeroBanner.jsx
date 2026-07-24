import "./AuthHeroBanner.css";

/**
 * @param {{
 *   height: number;
 *   imageUrl: string | null;
 *   className?: string;
 * }} props
 */
export function AuthHeroBanner({ height, imageUrl, className = "" }) {
  return (
    <div
      className={["auth-hero", className].filter(Boolean).join(" ")}
      style={{ height }}
    >
      {imageUrl ? (
        <img className="auth-hero__image" src={imageUrl} alt="" />
      ) : (
        <div className="auth-hero__skeleton" aria-hidden="true" />
      )}
    </div>
  );
}
