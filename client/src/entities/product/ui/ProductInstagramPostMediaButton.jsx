import { Camera, Play } from "lucide-react";

import { PRODUCT_INSTAGRAM_POST_UI } from "../../../shared/config/appUiCopy.js";

import "./ProductInstagramPostMediaButton.css";

/**
 * @param {{
 *   onClick: (event: import('react').MouseEvent<HTMLButtonElement>) => void;
 *   className?: string;
 *   size?: "card" | "detail";
 * }} props
 */
export function ProductInstagramPostMediaButton({
  onClick,
  className = "",
  size = "card",
}) {
  return (
    <button
      type="button"
      className={[
        "product-instagram-post-media-btn",
        size === "detail" ? "product-instagram-post-media-btn--detail" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={PRODUCT_INSTAGRAM_POST_UI.OPEN_BUTTON_ARIA}
      onClick={onClick}
    >
      <span className="product-instagram-post-media-btn__play" aria-hidden="true">
        <Play size={size === "detail" ? 18 : 14} strokeWidth={2.5} fill="currentColor" />
      </span>
      <span className="product-instagram-post-media-btn__ig" aria-hidden="true">
        <Camera size={size === "detail" ? 12 : 10} strokeWidth={2.25} />
      </span>
    </button>
  );
}
