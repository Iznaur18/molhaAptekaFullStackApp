import { useEffect, useRef, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

import { SELLER_PRODUCTS_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { copyAndShareUrl } from "../../../shared/lib/shareOrCopyUrl.js";
import { buildSellerProductsPath } from "../../../shared/lib/sellerPaths.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";

import "./SellerShareLinkButton.css";

const COPIED_ICON_MS = 1600;

/**
 * Шаринг витрины `/seller/:id` — паритет с ProductShareLinkButton.
 *
 * @param {{
 *   sellerId: string;
 *   sellerName?: string;
 *   variant?: "banner" | "meta";
 * }} props
 */
export function SellerShareLinkButton({
  sellerId,
  sellerName = "",
  variant = "banner",
}) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null));

  useEffect(() => {
    return () => {
      if (resetTimerRef.current != null) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const id = String(sellerId ?? "").trim();
  if (!id) {
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
    const path = buildSellerProductsPath(id);
    const url = `${origin}${path}`;
    const title = String(sellerName ?? "").trim();

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
        console.error("Seller share failed", error);
      });
  };

  const rootClassName = [
    "seller-share-link",
    variant === "banner" ? "seller-share-link--banner" : "seller-share-link--meta",
    copied ? "seller-share-link--copied" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const idleIcon = variant === "meta" ? Share2 : Link2;

  return (
    <button
      type="button"
      className={rootClassName}
      aria-label={
        copied
          ? SELLER_PRODUCTS_PAGE_UI.SHARE_LINK_COPIED_ARIA
          : SELLER_PRODUCTS_PAGE_UI.SHARE_LINK_ARIA
      }
      onClick={handleClick}
    >
      <AppIcon
        icon={copied ? Check : idleIcon}
        size="lg"
        strokeWidth={2.1}
        className="seller-share-link__icon"
      />
    </button>
  );
}
