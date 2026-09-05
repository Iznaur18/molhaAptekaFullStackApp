import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getRuRegionByCode } from "@molha/api-contract";
import { Star } from "lucide-react";

import {
  curatedListContainsProductId,
  sortCuratedListsForProductRegion,
} from "../../curated-product-list/lib/popularProductsListMatch.js";
import { invalidateCuratedProductLists } from "../../curated-product-list/lib/curatedProductListQueryCache.js";
import { useCuratedProductListAdminMutations } from "../../curated-product-list/model/useCuratedProductListAdminMutations.js";
import { useCuratedProductListsAdminQuery } from "../../curated-product-list/model/useCuratedProductListsAdminQuery.js";
import { POPULAR_PRODUCTS_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";

import "./ProductDetailsPopularListsControl.css";

/**
 * @param {{
 *   productId: string;
 *   productRegionCode?: string | null;
 *   disabled?: boolean;
 * }} props
 */
export function ProductDetailsPopularListsControl({
  productId,
  productRegionCode = null,
  disabled = false,
}) {
  const titleId = useId();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState({ error: "", success: "" });
  const [pendingListId, setPendingListId] = useState(
    /** @type {string | null} */ (null),
  );

  const listsQuery = useCuratedProductListsAdminQuery({ enabled: true });
  const { addItemMutation, removeItemMutation } =
    useCuratedProductListAdminMutations();

  const curatedLists = useMemo(
    () =>
      sortCuratedListsForProductRegion(
        listsQuery.data ?? [],
        productRegionCode ?? "",
      ),
    [listsQuery.data, productRegionCode],
  );

  const isInAnyPopularList = useMemo(
    () =>
      curatedLists.some((list) => curatedListContainsProductId(list, productId)),
    [curatedLists, productId],
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const clearFeedback = () => setFeedback({ error: "", success: "" });

  const handleOpen = () => {
    clearFeedback();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setPendingListId(null);
  };

  const runListAction = async (list, isMember) => {
    const listId = String(list._id);
    clearFeedback();
    setPendingListId(listId);
    try {
      if (isMember) {
        await removeItemMutation.mutateAsync({ listId, productId });
        setFeedback({
          error: "",
          success: POPULAR_PRODUCTS_ADMIN_PAGE_UI.DETAILS_REMOVE_SUCCESS,
        });
      } else {
        await addItemMutation.mutateAsync({ listId, productId });
        setFeedback({
          error: "",
          success: POPULAR_PRODUCTS_ADMIN_PAGE_UI.DETAILS_ADD_SUCCESS,
        });
      }
      await invalidateCuratedProductLists(queryClient);
    } catch (e) {
      setFeedback({
        error:
          e instanceof Error
            ? e.message
            : isMember
              ? POPULAR_PRODUCTS_ADMIN_PAGE_UI.REMOVE_ITEM_ERROR
              : POPULAR_PRODUCTS_ADMIN_PAGE_UI.ADD_ITEM_ERROR,
        success: "",
      });
    } finally {
      setPendingListId(null);
    }
  };

  const buttonLabel = isInAnyPopularList
    ? POPULAR_PRODUCTS_ADMIN_PAGE_UI.DETAILS_BUTTON_IN_LIST
    : POPULAR_PRODUCTS_ADMIN_PAGE_UI.DETAILS_BUTTON;

  const modal =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div className="product-details-popular-lists" role="presentation">
            <button
              type="button"
              className="product-details-popular-lists__scrim"
              aria-label={POPULAR_PRODUCTS_ADMIN_PAGE_UI.DETAILS_MODAL_CLOSE}
              onClick={handleClose}
            />
            <div
              className="product-details-popular-lists__panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              <header className="product-details-popular-lists__header">
                <h2 id={titleId} className="product-details-popular-lists__title">
                  {POPULAR_PRODUCTS_ADMIN_PAGE_UI.DETAILS_MODAL_TITLE}
                </h2>
                <button
                  type="button"
                  className="product-details-popular-lists__close"
                  onClick={handleClose}
                >
                  {POPULAR_PRODUCTS_ADMIN_PAGE_UI.DETAILS_MODAL_CLOSE}
                </button>
              </header>
              <p className="product-details-popular-lists__hint">
                {POPULAR_PRODUCTS_ADMIN_PAGE_UI.DETAILS_MODAL_HINT}
              </p>
              {feedback.error ? (
                <p className="product-details-popular-lists__error" role="alert">
                  {feedback.error}
                </p>
              ) : null}
              {feedback.success ? (
                <p className="product-details-popular-lists__success" role="status">
                  {feedback.success}
                </p>
              ) : null}
              <PopularListsBody
                isLoading={listsQuery.isPending}
                isError={listsQuery.isError}
                lists={curatedLists}
                productId={productId}
                productRegionCode={productRegionCode ?? ""}
                pendingListId={pendingListId}
                disabled={disabled}
                onAction={runListAction}
              />
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        className="product-details-modal__footer-btn product-details-modal__footer-btn--popular"
        disabled={disabled}
        onClick={handleOpen}
      >
        <AppIcon icon={Star} size="sm" strokeWidth={2.15} />
        {buttonLabel}
      </button>
      {modal}
    </>
  );
}

/**
 * @param {{
 *   isLoading: boolean;
 *   isError: boolean;
 *   lists: Array<{ _id: string; title?: string; regionCode?: string; productIds?: string[] }>;
 *   productId: string;
 *   productRegionCode: string;
 *   pendingListId: string | null;
 *   disabled: boolean;
 *   onAction: (list: { _id: string }, isMember: boolean) => void | Promise<void>;
 * }} props
 */
function PopularListsBody({
  isLoading,
  isError,
  lists,
  productId,
  productRegionCode,
  pendingListId,
  disabled,
  onAction,
}) {
  if (isLoading) {
    return (
      <p className="product-details-popular-lists__state">
        {POPULAR_PRODUCTS_ADMIN_PAGE_UI.DETAILS_MODAL_LOADING}
      </p>
    );
  }
  if (isError) {
    return (
      <p className="product-details-popular-lists__error" role="alert">
        {POPULAR_PRODUCTS_ADMIN_PAGE_UI.LOAD_ERROR}
      </p>
    );
  }
  if (lists.length === 0) {
    return (
      <p className="product-details-popular-lists__state">
        {POPULAR_PRODUCTS_ADMIN_PAGE_UI.DETAILS_MODAL_EMPTY}
      </p>
    );
  }

  const productRegion = String(productRegionCode ?? "").trim();

  return (
    <ul className="product-details-popular-lists__list" role="list">
      {lists.map((list) => {
        const isMember = curatedListContainsProductId(list, productId);
        const listRegion = String(list.regionCode ?? "").trim();
        const regionName =
          getRuRegionByCode(listRegion)?.name ||
          listRegion ||
          POPULAR_PRODUCTS_ADMIN_PAGE_UI.DETAILS_REGION_FALLBACK;
        const listId = String(list._id);
        const isPending = pendingListId === listId;
        const regionMismatch =
          !isMember &&
          Boolean(productRegion) &&
          Boolean(listRegion) &&
          productRegion !== listRegion;

        return (
          <li key={listId} className="product-details-popular-lists__row">
            <div className="product-details-popular-lists__row-copy">
              <span className="product-details-popular-lists__row-title">
                {list.title}
              </span>
              <span className="product-details-popular-lists__row-region">
                {regionName}
                {regionMismatch
                  ? ` — ${POPULAR_PRODUCTS_ADMIN_PAGE_UI.DETAILS_REGION_MISMATCH}`
                  : ""}
              </span>
            </div>
            <button
              type="button"
              className={[
                "product-details-popular-lists__row-action",
                isMember
                  ? "product-details-popular-lists__row-action--remove"
                  : "product-details-popular-lists__row-action--add",
              ].join(" ")}
              disabled={
                disabled ||
                isPending ||
                pendingListId != null ||
                regionMismatch
              }
              onClick={() => void onAction(list, isMember)}
            >
              {isPending
                ? "…"
                : isMember
                  ? POPULAR_PRODUCTS_ADMIN_PAGE_UI.DETAILS_REMOVE
                  : POPULAR_PRODUCTS_ADMIN_PAGE_UI.DETAILS_ADD}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
