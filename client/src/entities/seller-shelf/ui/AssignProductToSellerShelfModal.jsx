import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { patchProductInAllCatalogCaches } from "../../product/lib/catalogProductsQueryCache.js";
import { useWholesalePriceSheetAnimation } from "../../product/ui/useWholesalePriceSheetAnimation.js";
import { SELLER_SHELF_UI } from "../../../shared/config/appUiCopy.js";
import { getTopModalFocusLayer } from "../../../shared/lib/modalFocusStack.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { assignProductToSellerShelf } from "../api/sellerShelfApi.js";
import { requestSellerShelvesPanelExpand } from "../lib/sellerShelvesPanelEvents.js";
import { useMySellerShelvesQuery } from "../model/useMySellerShelvesQuery.js";
import { sellerShelfQueryKeys } from "../model/sellerShelfQueryKeys.js";

import "./AssignProductToSellerShelfModal.css";

/**
 * @param {{
 *   product: import('../../product/model/types.js').ProductFromApi | null;
 *   onClose: () => void;
 *   onSuccess?: (message: string) => void;
 *   onError?: (message: string) => void;
 * }} props
 */
export function AssignProductToSellerShelfModal({
  product,
  onClose,
  onSuccess,
  onError,
}) {
  const titleId = useId();
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const queryClient = useQueryClient();
  const isOpen = Boolean(product);
  const { mounted, isVisible } = useWholesalePriceSheetAnimation(isOpen);
  const shelvesQuery = useMySellerShelvesQuery({ enabled: isOpen });
  const [pendingShelfId, setPendingShelfId] = useState(
    /** @type {string | null} */ (null),
  );

  const shelves = shelvesQuery.data?.shelves ?? [];
  const currentShelfId =
    product?.sellerShelfId != null ? String(product.sellerShelfId) : "";
  const productId = product?._id != null ? String(product._id) : "";

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

  useEffect(() => {
    if (!isOpen || shelvesQuery.isLoading || shelvesQuery.isError) {
      return;
    }
    if (shelves.length > 0) {
      return;
    }
    requestSellerShelvesPanelExpand();
    onSuccess?.(SELLER_SHELF_UI.EMPTY);
    onClose();
  }, [
    isOpen,
    onClose,
    onSuccess,
    shelves.length,
    shelvesQuery.isError,
    shelvesQuery.isLoading,
  ]);

  const assignMutation = useMutation({
    mutationFn: (/** @type {string} */ shelfId) =>
      assignProductToSellerShelf(shelfId, productId),
    onMutate: (shelfId) => {
      setPendingShelfId(shelfId);
    },
    onSuccess: (_data, shelfId) => {
      patchProductInAllCatalogCaches(queryClient, productId, (prev) => ({
        ...prev,
        sellerShelfId: shelfId,
      }));
      void queryClient.invalidateQueries({ queryKey: sellerShelfQueryKeys.mine() });
      const shelfName =
        shelves.find((shelf) => String(shelf._id) === String(shelfId))?.name ?? "";
      onSuccess?.(SELLER_SHELF_UI.ASSIGN_PRODUCT_SUCCESS(shelfName));
      onClose();
    },
    onError: (error) => {
      onError?.(
        error instanceof Error ? error.message : SELLER_SHELF_UI.ASSIGN_PRODUCT_ERROR,
      );
    },
    onSettled: () => {
      setPendingShelfId(null);
    },
  });

  const handlePickShelf = (shelfId) => {
    if (!productId || assignMutation.isPending) {
      return;
    }
    if (String(shelfId) === currentShelfId) {
      onClose();
      return;
    }
    assignMutation.mutate(String(shelfId));
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={[
        "assign-product-to-shelf-modal__backdrop",
        isVisible ? "assign-product-to-shelf-modal__backdrop--open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="assign-product-to-shelf-modal__scrim" aria-hidden="true" />
      <button
        type="button"
        className="assign-product-to-shelf-modal__dismiss"
        aria-label={SELLER_SHELF_UI.ASSIGN_CANCEL}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="assign-product-to-shelf-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="assign-product-to-shelf-modal__body">
          <h2 id={titleId} className="assign-product-to-shelf-modal__title">
            {SELLER_SHELF_UI.ASSIGN_PRODUCT_MODAL_TITLE}
          </h2>
          {shelvesQuery.isLoading ? (
            <p className="assign-product-to-shelf-modal__state">
              {SELLER_SHELF_UI.LOADING}
            </p>
          ) : null}
          {shelvesQuery.isError ? (
            <p className="assign-product-to-shelf-modal__state" role="alert">
              {shelvesQuery.error instanceof Error
                ? shelvesQuery.error.message
                : SELLER_SHELF_UI.LOAD_ERROR}
            </p>
          ) : null}
          {!shelvesQuery.isLoading && shelves.length === 0 ? (
            <p className="assign-product-to-shelf-modal__state">
              {SELLER_SHELF_UI.EMPTY}
            </p>
          ) : null}
          {shelves.length > 0 ? (
            <ul className="assign-product-to-shelf-modal__list" role="list">
              {shelves.map((shelf) => {
                const shelfId = String(shelf._id);
                const isCurrent = shelfId === currentShelfId;
                const isPending = pendingShelfId === shelfId;
                return (
                  <li key={shelfId}>
                    <button
                      type="button"
                      className={[
                        "assign-product-to-shelf-modal__item",
                        isCurrent ? "assign-product-to-shelf-modal__item--current" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      disabled={assignMutation.isPending}
                      aria-current={isCurrent ? "true" : undefined}
                      onClick={() => handlePickShelf(shelfId)}
                    >
                      <span className="assign-product-to-shelf-modal__name">
                        {shelf.name}
                      </span>
                      <span className="assign-product-to-shelf-modal__meta">
                        {isPending
                          ? SELLER_SHELF_UI.ASSIGN_PRODUCT_PENDING
                          : isCurrent
                            ? SELLER_SHELF_UI.ASSIGN_PRODUCT_CURRENT
                            : SELLER_SHELF_UI.PRODUCT_COUNT(shelf.productCount)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
        <footer className="assign-product-to-shelf-modal__footer">
          <button
            ref={closeButtonRef}
            type="button"
            className="assign-product-to-shelf-modal__close"
            onClick={onClose}
          >
            {SELLER_SHELF_UI.ASSIGN_CANCEL}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
