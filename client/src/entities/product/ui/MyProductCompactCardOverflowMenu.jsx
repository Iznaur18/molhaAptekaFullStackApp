import { useEffect, useId, useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";

import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/AppIcon.jsx";

/**
 * @param {{
 *   showCopy: boolean;
 *   showDelete: boolean;
 *   isDeletePending?: boolean;
 *   hasOpenSales?: boolean;
 *   disabled?: boolean;
 *   onCopyProduct?: () => void;
 *   onDeleteProduct?: () => void;
 * }} props
 */
export function MyProductCompactCardOverflowMenu({
  showCopy,
  showDelete,
  isDeletePending = false,
  hasOpenSales = false,
  disabled = false,
  onCopyProduct,
  onDeleteProduct,
}) {
  const menuId = useId();
  const rootRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
    setIsDeleteConfirmOpen(false);
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    const onPointerDown = (event) => {
      const root = rootRef.current;
      if (root && !root.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [isOpen]);

  if (!showCopy && !showDelete) {
    return null;
  }

  const deleteLocked = hasOpenSales === true;
  const actionsDisabled = disabled || isDeletePending;

  const handleToggle = () => {
    if (actionsDisabled) {
      return;
    }
    if (isOpen) {
      closeMenu();
      return;
    }
    setIsOpen(true);
  };

  const handleCopy = () => {
    closeMenu();
    onCopyProduct?.();
  };

  const handleDeleteIntent = () => {
    if (deleteLocked || actionsDisabled) {
      return;
    }
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    closeMenu();
    onDeleteProduct?.();
  };

  return (
    <div className="my-product-compact-card__more" ref={rootRef}>
      <button
        type="button"
        className="my-product-compact-card__more-btn"
        aria-label={PRODUCT_CARD_UI.MORE_ACTIONS_ARIA}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        disabled={actionsDisabled}
        onClick={handleToggle}
      >
        <AppIcon icon={EllipsisVertical} size="sm" />
      </button>

      {isOpen ? (
        <div
          id={menuId}
          className="my-product-compact-card__menu"
          role="menu"
          aria-label={PRODUCT_CARD_UI.MORE_ACTIONS_ARIA}
        >
          {isDeletePending ? (
            <p className="my-product-compact-card__menu-pending" role="status">
              {PRODUCT_CARD_UI.DELETE_PRODUCT_PENDING}
            </p>
          ) : isDeleteConfirmOpen ? (
            <div
              className="my-product-compact-card__menu-confirm"
              role="group"
              aria-label={PRODUCT_CARD_UI.DELETE_CONFIRM_QUESTION}
            >
              <p className="my-product-compact-card__menu-confirm-question">
                {PRODUCT_CARD_UI.DELETE_CONFIRM_QUESTION}
              </p>
              <div className="my-product-compact-card__menu-confirm-actions">
                <button
                  type="button"
                  className="my-product-compact-card__menu-confirm-cancel"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                >
                  {PRODUCT_CARD_UI.DELETE_CONFIRM_CANCEL}
                </button>
                <button
                  type="button"
                  className="my-product-compact-card__menu-confirm-yes"
                  onClick={handleDeleteConfirm}
                >
                  {PRODUCT_CARD_UI.DELETE_CONFIRM_YES}
                </button>
              </div>
            </div>
          ) : (
            <>
              {showCopy ? (
                <button
                  type="button"
                  className="my-product-compact-card__menu-item"
                  role="menuitem"
                  onClick={handleCopy}
                >
                  {PRODUCT_CARD_UI.COPY_PRODUCT}
                </button>
              ) : null}
              {showDelete ? (
                <>
                  <button
                    type="button"
                    className="my-product-compact-card__menu-item my-product-compact-card__menu-item--danger"
                    role="menuitem"
                    disabled={deleteLocked}
                    onClick={handleDeleteIntent}
                  >
                    {PRODUCT_CARD_UI.DELETE_PRODUCT_MENU}
                  </button>
                  {deleteLocked ? (
                    <p className="my-product-compact-card__menu-hint">
                      {PRODUCT_CARD_UI.OPEN_SALES_LOCKED_HINT}
                    </p>
                  ) : null}
                </>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
