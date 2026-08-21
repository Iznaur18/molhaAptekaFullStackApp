import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  CREATE_PRODUCT_INITIAL_FORM,
  createProductFormStateFromCopiedProduct,
  createProductFormStateFromProduct,
} from "../lib/createProductFormState.js";
import {
  clearCreateProductFormDraft,
  readCreateProductFormDraft,
} from "../lib/createProductFormDraftStorage.js";
import { createProductPickupFieldsFromUser } from "../lib/createProductPickupFieldsFromUser.js";
import { useAuthSession } from "../../user/model/useAuthSession.js";
import { resolveCreateProductDiscountPreview } from "../lib/prepareCreateProductSubmit.js";
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
 *   productToCopy?: import('./types.js').ProductFromApi | null;
 * }} params
 */
export function useCreateProductForm({
  isOpen,
  onClose,
  onSuccess,
  mode = "create",
  productToEdit = null,
  productToCopy = null,
}) {
  const { user } = useAuthSession();
  const [form, setForm] = useState(CREATE_PRODUCT_INITIAL_FORM);
  const [status, setStatus] = useState({ kind: "idle", message: "" });
  const [draftRestored, setDraftRestored] = useState(false);
  const profilePickupSeededRef = useRef(false);

  const isEdit = mode === "edit";
  const showCatalogAvailabilityToggle = !isEdit;
  // Черновики ведём только для «чистого» создания: при редактировании и
  // копировании форма префилится из существующего товара — черновику там не место.
  const draftEnabled = !isEdit && !productToCopy;

  const handleClose = () => {
    setStatus({ kind: "idle", message: "" });
    onClose();
  };

  const handleCreateSuccess = useCallback(
    (product) => {
      if (draftEnabled) {
        clearCreateProductFormDraft();
      }
      setDraftRestored(false);
      onSuccess?.(product);
    },
    [draftEnabled, onSuccess],
  );

  const { submit: handleSubmit } = useCreateProductSubmit({
    form,
    isEdit,
    productToEdit,
    showCatalogAvailabilityToggle,
    onSuccess: handleCreateSuccess,
    onClose: handleClose,
    setStatus,
  });

  const isSubmitting = status.kind === "loading";

  useEffect(() => {
    if (!isOpen) {
      profilePickupSeededRef.current = false;
      return;
    }
    if (isEdit && productToEdit) {
      profilePickupSeededRef.current = true;
      setDraftRestored(false);
      setForm(createProductFormStateFromProduct(productToEdit));
    } else if (productToCopy) {
      profilePickupSeededRef.current = true;
      setDraftRestored(false);
      setForm(createProductFormStateFromCopiedProduct(productToCopy));
    } else {
      const draft = draftEnabled ? readCreateProductFormDraft() : null;
      if (draft) {
        // Восстанавливаем незаконченное создание: форма уже содержит свой
        // самовывоз, поэтому повторно из профиля его не подставляем.
        profilePickupSeededRef.current = true;
        setDraftRestored(true);
        setForm(draft.form);
      } else {
        setForm({
          ...CREATE_PRODUCT_INITIAL_FORM,
          ...createProductPickupFieldsFromUser(user),
        });
        profilePickupSeededRef.current = Boolean(user);
        setDraftRestored(false);
      }
    }
    setStatus({ kind: "idle", message: "" });
    // user намеренно не в deps: рефетч профиля не должен сбрасывать черновик.
  }, [isOpen, isEdit, productToEdit?._id, productToCopy?._id]);

  useEffect(() => {
    if (!isOpen || isEdit || productToCopy || profilePickupSeededRef.current || !user) {
      return;
    }
    setForm((prev) => ({
      ...prev,
      ...createProductPickupFieldsFromUser(user),
    }));
    profilePickupSeededRef.current = true;
  }, [isOpen, isEdit, productToCopy, user]);

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
    const isIntegerField = name === "productStockQuantity";
    let nextValue = value;
    if (isPriceField) {
      nextValue = formatRubPriceInput(value);
    } else if (isIntegerField) {
      nextValue = keepDigitsOnly(value);
    }
    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const discardDraft = useCallback(() => {
    clearCreateProductFormDraft();
    setForm({
      ...CREATE_PRODUCT_INITIAL_FORM,
      ...createProductPickupFieldsFromUser(user),
    });
    profilePickupSeededRef.current = Boolean(user);
    setDraftRestored(false);
    setStatus({ kind: "idle", message: "" });
  }, [user]);

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
    isSubmitting,
    handleClose,
    handleSubmit,
    descriptionChars,
    discountPreviewPercent,
    handleChange,
    handleAvailableChange,
    draftEnabled,
    draftRestored,
    discardDraft,
  };
}
