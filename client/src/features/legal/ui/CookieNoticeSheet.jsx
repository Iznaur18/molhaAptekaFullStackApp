import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

import { COOKIE_NOTICE_UI } from "../../../shared/config/appUiCopy.js";
import { getTopModalFocusLayer } from "../../../shared/lib/modalFocusStack.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { useWholesalePriceSheetAnimation } from "../../../entities/product/ui/useWholesalePriceSheetAnimation.js";
import { COOKIE_NOTICE_DESCRIPTION } from "../model/cookieNoticeContent.js";

import "./CookieNoticeSheet.css";

const TITLE_ID = "cookie-notice-sheet-title";

/**
 * @param {{
 *   isOpen: boolean;
 *   onAccept: () => void;
 * }} props
 */
export function CookieNoticeSheet({ isOpen, onAccept }) {
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const acceptButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const { mounted, isVisible } = useWholesalePriceSheetAnimation(isOpen);

  useScrollLock(mounted);
  useDialogFocusTrap(panelRef, {
    active: isOpen && isVisible,
    initialFocusRef: acceptButtonRef,
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
      // Escape = ознакомление (как кнопка «Понятно»), без закрытия «в никуда».
      event.preventDefault();
      event.stopPropagation();
      onAccept();
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, onAccept]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={[
        "cookie-notice-sheet__backdrop",
        isVisible ? "cookie-notice-sheet__backdrop--open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="cookie-notice-sheet__scrim" aria-hidden="true" />
      <div
        ref={panelRef}
        className="cookie-notice-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        aria-label={COOKIE_NOTICE_UI.ARIA_DIALOG}
      >
        <div className="cookie-notice-sheet__body">
          <h2 id={TITLE_ID} className="cookie-notice-sheet__title">
            {COOKIE_NOTICE_UI.TITLE}
          </h2>
          <p className="cookie-notice-sheet__description">
            {COOKIE_NOTICE_DESCRIPTION}
          </p>
          <Link
            className="cookie-notice-sheet__privacy-link"
            to="/legal/privacy"
            onClick={onAccept}
          >
            {COOKIE_NOTICE_UI.PRIVACY_LINK}
          </Link>
        </div>
        <footer className="cookie-notice-sheet__footer">
          <button
            ref={acceptButtonRef}
            type="button"
            className="cookie-notice-sheet__accept"
            onClick={onAccept}
          >
            {COOKIE_NOTICE_UI.ACCEPT}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
