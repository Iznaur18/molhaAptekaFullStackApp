import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { buildResolvedProductCategoryDisplaysFromRoots } from "../lib/resolveProductCategoryDisplay.js";
import { patchResolvedProductCategoryDisplay } from "../lib/patchResolvedProductCategoryDisplay.js";
import { PRODUCT_CATEGORY_DISPLAY_UI } from "../../../shared/config/appUiCopy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { normalizeUploadUrlForStorage } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { ImageUrlField } from "../../../shared/ui/ImageUrlField/ImageUrlField.jsx";
import { ModalCloseIcon } from "../../../shared/ui/icon/index.js";

import "./EditProductCategoryDisplayModal.css";

/**
 * @param {{
 *   isOpen: boolean;
 *   categorySlug: import('../../product/model/types.js').ProductCategory | null;
 *   categoryRoots: import('../../product-category-tree/model/types.js').ProductCategoryNode[];
 *   displays: import('../model/types.js').ProductCategoryDisplayFromApi[];
 *   onClose: () => void;
 *   onSaved: (display: import('../model/types.js').ProductCategoryDisplayFromApi) => void;
 * }} props
 */
export function EditProductCategoryDisplayModal({
  isOpen,
  categorySlug,
  categoryRoots,
  displays,
  onClose,
  onSaved,
}) {
  const [label, setLabel] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const wasOpenRef = useRef(false);

  const resolved = useMemo(() => {
    if (categorySlug == null) {
      return null;
    }

    return (
      buildResolvedProductCategoryDisplaysFromRoots(categoryRoots, displays).find(
        (item) => item.categorySlug === categorySlug,
      ) ?? null
    );
  }, [categorySlug, categoryRoots, displays]);

  useEffect(() => {
    const didOpen = isOpen && !wasOpenRef.current;
    wasOpenRef.current = isOpen;

    if (!didOpen || !resolved) {
      return undefined;
    }

    setLabel(resolved.isCustomLabel ? resolved.label : "");
    setImageUrl(resolved.imageUrl ?? "");
    setErrorMessage("");
    return undefined;
  }, [isOpen, resolved]);

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!categorySlug || !resolved) {
      return;
    }

    try {
      setErrorMessage("");

      const trimmedLabel = label.trim();
      const trimmedImage =
        normalizeUploadUrlForStorage(imageUrl.trim()) || null;
      setIsSaving(true);
      const display = await patchResolvedProductCategoryDisplay(resolved, {
        customLabel: trimmedLabel || null,
        imageUrl: trimmedImage,
        resetCustomLabel: trimmedLabel === "" && resolved.isCustomLabel,
        resetImageUrl: !trimmedImage && resolved.isCustomImage,
      });

      onSaved(display);
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : PRODUCT_CATEGORY_DISPLAY_UI.SAVE_FALLBACK,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!categorySlug || !resolved) {
      return;
    }

    try {
      setErrorMessage("");
      setIsSaving(true);
      const display = await patchResolvedProductCategoryDisplay(resolved, {
        resetCustomLabel: true,
        resetImageUrl: true,
      });
      onSaved(display);
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : PRODUCT_CATEGORY_DISPLAY_UI.SAVE_FALLBACK,
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !categorySlug || !resolved) {
    return null;
  }

  return createPortal(
    <div className="edit-category-display-modal__backdrop" role="presentation">
      <div
        className="edit-category-display-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-category-display-modal-title"
      >
        <div className="edit-category-display-modal__header">
          <h2
            id="edit-category-display-modal-title"
            className="edit-category-display-modal__title"
          >
            {PRODUCT_CATEGORY_DISPLAY_UI.EDIT_TITLE(resolved.label)}
          </h2>
          <button
            type="button"
            className="edit-category-display-modal__close"
            onClick={onClose}
            aria-label={PRODUCT_CATEGORY_DISPLAY_UI.CLOSE_ARIA}
          >
            <ModalCloseIcon />
          </button>
        </div>

        <form className="edit-category-display-modal__form" onSubmit={handleSubmit}>
          <label className="edit-category-display-modal__field">
            <span>{PRODUCT_CATEGORY_DISPLAY_UI.LABEL_FIELD}</span>
            <input
              type="text"
              className="edit-category-display-modal__input"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder={PRODUCT_CATEGORY_DISPLAY_UI.LABEL_PLACEHOLDER(
                resolved.label,
              )}
              maxLength={120}
            />
            <span className="edit-category-display-modal__hint">
              {PRODUCT_CATEGORY_DISPLAY_UI.LABEL_HINT}
            </span>
          </label>

          <label className="edit-category-display-modal__field">
            <span>{PRODUCT_CATEGORY_DISPLAY_UI.IMAGE_FIELD}</span>
            <ImageUrlField value={imageUrl} onChange={setImageUrl} />
            <span className="edit-category-display-modal__hint">
              {PRODUCT_CATEGORY_DISPLAY_UI.IMAGE_HINT}
            </span>
          </label>

          {errorMessage ? (
            <p className="edit-category-display-modal__error" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className="edit-category-display-modal__actions">
            <button
              type="button"
              className="edit-category-display-modal__button edit-category-display-modal__button_secondary"
              onClick={() => void handleReset()}
              disabled={isSaving}
            >
              {PRODUCT_CATEGORY_DISPLAY_UI.RESET_BUTTON}
            </button>
            <button
              type="submit"
              className="edit-category-display-modal__button"
              disabled={isSaving}
            >
              {isSaving
                ? PRODUCT_CATEGORY_DISPLAY_UI.SAVING
                : PRODUCT_CATEGORY_DISPLAY_UI.SAVE_BUTTON}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
