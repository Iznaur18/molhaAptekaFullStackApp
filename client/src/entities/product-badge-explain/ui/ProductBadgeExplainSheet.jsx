import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { PRODUCT_BADGE_EXPLAIN_UI } from "../../../shared/config/appUiCopy.js";
import { getTopModalFocusLayer } from "../../../shared/lib/modalFocusStack.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import {
  formatRuPhoneDisplayOrEmpty,
  toRuPhoneTelHref,
} from "../../user/lib/ruPhone.js";
import { fetchUserPhone } from "../../user/api/fetchUserPhone.js";
import { useWholesalePriceSheetAnimation } from "../../product/ui/useWholesalePriceSheetAnimation.js";
import { resolveProductBadgeExplainSheetContent } from "../lib/resolveProductBadgeExplainSheet.js";
import { useProductBadgeExplainByKeyMap } from "../model/useProductBadgeExplainByKeyMap.js";

import "./ProductBadgeExplainSheet.css";

const TITLE_ID = "product-badge-explain-sheet-title";

/**
 * @param {{
 *   isOpen: boolean;
 *   title: string;
 *   badgeKey?: import("@izibuy/shared-lib").ProductBadgeExplainKey | null;
 *   fallbackKey?: string;
 *   description?: string | null;
 *   contactSellerUserId?: string | null;
 *   onClose: () => void;
 *   primaryActionLabel?: string | null;
 *   onPrimaryAction?: () => void;
 * }} props
 */
export function ProductBadgeExplainSheet({
  isOpen,
  title,
  badgeKey = null,
  fallbackKey = "listing_origin_unspecified",
  description = null,
  contactSellerUserId = null,
  onClose,
  primaryActionLabel = null,
  onPrimaryAction,
}) {
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLElement | null} */ (null));
  const { mounted, isVisible } = useWholesalePriceSheetAnimation(isOpen);
  const descriptionOverride =
    typeof description === "string" ? description.trim() : "";
  const hasDescriptionOverride = descriptionOverride.length > 0;
  const adminByKey = useProductBadgeExplainByKeyMap({
    enabled: !hasDescriptionOverride,
  });

  const sellerId =
    typeof contactSellerUserId === "string" ? contactSellerUserId.trim() : "";
  const contactMode = sellerId.length > 0;

  const [revealedPhone, setRevealedPhone] = useState(
    /** @type {string | null} */ (null),
  );
  const [contactPending, setContactPending] = useState(false);
  const [contactError, setContactError] = useState("");

  const resolvedContent = resolveProductBadgeExplainSheetContent({
    badgeKey,
    fallbackKey,
    adminRow: badgeKey ? adminByKey.get(badgeKey) ?? null : null,
  });
  const content = hasDescriptionOverride
    ? { description: descriptionOverride, imageUrl: null }
    : resolvedContent;

  const imageSrc = content.imageUrl
    ? resolveUploadedImageUrl(content.imageUrl)
    : null;

  useEffect(() => {
    if (!isOpen) {
      setRevealedPhone(null);
      setContactPending(false);
      setContactError("");
    }
  }, [isOpen]);

  useEffect(() => {
    setRevealedPhone(null);
    setContactPending(false);
    setContactError("");
  }, [sellerId, badgeKey]);

  useScrollLock(mounted);
  useDialogFocusTrap(panelRef, {
    active: isOpen && isVisible,
    initialFocusRef: closeButtonRef,
    countsAsBlockingOverlay: !onPrimaryAction,
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

  const handleContact = async () => {
    if (!sellerId || contactPending) {
      return;
    }
    setContactPending(true);
    setContactError("");
    try {
      const phone = await fetchUserPhone(sellerId);
      setRevealedPhone(phone);
    } catch (error) {
      setContactError(
        error instanceof Error
          ? error.message
          : PRODUCT_BADGE_EXPLAIN_UI.CONTACT_ERROR,
      );
    } finally {
      setContactPending(false);
    }
  };

  if (!mounted) {
    return null;
  }

  const phoneHref = revealedPhone ? toRuPhoneTelHref(revealedPhone) : null;
  const phoneDisplay = revealedPhone
    ? formatRuPhoneDisplayOrEmpty(revealedPhone)
    : "";

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
          <p className="product-badge-explain-sheet__description">
            {content.description}
          </p>
        </div>
        <footer className="product-badge-explain-sheet__footer">
          {contactMode && phoneHref && phoneDisplay ? (
            <a
              ref={closeButtonRef}
              className="product-badge-explain-sheet__close product-badge-explain-sheet__close--phone"
              href={phoneHref}
            >
              {phoneDisplay}
            </a>
          ) : contactMode ? (
            <>
              <button
                ref={closeButtonRef}
                type="button"
                className="product-badge-explain-sheet__close"
                disabled={contactPending}
                onClick={() => {
                  void handleContact();
                }}
              >
                {contactPending
                  ? PRODUCT_BADGE_EXPLAIN_UI.CONTACT_PENDING
                  : PRODUCT_BADGE_EXPLAIN_UI.CONTACT}
              </button>
              {contactError ? (
                <p className="product-badge-explain-sheet__error" role="alert">
                  {contactError}
                </p>
              ) : null}
            </>
          ) : onPrimaryAction ? (
            <button
              ref={closeButtonRef}
              type="button"
              className="product-badge-explain-sheet__close"
              onClick={onPrimaryAction}
            >
              {primaryActionLabel || PRODUCT_BADGE_EXPLAIN_UI.CLOSE}
            </button>
          ) : (
            <button
              ref={closeButtonRef}
              type="button"
              className="product-badge-explain-sheet__close"
              onClick={onClose}
            >
              {PRODUCT_BADGE_EXPLAIN_UI.CLOSE}
            </button>
          )}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
