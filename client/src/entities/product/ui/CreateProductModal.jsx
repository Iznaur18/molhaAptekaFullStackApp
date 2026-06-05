import { useEffect, useMemo, useState } from "react";

import { createProduct } from "../api/createProduct.js";
import { patchMyProduct } from "../api/patchMyProduct.js";
import { resolveProductImageUrls } from "../lib/resolveProductImageUrls.js";
import { createImageRow, imageRowsFromUrls } from "../lib/productImageRowHelpers.js";
import {
  PRODUCT_CATEGORY_ELECTRONICS,
  PRODUCT_DESCRIPTION_MAX_CHARS,
  PRODUCT_DESCRIPTION_MIN_CHARS,
} from "../model/productConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../model/productModerationConstants.js";
import {
  PRODUCT_STOCK_QUANTITY_MAX,
  PRODUCT_STOCK_QUANTITY_MIN,
} from "../model/productStockConstants.js";
import { CreateProductCategoryPicker } from "../../product-category-tree/ui/CreateProductCategoryPicker.jsx";
import { urlsFromImageRows } from "../lib/productImageRowHelpers.js";
import {
  computeProductDiscountPercent,
  parseProductPriceInput,
  validateProductOldPricePair,
} from "../lib/computeProductDiscountPercent.js";
import { getProductPriceRubMaxError } from "../lib/productPriceRubValidation.js";
import { PRODUCT_PRICE_RUB_MAX } from "../model/productConstants.js";
import { validateProductDescription } from "../lib/validateProductDescription.js";
import {
  validateProductCharacteristicsRows,
  productCharacteristicsFromRows,
} from "../lib/validateProductCharacteristicsRows.js";
import { characteristicRowsFromApi } from "../lib/characteristicRowsFromApi.js";
import {
  INTEGER_INPUT_FIELD_PROPS,
  keepDigitsOnly,
} from "../../../shared/lib/numericInput.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { resolveProductLoyaltyPointsPerUnit } from "../lib/resolveProductLoyaltyPointsPerUnit.js";
import { resolveSellerMaxLoyaltyPointsPerUnit } from "../lib/resolveSellerMaxLoyaltyPointsPerUnit.js";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";
import { ProductEditManageSection } from "./ProductEditManageSection.jsx";
import { InstallmentProgramModal } from "../../installment/ui/InstallmentProgramModal.jsx";
import { ProductImageUrlSortableList } from "./ProductImageUrlSortableList.jsx";
import { ProductPreviewVideoField } from "./ProductPreviewVideoField.jsx";
import { ProductCharacteristicsEditor } from "./ProductCharacteristicsEditor.jsx";
import {
  CREATE_PRODUCT_MODAL_UI,
  PRODUCT_PREVIEW_VIDEO_UI,
} from "../../../shared/config/appUiCopy.js";
import { getProductFieldEditLabel } from "../lib/productFieldRegistry.js";
import { FormFieldLabel } from "../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";
import "./CreateProductModal.css";

const INITIAL_FORM = {
  productName: "",
  productDescription: "",
  productImageRows: [createImageRow("")],
  productPreviewVideoUrl: "",
  productPrice: "",
  productOldPrice: "",
  productCategory: PRODUCT_CATEGORY_ELECTRONICS,
  productCategoryId: null,
  categoryBreadcrumbRu: "",
  productIsAvailable: true,
  productStockQuantity: "1",
  productAuctionEnabled: false,
  loyaltyPointsPerUnit: "0",
  productCharacteristicRows: [],
};

/**
 * @param {import('../model/types.js').ProductFromApi} product
 */
function formStateFromProduct(product) {
  const urls = resolveProductImageUrls(product);
  const priceRaw = product.productPrice;
  const priceStr =
    priceRaw != null && Number.isFinite(Number(priceRaw)) ? String(priceRaw) : "";
  const oldPriceRaw = product.productOldPrice;
  const oldPriceStr =
    oldPriceRaw != null && Number.isFinite(Number(oldPriceRaw))
      ? String(Math.floor(Number(oldPriceRaw)))
      : "";
  return {
    productName: product.productName?.trim() ?? "",
    productDescription: product.productDescription?.trim() ?? "",
    productImageRows: imageRowsFromUrls(urls),
    productPreviewVideoUrl: product.productPreviewVideoUrl?.trim() ?? "",
    productPrice: priceStr,
    productOldPrice: oldPriceStr,
    productCategory: product.productCategory ?? PRODUCT_CATEGORY_ELECTRONICS,
    productCategoryId: product.productCategoryId ?? null,
    categoryBreadcrumbRu: product.categoryBreadcrumbRu?.trim() ?? "",
    productIsAvailable: product.productIsAvailable !== false,
    productStockQuantity:
      product.productIsAvailable !== false && product.productStockQuantity != null
        ? String(Math.max(0, Math.floor(Number(product.productStockQuantity))))
        : "1",
    productAuctionEnabled: product.productAuctionEnabled === true,
    loyaltyPointsPerUnit: String(resolveProductLoyaltyPointsPerUnit(product)),
    productCharacteristicRows: characteristicRowsFromApi(
      product.productCharacteristics,
    ),
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
 *   sellerLoyaltyPointsBalance?: number;
 *   sellerLoyaltyPointsReserved?: number;
 *   sellerProducts?: import('../model/types.js').ProductFromApi[];
 * }} props
 */
export function CreateProductModal({
  isOpen,
  onClose,
  onSuccess,
  sellerLoyaltyPointsBalance = 0,
  sellerLoyaltyPointsReserved = 0,
  sellerProducts = [],
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
  const [isInstallmentProgramOpen, setIsInstallmentProgramOpen] = useState(false);
  const isEdit = mode === "edit";
  const isSubmitting = status.kind === "loading";
  const showManageSection =
    isEdit && manageProduct != null && typeof onDeleteProduct === "function";
  const showCatalogAvailabilityToggle =
    !showManageSection &&
    (!isEdit ||
      (productToEdit?.productModerationStatus ?? PRODUCT_MODERATION_APPROVED) ===
        PRODUCT_MODERATION_APPROVED);

  const editingProductId =
    isEdit && productToEdit?._id != null ? String(productToEdit._id) : null;

  const sellerLoyaltyBudget = useMemo(
    () =>
      resolveSellerMaxLoyaltyPointsPerUnit({
        loyaltyPointsBalance: sellerLoyaltyPointsBalance,
        loyaltyPointsReserved: sellerLoyaltyPointsReserved,
        sellerProducts,
        editingProductId,
      }),
    [
      sellerLoyaltyPointsBalance,
      sellerLoyaltyPointsReserved,
      sellerProducts,
      editingProductId,
    ],
  );

  const sellerPointsMaxPerUnit = sellerLoyaltyBudget.maxPerUnit;
  const loyaltyFieldDisabled = sellerPointsMaxPerUnit <= 0;

  useEffect(() => {
    if (!isOpen) return;
    if (isEdit && productToEdit) {
      setForm(formStateFromProduct(productToEdit));
    } else {
      setForm(INITIAL_FORM);
    }
    setStatus({ kind: "idle", message: "" });
  }, [isOpen, isEdit, productToEdit?._id]);

  const descriptionChars = useMemo(
    () => String(form.productDescription ?? "").length,
    [form.productDescription],
  );

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    const isIntegerField =
      name === "productPrice" ||
      name === "productOldPrice" ||
      name === "productStockQuantity" ||
      name === "loyaltyPointsPerUnit";
    const nextValue = isIntegerField ? keepDigitsOnly(value) : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
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
      const productPriceMaxError = getProductPriceRubMaxError(productPrice);
      if (productPriceMaxError) {
        setStatus({
          kind: "error",
          message: CREATE_PRODUCT_MODAL_UI.ERROR_PRICE_MAX,
        });
        return;
      }

      const productOldPrice = parsePrice(form.productOldPrice);
      if (productOldPrice != null) {
        const oldPriceMaxError = getProductPriceRubMaxError(productOldPrice);
        if (oldPriceMaxError) {
          setStatus({
            kind: "error",
            message: CREATE_PRODUCT_MODAL_UI.ERROR_PRICE_MAX,
          });
          return;
        }
      }
      const oldPriceError = validateProductOldPricePair(productOldPrice, productPrice);
      if (oldPriceError) {
        setStatus({
          kind: "error",
          message: CREATE_PRODUCT_MODAL_UI.ERROR_OLD_PRICE,
        });
        return;
      }

      const descriptionError = validateProductDescription(form.productDescription);
      if (descriptionError) {
        setStatus({ kind: "error", message: descriptionError });
        return;
      }

      const characteristicsError = validateProductCharacteristicsRows(
        form.productCharacteristicRows,
      );
      if (characteristicsError) {
        setStatus({ kind: "error", message: characteristicsError });
        return;
      }

      const productCharacteristics = productCharacteristicsFromRows(
        form.productCharacteristicRows,
      );

      const urls = urlsFromImageRows(form.productImageRows).map((url) =>
        resolveUploadedImageUrl(url),
      );
      const previewVideoUrl = resolveUploadedImageUrl(
        form.productPreviewVideoUrl.trim(),
      );
      if (previewVideoUrl && urls.length === 0) {
        setStatus({
          kind: "error",
          message: CREATE_PRODUCT_MODAL_UI.ERROR_PREVIEW_VIDEO_REQUIRES_PHOTO,
        });
        return;
      }

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

      const loyaltyParsed = Math.floor(Number(form.loyaltyPointsPerUnit));
      const loyaltyPointsPerUnit =
        Number.isFinite(loyaltyParsed) && loyaltyParsed >= 0 ? loyaltyParsed : 0;
      if (loyaltyPointsPerUnit > sellerPointsMaxPerUnit) {
        setStatus({
          kind: "error",
          message: CREATE_PRODUCT_MODAL_UI.ERROR_LOYALTY_POINTS_MAX(
            sellerPointsMaxPerUnit,
            sellerLoyaltyBudget.catalogCommitted,
          ),
        });
        return;
      }

      if (!form.productCategoryId && !form.productCategory) {
        setStatus({
          kind: "error",
          message: CREATE_PRODUCT_MODAL_UI.ERROR_CATEGORY_LEAF,
        });
        return;
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
          productPreviewVideoUrl: previewVideoUrl,
          productPrice,
          productOldPrice,
          loyaltyPointsPerUnit,
          productCharacteristics,
        };
        if (form.productCategoryId) {
          patchBody.productCategoryId = form.productCategoryId;
        } else {
          patchBody.productCategory = form.productCategory;
        }
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
          productPreviewVideoUrl: previewVideoUrl || undefined,
          productPrice,
          productOldPrice,
          ...(form.productCategoryId
            ? { productCategoryId: form.productCategoryId }
            : { productCategory: form.productCategory }),
          productIsAvailable: form.productIsAvailable,
          productStockQuantity,
          productAuctionEnabled: form.productAuctionEnabled,
          loyaltyPointsPerUnit,
          productCharacteristics,
        });
      }

      onSuccess?.(product);
      handleClose();
    } catch (error) {
      const fallback = isEdit
        ? CREATE_PRODUCT_MODAL_UI.ERROR_EDIT_GENERIC
        : CREATE_PRODUCT_MODAL_UI.ERROR_GENERIC;
      const message = error instanceof Error ? error.message : fallback;
      setStatus({ kind: "error", message });
    }
  };

  const dialogAria = isEdit
    ? CREATE_PRODUCT_MODAL_UI.ARIA_DIALOG_EDIT
    : CREATE_PRODUCT_MODAL_UI.ARIA_DIALOG;
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
    <>
      <ProductModalShell
        isOpen={isOpen}
        onClose={handleClose}
        title={title}
        titleId="create-product-modal-title"
        ariaLabel={dialogAria}
        size="md"
        panelClassName="create-product-modal__panel"
        bodyClassName="create-product-modal__body"
      >
        <form className="create-product-modal__form" onSubmit={handleSubmit}>
            <label className="create-product-modal__label">
              <FormFieldLabel required>
                {getProductFieldEditLabel("productName")}
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
                {getProductFieldEditLabel("productDescription")}
              </FormFieldLabel>
              <textarea
                className="create-product-modal__textarea"
                name="productDescription"
                value={form.productDescription}
                onChange={handleChange}
                required
                minLength={PRODUCT_DESCRIPTION_MIN_CHARS}
                maxLength={PRODUCT_DESCRIPTION_MAX_CHARS}
                disabled={isSubmitting}
              />
              <span
                className={
                  descriptionChars > PRODUCT_DESCRIPTION_MAX_CHARS
                    ? "create-product-modal__char-meter create-product-modal__char-meter_overflow"
                    : "create-product-modal__char-meter"
                }
              >
                {CREATE_PRODUCT_MODAL_UI.CHARS_USED(
                  descriptionChars,
                  PRODUCT_DESCRIPTION_MAX_CHARS,
                )}
              </span>
            </label>
            <ProductCharacteristicsEditor
              rows={form.productCharacteristicRows}
              onRowsChange={(productCharacteristicRows) =>
                setForm((prev) => ({ ...prev, productCharacteristicRows }))
              }
              disabled={isSubmitting}
            />
            <ProductImageUrlSortableList
              rows={form.productImageRows}
              onRowsChange={(productImageRows) =>
                setForm((prev) => ({ ...prev, productImageRows }))
              }
              disabled={isSubmitting}
            />
            <div className="create-product-modal__label">
              <FormFieldLabel>{PRODUCT_PREVIEW_VIDEO_UI.LABEL}</FormFieldLabel>
              <ProductPreviewVideoField
                value={form.productPreviewVideoUrl}
                onChange={(productPreviewVideoUrl) =>
                  setForm((prev) => ({ ...prev, productPreviewVideoUrl }))
                }
                disabled={isSubmitting}
              />
            </div>
            <label className="create-product-modal__label">
              <FormFieldLabel required>
                {getProductFieldEditLabel("productPrice")}
              </FormFieldLabel>
              <input
                {...INTEGER_INPUT_FIELD_PROPS}
                className="create-product-modal__input"
                name="productPrice"
                value={form.productPrice}
                onChange={handleChange}
                required
                maxLength={String(PRODUCT_PRICE_RUB_MAX).length}
                disabled={isSubmitting}
              />
            </label>
            <label className="create-product-modal__label">
              <FormFieldLabel>{getProductFieldEditLabel("productOldPrice")}</FormFieldLabel>
              <input
                {...INTEGER_INPUT_FIELD_PROPS}
                className="create-product-modal__input"
                name="productOldPrice"
                value={form.productOldPrice}
                onChange={handleChange}
                maxLength={String(PRODUCT_PRICE_RUB_MAX).length}
                disabled={isSubmitting}
              />
            </label>
            {discountPreviewPercent != null ? (
              <p className="create-product-modal__discount-preview">
                {CREATE_PRODUCT_MODAL_UI.LABEL_DISCOUNT_PREVIEW}: −
                {discountPreviewPercent}%
              </p>
            ) : null}
            <CreateProductCategoryPicker
              value={{
                productCategoryId: form.productCategoryId,
                categoryBreadcrumbRu: form.categoryBreadcrumbRu,
                productCategory: form.productCategory,
              }}
              disabled={isSubmitting}
              onChange={({
                productCategoryId,
                categoryBreadcrumbRu,
                productCategory,
              }) =>
                setForm((prev) => ({
                  ...prev,
                  productCategoryId,
                  categoryBreadcrumbRu,
                  productCategory,
                }))
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
                {getProductFieldEditLabel("productIsAvailable")}
              </label>
            ) : null}
            {form.productIsAvailable || isEdit ? (
              <label className="create-product-modal__label">
                <FormFieldLabel
                  required={form.productIsAvailable || !showCatalogAvailabilityToggle}
                >
                  {getProductFieldEditLabel("productStockQuantity")}
                </FormFieldLabel>
                <input
                  {...INTEGER_INPUT_FIELD_PROPS}
                  className="create-product-modal__input"
                  name="productStockQuantity"
                  value={form.productStockQuantity}
                  onChange={handleChange}
                  maxLength={String(PRODUCT_STOCK_QUANTITY_MAX).length}
                  disabled={isSubmitting}
                  required={form.productIsAvailable || !showCatalogAvailabilityToggle}
                />
              </label>
            ) : null}
            <label className="create-product-modal__label">
              <FormFieldLabel>
                {getProductFieldEditLabel("loyaltyPointsPerUnit")}
              </FormFieldLabel>
              <input
                {...INTEGER_INPUT_FIELD_PROPS}
                className="create-product-modal__input"
                name="loyaltyPointsPerUnit"
                value={form.loyaltyPointsPerUnit}
                onChange={handleChange}
                disabled={isSubmitting || loyaltyFieldDisabled}
                maxLength={8}
              />
              <p className="create-product-modal__hint">
                {loyaltyFieldDisabled
                  ? CREATE_PRODUCT_MODAL_UI.HINT_LOYALTY_POINTS_ZERO_BALANCE
                  : CREATE_PRODUCT_MODAL_UI.HINT_LOYALTY_POINTS_PER_UNIT(
                      sellerLoyaltyBudget.available,
                      sellerLoyaltyBudget.catalogCommitted,
                      sellerPointsMaxPerUnit,
                    )}
              </p>
            </label>
            {!isEdit ? (
              <label className="create-product-modal__check">
                <input
                  type="checkbox"
                  checked={form.productAuctionEnabled}
                  onChange={handleAuctionChange}
                  disabled={isSubmitting}
                />
                {getProductFieldEditLabel("productAuctionEnabled")}
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
                onOpenInstallmentProgram={() => setIsInstallmentProgramOpen(true)}
                canOpenInstallmentProgram={
                  manageProduct.productModerationStatus === PRODUCT_MODERATION_APPROVED
                }
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
      </ProductModalShell>
      {manageProduct?._id != null ? (
        <InstallmentProgramModal
          isOpen={isInstallmentProgramOpen}
          productId={String(manageProduct._id)}
          productName={manageProduct.productName}
          onClose={() => setIsInstallmentProgramOpen(false)}
          onSaved={() => {
            if (manageProduct?._id != null) {
              onSuccess?.(manageProduct);
            }
          }}
        />
      ) : null}
    </>
  );
}
