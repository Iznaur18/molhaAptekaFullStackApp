import { useMemo } from "react";

import { openProductInstagramPost } from "../lib/openProductInstagramPost.js";
import { resolveProductInstagramPost } from "../lib/resolveProductInstagramPost.js";
import { ProductInstagramPostMediaButton } from "./ProductInstagramPostMediaButton.jsx";

import "./ProductInstagramPostMediaButton.css";

/**
 * @param {{
 *   product: Record<string, unknown>;
 *   size?: "card" | "detail";
 *   className?: string;
 * }} props
 */
export function ProductInstagramPostMediaOverlay({
  product,
  size = "card",
  className = "",
}) {
  const instagramPost = useMemo(() => resolveProductInstagramPost(product), [product]);

  if (!instagramPost) {
    return null;
  }

  return (
    <div
      className={["product-instagram-post-media-slot", className].filter(Boolean).join(" ")}
    >
      <ProductInstagramPostMediaButton
        size={size}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          openProductInstagramPost(instagramPost.postUrl);
        }}
      />
    </div>
  );
}
