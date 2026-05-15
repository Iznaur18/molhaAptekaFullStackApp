import { useEffect, useState } from "react";

import { createProduct } from "../api/createProduct.js";
import { patchMyProduct } from "../api/patchMyProduct.js";
import { resolveProductImageUrls } from "../lib/resolveProductImageUrls.js";
import {
  PRODUCT_CATEGORY_ELECTRONICS,
  PRODUCT_IMAGE_URLS_MAX,
} from "../model/productConstants.js";
import { CreateProductCategorySelect } from "./CreateProductCategorySelect.jsx";
import {
  COMMON_UI,
  CREATE_PRODUCT_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";

import "./CreateProductModal.css";

const INITIAL_FORM = {
  productName: "",
  productDescription: "",
  productImageUrls: [""],
  productPrice: "",
  productCategory: PRODUCT_CATEGORY_ELECTRONICS,
  productIsAvailable: true,
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
  return {
    productName: product.productName?.trim() ?? "",
    productDescription: product.productDescription?.trim() ?? "",
    productImageUrls: urls.length > 0 ? urls : [""],
    productPrice: priceStr,
    productCategory: product.productCategory ?? PRODUCT_CATEGORY_ELECTRONICS,
    productIsAvailable: product.productIsAvailable !== false,
  };
}

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onSuccess?: (product: import('../model/types.js').ProductFromApi) => void;
 *   mode?: 'create' | 'edit';
 *   productToEdit?: import('../model/types.js').ProductFromApi | null;
 * }} props
 */
export function CreateProductModal({
  isOpen,
  onClose,
  onSuccess,
  mode = "create",
  productToEdit = null,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState({ kind: "idle", message: "" });
  const isEdit = mode === "edit";

  useEffect(() => {
    if (!isOpen) return;
    if (isEdit && productToEdit) {
      setForm(formStateFromProduct(productToEdit));
    } else {
      setForm(INITIAL_FORM);
    }
    setStatus({ kind: "idle", message: "" });
  }, [isOpen, isEdit, productToEdit?._id]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvailableChange = (event) => {
    const checked = event.target.checked;
    setForm((prev) => ({ ...prev, productIsAvailable: checked }));
  };

  const handleClose = () => {
    setStatus({ kind: "idle", message: "" });
    onClose();
  };

  /** @param {number} index */
  const handleImageRowChange = (index) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({
      ...prev,
      productImageUrls: prev.productImageUrls.map((v, i) =>
        i === index ? value : v,
      ),
    }));
  };

  const handleAddImageRow = () => {
    setForm((prev) => {
      if (prev.productImageUrls.length >= PRODUCT_IMAGE_URLS_MAX) return prev;
      return { ...prev, productImageUrls: [...prev.productImageUrls, ""] };
    });
  };

  /** @param {number} index */
  const handleRemoveImageRow = (index) => () => {
    setForm((prev) => {
      if (prev.productImageUrls.length <= 1) {
        return { ...prev, productImageUrls: [""] };
      }
      return {
        ...prev,
        productImageUrls: prev.productImageUrls.filter((_, i) => i !== index),
      };
    });
  };

  const parsePrice = (raw) => {
    const normalized = String(raw).trim().replace(",", ".");
    return Number(normalized);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ kind: "loading", message: "" });

    try {
      const productPrice = parsePrice(form.productPrice);
      if (!Number.isFinite(productPrice) || productPrice < 0) {
        setStatus({
          kind: "error",
          message: CREATE_PRODUCT_MODAL_UI.ERROR_PRICE,
        });
        return;
      }

      const urls = form.productImageUrls
        .map((s) => String(s).trim())
        .filter(Boolean);

      let product;
      if (isEdit) {
        if (productToEdit?._id == null) {
          setStatus({
            kind: "error",
            message: CREATE_PRODUCT_MODAL_UI.ERROR_EDIT_GENERIC,
          });
          return;
        }
        product = await patchMyProduct(String(productToEdit._id), {
          productName: form.productName.trim(),
          productDescription: form.productDescription.trim(),
          productImageUrls: urls,
          productPrice,
          productCategory: form.productCategory,
          productIsAvailable: form.productIsAvailable,
        });
      } else {
        product = await createProduct({
          productName: form.productName,
          productDescription: form.productDescription,
          productImageUrls: urls.length > 0 ? urls : undefined,
          productPrice,
          productCategory: form.productCategory,
          productIsAvailable: form.productIsAvailable,
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
            {COMMON_UI.MODAL_CLOSE_GLYPH}
          </button>
        </div>
        <div className="create-product-modal__body">
          <form className="create-product-modal__form" onSubmit={handleSubmit}>
            <label className="create-product-modal__label">
              {CREATE_PRODUCT_MODAL_UI.LABEL_NAME}
              <input
                className="create-product-modal__input"
                type="text"
                name="productName"
                value={form.productName}
                onChange={handleChange}
                required
                minLength={3}
                autoComplete="off"
              />
            </label>
            <label className="create-product-modal__label">
              {CREATE_PRODUCT_MODAL_UI.LABEL_DESCRIPTION}
              <textarea
                className="create-product-modal__textarea"
                name="productDescription"
                value={form.productDescription}
                onChange={handleChange}
                required
                minLength={10}
              />
            </label>
            <fieldset className="create-product-modal__images-fieldset">
              <legend className="create-product-modal__images-legend">
                {CREATE_PRODUCT_MODAL_UI.LABEL_IMAGE_URLS}
              </legend>
              {form.productImageUrls.map((url, index) => (
                <div
                  key={index}
                  className="create-product-modal__image-row"
                >
                  <input
                    className="create-product-modal__input"
                    type="url"
                    value={url}
                    onChange={handleImageRowChange(index)}
                    placeholder="https://"
                    autoComplete="off"
                    aria-label={`${CREATE_PRODUCT_MODAL_UI.IMAGE_ROW_ARIA_PREFIX} ${index + 1}`}
                  />
                  {form.productImageUrls.length > 1 ? (
                    <button
                      type="button"
                      className="create-product-modal__image-remove"
                      onClick={handleRemoveImageRow(index)}
                      aria-label={
                        CREATE_PRODUCT_MODAL_UI.REMOVE_IMAGE_ROW_ARIA
                      }
                    >
                      {COMMON_UI.MODAL_CLOSE_GLYPH}
                    </button>
                  ) : null}
                </div>
              ))}
              {form.productImageUrls.length < PRODUCT_IMAGE_URLS_MAX ? (
                <button
                  type="button"
                  className="create-product-modal__image-add"
                  onClick={handleAddImageRow}
                >
                  {CREATE_PRODUCT_MODAL_UI.ADD_IMAGE_ROW}
                </button>
              ) : null}
            </fieldset>
            <label className="create-product-modal__label">
              {CREATE_PRODUCT_MODAL_UI.LABEL_PRICE}
              <input
                className="create-product-modal__input"
                type="text"
                name="productPrice"
                value={form.productPrice}
                onChange={handleChange}
                required
                inputMode="decimal"
                autoComplete="off"
              />
            </label>
            <CreateProductCategorySelect
              value={form.productCategory}
              disabled={status.kind === "loading"}
              onChange={(productCategory) =>
                setForm((prev) => ({ ...prev, productCategory }))
              }
            />
            <label className="create-product-modal__check">
              <input
                type="checkbox"
                checked={form.productIsAvailable}
                onChange={handleAvailableChange}
              />
              {CREATE_PRODUCT_MODAL_UI.LABEL_AVAILABLE}
            </label>
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
              disabled={status.kind === "loading"}
            >
              {status.kind === "loading" ? submitLoading : submitIdle}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
