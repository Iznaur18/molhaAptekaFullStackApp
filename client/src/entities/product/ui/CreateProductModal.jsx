import { useEffect, useState } from "react";

import { createProduct } from "../api/createProduct.js";
import { patchMyProduct } from "../api/patchMyProduct.js";
import { resolveProductImageUrls } from "../lib/resolveProductImageUrls.js";
import {
  createImageRow,
  imageRowsFromUrls,
} from "../lib/productImageRowHelpers.js";
import {
  PRODUCT_CATEGORY_ELECTRONICS,
} from "../model/productConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../model/productModerationConstants.js";
import {
  PRODUCT_STOCK_QUANTITY_MAX,
  PRODUCT_STOCK_QUANTITY_MIN,
} from "../model/productStockConstants.js";
import { CreateProductCategorySelect } from "./CreateProductCategorySelect.jsx";
import { urlsFromImageRows } from "../lib/productImageRowHelpers.js";
import {
  computeProductDiscountPercent,
  parseProductPriceInput,
  validateProductOldPricePair,
} from "../lib/computeProductDiscountPercent.js";
import { validateProductDescription } from "../lib/validateProductDescription.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { ProductEditManageSection } from "./ProductEditManageSection.jsx";
import { ProductImageUrlSortableList } from "./ProductImageUrlSortableList.jsx";
import {
  CREATE_PRODUCT_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";
import { FormFieldLabel } from "../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";
import { ModalCloseIcon } from "../../../shared/ui/icon/index.js";

import "./CreateProductModal.css";

const INITIAL_FORM = {
  productName: "",
  productDescription: "",
  productImageRows: [createImageRow("")],
  productPrice: "",
  productOldPrice: "",
  productCategory: PRODUCT_CATEGORY_ELECTRONICS,
  productIsAvailable: true,
  productStockQuantity: "1",
  productAuctionEnabled: false,
};

/**
 * @param {import('../model/types.js').ProductFromApi} product
 */
function formStateFromProduct(product) {
  const urls = resolveProductImageUrls(product);
  const priceRaw = product.productPrice;
  const priceStr =
    priceRaw != null && Number.isFinite(Number(priceRaw))
      ? String(priceRaw)
      : "";
  const oldPriceRaw = product.productOldPrice;
  const oldPriceStr =
    oldPriceRaw != null && Number.isFinite(Number(oldPriceRaw))
      ? String(Math.floor(Number(oldPriceRaw)))
      : "";
  return {
    productName: product.productName?.trim() ?? "",
    productDescription: product.productDescription?.trim() ?? "",
    productImageRows: imageRowsFromUrls(urls),
    productPrice: priceStr,
    productOldPrice: oldPriceStr,
    productCategory: product.productCategory ?? PRODUCT_CATEGORY_ELECTRONICS,
    productIsAvailable: product.productIsAvailable !== false,
    productStockQuantity:
      product.productIsAvailable !== false &&
      product.productStockQuantity != null
        ? String(Math.max(0, Math.floor(Number(product.productStockQuantity))))
        : "1",
    productAuctionEnabled: product.productAuctionEnabled === true,
  };
}

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onSuccess?: (product: import('../model/types.js').ProductFromApi) => void;
 *   mode?: 'create' | 'edit';
 *   productToEdit?: import('../model/types.js').ProductFromApi | null;
 *   manageProduct?: import('../model/types.js').ProductFromApi | null;
 *   onDeleteProduct?: (productId: string) => void | Promise<void>;
 *   onSetProductAvailability?: (
 *     productId: string,
 *     productIsAvailable: boolean,
 *   ) => void | Promise<void>;
 *   onSetProductAuction?: (
 *     productId: string,
 *     productAuctionEnabled: boolean,
 *   ) => void | Promise<void>;
 *   isDeletePending?: boolean;
 *   isAvailabilityTogglePending?: boolean;
 *   isAuctionTogglePending?: boolean;
 *   manageErrorMessage?: string;
 *   canManageEdit?: boolean;
 *   canManageDelete?: boolean;
 *   canManageToggleVisibility?: boolean;
 *   sellerRaffleActive?: boolean;
 *   onToggleRaffleParticipation?: (
 *     product: import('../model/types.js').ProductFromApi,
 *     enabled: boolean,
 *   ) => void;
 *   isRaffleParticipationPending?: boolean;
 * }} props
 */
export function CreateProductModal({
  isOpen,
  onClose,
  onSuccess,
  mode = "create",
  productToEdit = null,
  manageProduct = null,
  onDeleteProduct,
  onSetProductAvailability,
  onSetProductAuction,
  isDeletePending = false,
  isAvailabilityTogglePending = false,
  isAuctionTogglePending = false,
  manageErrorMessage = "",
  canManageEdit = true,
  canManageDelete = true,
  canManageToggleVisibility = true,
  sellerRaffleActive = false,
  onToggleRaffleParticipation,
  isRaffleParticipationPending = false,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState({ kind: "idle", message: "" });
  const isEdit = mode === "edit";
  const isSubmitting = status.kind === "loading";
  const showManageSection =
    isEdit && manageProduct != null && typeof onDeleteProduct === "function";
  const showCatalogAvailabilityToggle =
    !showManageSection &&
    (!isEdit ||
      (productToEdit?.productModerationStatus ?? PRODUCT_MODERATION_APPROVED) ===
        PRODUCT_MODERATION_APPROVED);

  useEffect(() => {
    if (!isOpen) return;
    if (isEdit && productToEdit) {
      setForm(formStateFromProduct(productToEdit));
    } else {
      setForm(INITIAL_FORM);
    }
    setStatus({ kind: "idle", message: "" });
  }, [isOpen, isEdit, productToEdit?._id]);

  useScrollLock(isOpen);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvailableChange = (event) => {
    const checked = event.target.checked;
    setForm((prev) => ({
      ...prev,
      productIsAvailable: checked,
      productStockQuantity:
        checked && !String(prev.productStockQuantity).trim()
          ? "1"
          : prev.productStockQuantity,
    }));
  };

  const handleAuctionChange = (event) => {
    const checked = event.target.checked;
    setForm((prev) => ({ ...prev, productAuctionEnabled: checked }));
  };

  const handleClose = () => {
    setStatus({ kind: "idle", message: "" });
    onClose();
  };

  const parsePrice = (raw) => parseProductPriceInput(raw);

  const discountPreviewPercent = computeProductDiscountPercent(
    parsePrice(form.productOldPrice),
    parsePrice(form.productPrice),
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ kind: "loading", message: "" });

    try {
      const productPrice = parsePrice(form.productPrice);
      if (productPrice == null) {
        setStatus({
          kind: "error",
          message: CREATE_PRODUCT_MODAL_UI.ERROR_PRICE,
        });
        return;
      }

      const productOldPrice = parsePrice(form.productOldPrice);
      const oldPriceError = validateProductOldPricePair(
        productOldPrice,
        productPrice,
      );
      if (oldPriceError) {
        setStatus({
          kind: "error",
          message: CREATE_PRODUCT_MODAL_UI.ERROR_OLD_PRICE,
        });
        return;
      }

      const descriptionError = validateProductDescription(
        form.productDescription,
      );
      if (descriptionError) {
        setStatus({ kind: "error", message: descriptionError });
        return;
      }

      const urls = urlsFromImageRows(form.productImageRows).map((url) =>
        resolveUploadedImageUrl(url),
      );

      const stockParsed = Math.floor(Number(form.productStockQuantity));
      const listedInCatalog = form.productIsAvailable === true;
      const stockRequired =
        listedInCatalog || (isEdit && !showCatalogAvailabilityToggle);
      let productStockQuantity = 0;
      if (stockRequired) {
        if (
          !Number.isFinite(stockParsed) ||
          stockParsed < PRODUCT_STOCK_QUANTITY_MIN ||
          stockParsed > PRODUCT_STOCK_QUANTITY_MAX
        ) {
          setStatus({
            kind: "error",
            message: CREATE_PRODUCT_MODAL_UI.ERROR_STOCK,
          });
          return;
        }
        productStockQuantity = stockParsed;
      } else if (
        isEdit &&
        Number.isFinite(stockParsed) &&
        stockParsed >= 0 &&
        stockParsed <= PRODUCT_STOCK_QUANTITY_MAX
      ) {
        productStockQuantity = stockParsed;
      }

      let product;
      if (isEdit) {
        if (productToEdit?._id == null) {
          setStatus({
            kind: "error",
            message: CREATE_PRODUCT_MODAL_UI.ERROR_EDIT_GENERIC,
          });
          return;
        }
        const patchBody = {
          productName: form.productName.trim(),
          productDescription: form.productDescription.trim(),
          productImageUrls: urls,
          productPrice,
          productOldPrice,
          productCategory: form.productCategory,
        };
        if (showCatalogAvailabilityToggle) {
          patchBody.productIsAvailable = form.productIsAvailable;
        }
        if (isEdit || showCatalogAvailabilityToggle) {
          patchBody.productStockQuantity = productStockQuantity;
        }
        product = await patchMyProduct(String(productToEdit._id), patchBody);
      } else {
        product = await createProduct({
          productName: form.productName,
          productDescription: form.productDescription,
          productImageUrls: urls.length > 0 ? urls : undefined,
          productPrice,
          productOldPrice,
          productCategory: form.productCategory,
          productIsAvailable: form.productIsAvailable,
          productStockQuantity,
          productAuctionEnabled: form.productAuctionEnabled,
        });
      }

      onSuccess?.(product);
      handleClose();
    } catch (error) {
      const fallback = isEdit
        ? CREATE_PRODUCT_MODAL_UI.ERROR_EDIT_GENERIC
        : CREATE_PRODUCT_MODAL_UI.ERROR_GENERIC;
      const message =
        error instanceof Error ? error.message : fallback;
      setStatus({ kind: "error", message });
    }
  };

  const dialogAria = isEdit
    ? CREATE_PRODUCT_MODAL_UI.ARIA_DIALOG_EDIT
    : CREATE_PRODUCT_MODAL_UI.ARIA_DIALOG;
  const backdropAria = isEdit
    ? CREATE_PRODUCT_MODAL_UI.ARIA_CLOSE_BACKDROP_EDIT
    : CREATE_PRODUCT_MODAL_UI.ARIA_CLOSE_BACKDROP;
  const title = isEdit
    ? CREATE_PRODUCT_MODAL_UI.TITLE_EDIT
    : CREATE_PRODUCT_MODAL_UI.TITLE;
  const submitIdle = isEdit
    ? CREATE_PRODUCT_MODAL_UI.SUBMIT_EDIT_IDLE
    : CREATE_PRODUCT_MODAL_UI.SUBMIT_IDLE;
  const submitLoading = isEdit
    ? CREATE_PRODUCT_MODAL_UI.SUBMIT_EDIT_LOADING
    : CREATE_PRODUCT_MODAL_UI.SUBMIT_LOADING;

  return (
    <div
      className="create-product-modal"
      role="dialog"
      aria-modal="true"
      aria-label={dialogAria}
    >
      <button
        type="button"
        className="create-product-modal__backdrop"
        aria-label={backdropAria}
        onClick={handleClose}
      />
      <div className="create-product-modal__card">
        <div className="create-product-modal__header">
          <h2 className="create-product-modal__title">{title}</h2>
          <button
            type="button"
            className="create-product-modal__close"
            onClick={handleClose}
          >
            <ModalCloseIcon />
          </button>
        </div>
        <div className="create-product-modal__body">
          <form className="create-product-modal__form" onSubmit={handleSubmit}>
            <label className="create-product-modal__label">
              <FormFieldLabel required>
                {CREATE_PRODUCT_MODAL_UI.LABEL_NAME}
              </FormFieldLabel>
              <input
                className="create-product-modal__input"
                type="text"
                name="productName"
                value={form.productName}
                onChange={handleChange}
                required
                minLength={3}
                autoComplete="off"
                disabled={isSubmitting}
              />
            </label>
            <label className="create-product-modal__label">
              <FormFieldLabel required>
                {CREATE_PRODUCT_MODAL_UI.LABEL_DESCRIPTION}
              </FormFieldLabel>
              <textarea
                className="create-product-modal__textarea"
                name="productDescription"
                value={form.productDescription}
                onChange={handleChange}
                required
                minLength={10}
                disabled={isSubmitting}
              />
            </label>
            <ProductImageUrlSortableList
              rows={form.productImageRows}
              onRowsChange={(productImageRows) =>
                setForm((prev) => ({ ...prev, productImageRows }))
              }
              disabled={isSubmitting}
            />
            <label className="create-product-modal__label">
              <FormFieldLabel required>
                {CREATE_PRODUCT_MODAL_UI.LABEL_PRICE}
              </FormFieldLabel>
              <input
                className="create-product-modal__input"
                type="text"
                name="productPrice"
                value={form.productPrice}
                onChange={handleChange}
                required
                inputMode="decimal"
                autoComplete="off"
                disabled={isSubmitting}
              />
            </label>
            <label className="create-product-modal__label">
              <FormFieldLabel>
                {CREATE_PRODUCT_MODAL_UI.LABEL_OLD_PRICE}
              </FormFieldLabel>
              <input
                className="create-product-modal__input"
                type="text"
                name="productOldPrice"
                value={form.productOldPrice}
                onChange={handleChange}
                inputMode="numeric"
                autoComplete="off"
                disabled={isSubmitting}
              />
            </label>
            {discountPreviewPercent != null ? (
              <p className="create-product-modal__discount-preview">
                {CREATE_PRODUCT_MODAL_UI.LABEL_DISCOUNT_PREVIEW}: −
                {discountPreviewPercent}%
              </p>
            ) : null}
            <CreateProductCategorySelect
              value={form.productCategory}
              disabled={isSubmitting}
              onChange={(productCategory) =>
                setForm((prev) => ({ ...prev, productCategory }))
              }
            />
            {showCatalogAvailabilityToggle ? (
              <label className="create-product-modal__check">
                <input
                  type="checkbox"
                  checked={form.productIsAvailable}
                  onChange={handleAvailableChange}
                  disabled={isSubmitting}
                />
                {CREATE_PRODUCT_MODAL_UI.LABEL_AVAILABLE}
              </label>
            ) : null}
            {form.productIsAvailable || isEdit ? (
              <label className="create-product-modal__label">
                <FormFieldLabel
                  required={form.productIsAvailable || !showCatalogAvailabilityToggle}
                >
                  {CREATE_PRODUCT_MODAL_UI.LABEL_STOCK_QUANTITY}
                </FormFieldLabel>
                <input
                  className="create-product-modal__input"
                  type="number"
                  name="productStockQuantity"
                  value={form.productStockQuantity}
                  onChange={handleChange}
                  min={PRODUCT_STOCK_QUANTITY_MIN}
                  max={PRODUCT_STOCK_QUANTITY_MAX}
                  step={1}
                  inputMode="numeric"
                  disabled={isSubmitting}
                  required={
                    form.productIsAvailable || !showCatalogAvailabilityToggle
                  }
                />
              </label>
            ) : null}
            {!isEdit ? (
              <label className="create-product-modal__check">
                <input
                  type="checkbox"
                  checked={form.productAuctionEnabled}
                  onChange={handleAuctionChange}
                  disabled={isSubmitting}
                />
                {CREATE_PRODUCT_MODAL_UI.LABEL_AUCTION}
              </label>
            ) : null}
            {showManageSection && manageProduct ? (
              <ProductEditManageSection
                product={manageProduct}
                onDelete={onDeleteProduct}
                onSetAvailability={onSetProductAvailability}
                onSetAuction={onSetProductAuction}
                isDeletePending={isDeletePending}
                isAvailabilityTogglePending={isAvailabilityTogglePending}
                isAuctionTogglePending={isAuctionTogglePending}
                errorMessage={manageErrorMessage}
                canEdit={canManageEdit}
                canDelete={canManageDelete}
                canToggleVisibility={canManageToggleVisibility}
                sellerRaffleActive={sellerRaffleActive}
                onToggleRaffleParticipation={onToggleRaffleParticipation}
                isRaffleParticipationPending={isRaffleParticipationPending}
                disabled={isSubmitting}
              />
            ) : null}
            {status.kind === "error" ? (
              <p
                className="create-product-modal__message create-product-modal__message_error"
                role="alert"
              >
                {status.message}
              </p>
            ) : null}
            <button
              type="submit"
              className="create-product-modal__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? submitLoading : submitIdle}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
