import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { PRODUCT_BADGE_EXPLAIN_UI } from "../../../shared/config/appUiCopy.js";
import { getTopModalFocusLayer } from "../../../shared/lib/modalFocusStack.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { useWholesalePriceSheetAnimation } from "../../product/ui/useWholesalePriceSheetAnimation.js";
import { resolveProductBadgeExplainSheetContent } from "../lib/resolveProductBadgeExplainSheet.js";
import { useProductBadgeExplainByKeyMap } from "../model/useProductBadgeExplainByKeyMap.js";

import "./ProductBadgeExplainSheet.css";

const TITLE_ID = "product-badge-explain-sheet-title";

/**
 * @param {{
 *   isOpen: boolean;
 *   title: string;
 *   badgeKey: import("@izibuy/shared-lib").ProductBadgeExplainKey | null;
 *   fallbackKey: string;
 *   onClose: () => void;
 * }} props
 */
export function ProductBadgeExplainSheet({
  isOpen,
  title,
  badgeKey,
  fallbackKey,
  onClose,
}) {
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const { mounted, isVisible } = useWholesalePriceSheetAnimation(isOpen);
  // Грузим CMS всегда при маунте sheet-дерева; не ждать только open —
  // иначе первый кадр всегда fallback.
  const adminByKey = useProductBadgeExplainByKeyMap({ enabled: true });

  const content = resolveProductBadgeExplainSheetContent({
    badgeKey,
    fallbackKey,
    adminRow: badgeKey ? adminByKey.get(badgeKey) ?? null : null,
  });

  const imageSrc = content.imageUrl
    ? resolveUploadedImageUrl(content.imageUrl)
    : null;

  useScrollLock(mounted);
  useDialogFocusTrap(panelRef, {
    active: isOpen && isVisible,
    initialFocusRef: closeButtonRef,
  });

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }
      const topLayer = getTopModalFocusLayer();
      if (!topLayer || topLayer.container !== panelRef.current) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      onClose();
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={[
        "product-badge-explain-sheet__backdrop",
        isVisible ? "product-badge-explain-sheet__backdrop--open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="product-badge-explain-sheet__scrim" aria-hidden="true" />
      <button
        type="button"
        className="product-badge-explain-sheet__dismiss"
        aria-label={PRODUCT_BADGE_EXPLAIN_UI.CLOSE}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="product-badge-explain-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        aria-label={PRODUCT_BADGE_EXPLAIN_UI.ARIA_DIALOG}
      >
        {imageSrc ? (
          <div className="product-badge-explain-sheet__media">
            <img
              className="product-badge-explain-sheet__image"
              src={imageSrc}
              alt=""
            />
          </div>
        ) : null}
        <div className="product-badge-explain-sheet__body">
          <h2 id={TITLE_ID} className="product-badge-explain-sheet__title">
            {title}
          </h2>
          <p className="product-badge-explain-sheet__description">{content.description}</p>
        </div>
        <footer className="product-badge-explain-sheet__footer">
          <button
            ref={closeButtonRef}
            type="button"
            className="product-badge-explain-sheet__close"
            onClick={onClose}
          >
            {PRODUCT_BADGE_EXPLAIN_UI.CLOSE}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
