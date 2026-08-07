import { useCallback, useState } from "react";
import { DEFAULT_VIEWER_REGION_CODE } from "@molha/api-contract";

import { resolveCuratedAddProductBlockReason } from "../../../entities/curated-product-list/lib/resolveCuratedAddProductBlockReason.js";
import { useCuratedListProductAddPreview } from "../../../entities/curated-product-list/model/useCuratedListProductAddPreview.js";
import { RuRegionSelect } from "../../../entities/region/ui/RuRegionSelect.jsx";
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
 *   onSaveList: (payload: { title: string; regionCode: string }) => Promise<void>;
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
  onSaveList,
  onAddProduct,
  onRemoveProduct,
}) {
  const [titleDraft, setTitleDraft] = useState(list.title);
  const [regionDraft, setRegionDraft] = useState(
    list.regionCode || DEFAULT_VIEWER_REGION_CODE,
  );
  const [productIdDraft, setProductIdDraft] = useState("");
  const [localError, setLocalError] = useState("");
  const {
    preview,
    isLoading: isPreviewLoading,
    error: previewError,
  } = useCuratedListProductAddPreview(productIdDraft);

  const listRegionCode = list.regionCode || DEFAULT_VIEWER_REGION_CODE;
  const regionBlockReason = resolveCuratedAddProductBlockReason({
    preview,
    listRegionCode,
  });
  const canAddProduct =
    Boolean(preview) &&
    !isPreviewLoading &&
    !previewError &&
    regionBlockReason == null;

  const handleSaveList = useCallback(async () => {
    setLocalError("");
    if (!regionDraft) {
      setLocalError(POPULAR_PRODUCTS_ADMIN_PAGE_UI.REGION_REQUIRED);
      return;
    }
    try {
      await onSaveList({ title: titleDraft, regionCode: regionDraft });
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : POPULAR_PRODUCTS_ADMIN_PAGE_UI.SAVE_ERROR);
    }
  }, [onSaveList, regionDraft, titleDraft]);

  const handleAddProduct = useCallback(async () => {
    setLocalError("");
    const productId = productIdDraft.trim();
    if (!productId) {
      setLocalError(POPULAR_PRODUCTS_ADMIN_PAGE_UI.PRODUCT_ID_REQUIRED);
      return;
    }
    if (!canAddProduct) {
      if (typeof regionBlockReason === "string" && regionBlockReason !== "catalog") {
        setLocalError(regionBlockReason);
      } else if (regionBlockReason === "catalog") {
        setLocalError(POPULAR_PRODUCTS_ADMIN_PAGE_UI.PREVIEW_NOT_VISIBLE);
      } else if (previewError) {
        setLocalError(previewError);
      }
      return;
    }

    try {
      await onAddProduct(productId);
      setProductIdDraft("");
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : POPULAR_PRODUCTS_ADMIN_PAGE_UI.ADD_ITEM_ERROR);
    }
  }, [
    canAddProduct,
    onAddProduct,
    previewError,
    productIdDraft,
    regionBlockReason,
  ]);

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
      <label className="curated-list-admin-card__label">
        {POPULAR_PRODUCTS_ADMIN_PAGE_UI.LIST_REGION_LABEL}
        <RuRegionSelect
          value={regionDraft}
          onChange={setRegionDraft}
          disabled={isBusy}
          required
        />
      </label>
      <button
        type="button"
        className="app-btn app-btn--secondary"
        onClick={() => void handleSaveList()}
        disabled={isBusy || titleDraft.trim() === "" || !regionDraft}
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
          disabled={isBusy || !canAddProduct}
        >
          {POPULAR_PRODUCTS_ADMIN_PAGE_UI.ADD_PRODUCT}
        </button>
      </div>

      {isPreviewLoading ? (
        <p className="curated-list-admin-card__preview curated-list-admin-card__preview--muted">
          {POPULAR_PRODUCTS_ADMIN_PAGE_UI.PREVIEW_LOADING}
        </p>
      ) : null}

      {previewError ? (
        <p className="curated-list-admin-card__error" role="alert">
          {previewError}
        </p>
      ) : null}

      {preview && !isPreviewLoading ? (
        <div
          className={[
            "curated-list-admin-card__preview",
            regionBlockReason ? "curated-list-admin-card__preview--warn" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <p className="curated-list-admin-card__preview-row">
            <span className="curated-list-admin-card__preview-label">
              {POPULAR_PRODUCTS_ADMIN_PAGE_UI.PREVIEW_NAME_LABEL}
            </span>
            <span>{preview.productName}</span>
          </p>
          <p className="curated-list-admin-card__preview-row">
            <span className="curated-list-admin-card__preview-label">
              {POPULAR_PRODUCTS_ADMIN_PAGE_UI.PREVIEW_REGION_LABEL}
            </span>
            <span>{preview.regionLabel}</span>
          </p>
          {regionBlockReason === "catalog" ? (
            <p className="curated-list-admin-card__preview-status" role="status">
              {POPULAR_PRODUCTS_ADMIN_PAGE_UI.PREVIEW_NOT_VISIBLE}
            </p>
          ) : typeof regionBlockReason === "string" ? (
            <p className="curated-list-admin-card__preview-status" role="status">
              {regionBlockReason}
            </p>
          ) : (
            <p className="curated-list-admin-card__preview-status curated-list-admin-card__preview-status--ok">
              {POPULAR_PRODUCTS_ADMIN_PAGE_UI.PREVIEW_OK}
            </p>
          )}
        </div>
      ) : null}

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
