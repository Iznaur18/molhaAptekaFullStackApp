import { useEffect, useRef, useState } from "react";
import { Check, Link2 } from "lucide-react";

import { PRODUCT_DETAILS_MODAL_UI } from "../../../../shared/config/appUiCopy.js";
import { copyAndShareUrl } from "../../../../shared/lib/shareOrCopyUrl.js";
import { AppIcon } from "../../../../shared/ui/icon/index.js";

import "./ProductShareLinkButton.css";

const COPIED_ICON_MS = 1600;

/**
 * Иконка «Ссылка» в chrome галереи.
 * copy + системный share; share стартует синхронно в клике (user activation).
 *
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 * }} props
 */
export function ProductShareLinkButton({ product }) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null));

  useEffect(() => {
    return () => {
      if (resetTimerRef.current != null) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const productId = String(product?._id ?? "").trim();
  if (!productId) {
    return null;
  }

  const flashCopied = () => {
    setCopied(true);
    if (resetTimerRef.current != null) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => {
      setCopied(false);
      resetTimerRef.current = null;
    }, COPIED_ICON_MS);
  };

  const handleClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/product/${encodeURIComponent(productId)}`;
    const title = String(product.productName ?? "").trim();

    // Не делаем async-обёртку до copyAndShareUrl: первая строка внутри
    // хелпера синхронно зовёт navigator.share.
    void copyAndShareUrl({
      title: title || undefined,
      url,
    })
      .then((result) => {
        if (result === "copied" || result === "shared") {
          flashCopied();
        }
      })
      .catch((error) => {
        console.error("Product share failed", error);
      });
  };

  const rootClassName = [
    "wishlist-toggle",
    "wishlist-toggle--card",
    "product-share-link-toggle",
    copied ? "product-share-link-toggle--copied" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={rootClassName}
      aria-label={
        copied
          ? PRODUCT_DETAILS_MODAL_UI.SHARE_PRODUCT_COPIED_TITLE
          : PRODUCT_DETAILS_MODAL_UI.SHARE_LINK_ARIA
      }
      onClick={handleClick}
    >
      <AppIcon
        icon={copied ? Check : Link2}
        size="lg"
        strokeWidth={2.1}
        className="wishlist-toggle__icon"
      />
    </button>
  );
}
