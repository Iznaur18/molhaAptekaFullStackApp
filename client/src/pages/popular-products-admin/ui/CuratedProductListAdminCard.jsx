import { useCallback, useState } from "react";

import { POPULAR_PRODUCTS_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./CuratedProductListAdminCard.css";

/**
 * @param {{
 *   list: import('../../../entities/curated-product-list/model/types.js').CuratedProductListFromApi;
 *   isFirst: boolean;
 *   isLast: boolean;
 *   isBusy: boolean;
 *   onMoveUp: () => void;
 *   onMoveDown: () => void;
 *   onDeleteList: () => void;
 *   onSaveTitle: (title: string) => Promise<void>;
 *   onAddProduct: (productId: string) => Promise<void>;
 *   onRemoveProduct: (productId: string) => Promise<void>;
 * }} props
 */
export function CuratedProductListAdminCard({
  list,
  isFirst,
  isLast,
  isBusy,
  onMoveUp,
  onMoveDown,
  onDeleteList,
  onSaveTitle,
  onAddProduct,
  onRemoveProduct,
}) {
  const [titleDraft, setTitleDraft] = useState(list.title);
  const [productIdDraft, setProductIdDraft] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSaveTitle = useCallback(async () => {
    setLocalError("");
    try {
      await onSaveTitle(titleDraft);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : POPULAR_PRODUCTS_ADMIN_PAGE_UI.SAVE_ERROR);
    }
  }, [onSaveTitle, titleDraft]);

  const handleAddProduct = useCallback(async () => {
    setLocalError("");
    const productId = productIdDraft.trim();
    if (!productId) {
      setLocalError(POPULAR_PRODUCTS_ADMIN_PAGE_UI.PRODUCT_ID_REQUIRED);
      return;
    }

    try {
      await onAddProduct(productId);
      setProductIdDraft("");
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : POPULAR_PRODUCTS_ADMIN_PAGE_UI.ADD_ITEM_ERROR);
    }
  }, [onAddProduct, productIdDraft]);

  const handleRemoveProduct = useCallback(
    async (productId) => {
      setLocalError("");
      try {
        await onRemoveProduct(productId);
      } catch (e) {
        setLocalError(
          e instanceof Error ? e.message : POPULAR_PRODUCTS_ADMIN_PAGE_UI.REMOVE_ITEM_ERROR,
        );
      }
    },
    [onRemoveProduct],
  );

  return (
    <article className="curated-list-admin-card">
      <header className="curated-list-admin-card__header">
        <div className="curated-list-admin-card__order">
          <button
            type="button"
            className="app-btn app-btn--secondary app-btn--icon"
            onClick={onMoveUp}
            disabled={isBusy || isFirst}
            aria-label={POPULAR_PRODUCTS_ADMIN_PAGE_UI.MOVE_UP_ARIA}
          >
            ↑
          </button>
          <button
            type="button"
            className="app-btn app-btn--secondary app-btn--icon"
            onClick={onMoveDown}
            disabled={isBusy || isLast}
            aria-label={POPULAR_PRODUCTS_ADMIN_PAGE_UI.MOVE_DOWN_ARIA}
          >
            ↓
          </button>
        </div>
        <button
          type="button"
          className="app-btn app-btn--danger"
          onClick={onDeleteList}
          disabled={isBusy}
        >
          {POPULAR_PRODUCTS_ADMIN_PAGE_UI.DELETE_LIST}
        </button>
      </header>

      <label className="curated-list-admin-card__label">
        {POPULAR_PRODUCTS_ADMIN_PAGE_UI.LIST_TITLE_LABEL}
        <input
          className="curated-list-admin-card__input"
          value={titleDraft}
          maxLength={60}
          onChange={(event) => setTitleDraft(event.target.value)}
          disabled={isBusy}
        />
      </label>
      <button
        type="button"
        className="app-btn app-btn--secondary"
        onClick={() => void handleSaveTitle()}
        disabled={isBusy || titleDraft.trim() === ""}
      >
        {POPULAR_PRODUCTS_ADMIN_PAGE_UI.SAVE_TITLE}
      </button>

      <div className="curated-list-admin-card__add">
        <label className="curated-list-admin-card__label">
          {POPULAR_PRODUCTS_ADMIN_PAGE_UI.PRODUCT_ID_LABEL}
          <input
            className="curated-list-admin-card__input"
            value={productIdDraft}
            onChange={(event) => setProductIdDraft(event.target.value)}
            placeholder={POPULAR_PRODUCTS_ADMIN_PAGE_UI.PRODUCT_ID_PLACEHOLDER}
            disabled={isBusy}
          />
        </label>
        <button
          type="button"
          className="app-btn app-btn--primary"
          onClick={() => void handleAddProduct()}
          disabled={isBusy}
        >
          {POPULAR_PRODUCTS_ADMIN_PAGE_UI.ADD_PRODUCT}
        </button>
      </div>

      {localError ? (
        <p className="curated-list-admin-card__error" role="alert">
          {localError}
        </p>
      ) : null}

      {list.productIds.length === 0 ? (
        <p className="curated-list-admin-card__empty">{POPULAR_PRODUCTS_ADMIN_PAGE_UI.EMPTY_LIST}</p>
      ) : (
        <ul className="curated-list-admin-card__items" role="list">
          {list.productIds.map((productId) => (
            <li key={productId} className="curated-list-admin-card__item" role="listitem">
              <code className="curated-list-admin-card__product-id">{productId}</code>
              <button
                type="button"
                className="app-btn app-btn--secondary"
                onClick={() => void handleRemoveProduct(productId)}
                disabled={isBusy}
              >
                {POPULAR_PRODUCTS_ADMIN_PAGE_UI.REMOVE_PRODUCT}
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
