import { useEffect, useMemo, useState } from "react";

import {
  CREATE_PRODUCT_INITIAL_FORM,
  createProductFormStateFromProduct,
} from "../lib/createProductFormState.js";
import { resolveCreateProductDiscountPreview } from "../lib/prepareCreateProductSubmit.js";
import { resolveSellerMaxLoyaltyPointsPerUnit } from "../lib/resolveSellerMaxLoyaltyPointsPerUnit.js";
import {
  formatRubPriceInput,
  keepDigitsOnly,
} from "../../../shared/lib/numericInput.js";
import { useCreateProductSubmit } from "./useCreateProductSubmit.js";

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onSuccess?: (product: import('./types.js').ProductFromApi) => void;
 *   mode?: 'create' | 'edit';
 *   productToEdit?: import('./types.js').ProductFromApi | null;
 *   sellerLoyaltyPointsBalance?: number;
 *   sellerLoyaltyPointsReserved?: number;
 *   sellerProducts?: import('./types.js').ProductFromApi[];
 * }} params
 */
export function useCreateProductForm({
  isOpen,
  onClose,
  onSuccess,
  mode = "create",
  productToEdit = null,
  sellerLoyaltyPointsBalance = 0,
  sellerLoyaltyPointsReserved = 0,
  sellerProducts = [],
}) {
  const [form, setForm] = useState(CREATE_PRODUCT_INITIAL_FORM);
  const [status, setStatus] = useState({ kind: "idle", message: "" });

  const isEdit = mode === "edit";
  const showCatalogAvailabilityToggle = !isEdit;

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

  const handleClose = () => {
    setStatus({ kind: "idle", message: "" });
    onClose();
  };

  const { submit: handleSubmit } = useCreateProductSubmit({
    form,
    isEdit,
    productToEdit,
    showCatalogAvailabilityToggle,
    sellerPointsMaxPerUnit,
    sellerCatalogCommitted: sellerLoyaltyBudget.catalogCommitted,
    onSuccess,
    onClose: handleClose,
    setStatus,
  });

  const isSubmitting = status.kind === "loading";

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (isEdit && productToEdit) {
      setForm(createProductFormStateFromProduct(productToEdit));
    } else {
      setForm(CREATE_PRODUCT_INITIAL_FORM);
    }
    setStatus({ kind: "idle", message: "" });
  }, [isOpen, isEdit, productToEdit?._id]);

  const descriptionChars = useMemo(
    () => String(form.productDescription ?? "").length,
    [form.productDescription],
  );

  const discountPreviewPercent = useMemo(
    () => resolveCreateProductDiscountPreview(form.productPrice, form.productOldPrice),
    [form.productPrice, form.productOldPrice],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    const isPriceField = name === "productPrice" || name === "productOldPrice";
    const isIntegerField =
      name === "productStockQuantity" || name === "loyaltyPointsPerUnit";
    let nextValue = value;
    if (isPriceField) {
      nextValue = formatRubPriceInput(value);
    } else if (isIntegerField) {
      nextValue = keepDigitsOnly(value);
    }
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

  return {
    form,
    setForm,
    status,
    isEdit,
    showCatalogAvailabilityToggle,
    sellerLoyaltyBudget,
    sellerPointsMaxPerUnit,
    loyaltyFieldDisabled,
    isSubmitting,
    handleClose,
    handleSubmit,
    descriptionChars,
    discountPreviewPercent,
    handleChange,
    handleAvailableChange,
  };
}
