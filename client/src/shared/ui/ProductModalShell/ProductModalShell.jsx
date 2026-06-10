import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { USER_DETAILS_MODAL_UI } from "../../config/appUiCopy.js";
import { useDialogFocusTrap } from "../../lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../lib/useScrollLock.js";
import { ModalCloseIcon } from "../icon/index.js";

import "./ProductModalShell.css";

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   title: string;
 *   titleId: string;
 *   ariaLabel?: string;
 *   children: import('react').ReactNode;
 *   footer?: import('react').ReactNode;
 *   dockedFooter?: import('react').ReactNode;
 *   panelClassName?: string;
 *   bodyClassName?: string;
 *   footerClassName?: string;
 *   bodyRef?: import('react').RefObject<HTMLDivElement | null>;
 *   size?: 'md' | 'lg';
 *   closeOnEscape?: boolean;
 *   hideHeader?: boolean;
 * }} props
 */
export function ProductModalShell({
  isOpen,
  onClose,
  title,
  titleId,
  ariaLabel,
  children,
  footer = null,
  dockedFooter = null,
  panelClassName = "",
  bodyClassName = "",
  footerClassName = "",
  bodyRef = null,
  size = "lg",
  closeOnEscape = true,
  hideHeader = false,
}) {
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));

  useScrollLock(isOpen);
  useDialogFocusTrap(panelRef, {
    active: isOpen,
    initialFocusRef: hideHeader ? panelRef : closeButtonRef,
  });

  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeOnEscape, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const panelClass = [
    "product-modal-shell__panel",
    size === "md" ? "product-modal-shell__panel_md" : "product-modal-shell__panel_lg",
    panelClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const bodyClass = ["product-modal-shell__body", bodyClassName]
    .filter(Boolean)
    .join(" ");

  const footerClass = ["product-modal-shell__footer", footerClassName]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <div className="product-modal-shell__backdrop" role="presentation">
      <div
        ref={panelRef}
        className={panelClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
      >
        {hideHeader ? (
          <h2 id={titleId} className="product-modal-shell__visually-hidden-title">
            {title}
          </h2>
        ) : (
          <header className="product-modal-shell__header">
            <h2 id={titleId} className="product-modal-shell__title">
              {title}
            </h2>
            <button
              ref={closeButtonRef}
              type="button"
              className="product-modal-shell__close"
              onClick={onClose}
              aria-label={USER_DETAILS_MODAL_UI.ARIA_CLOSE}
            >
              <ModalCloseIcon />
            </button>
          </header>
        )}
        <div ref={bodyRef} className={bodyClass}>
          {children}
        </div>
        {footer ? <footer className={footerClass}>{footer}</footer> : null}
      </div>
      {dockedFooter ? (
        <div className="product-modal-shell__docked-footer">{dockedFooter}</div>
      ) : null}
    </div>,
    document.body,
  );
}
