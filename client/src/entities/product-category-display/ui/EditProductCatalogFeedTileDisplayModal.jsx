import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { patchProductCatalogFeedTileDisplay } from "../api/patchProductCatalogFeedTileDisplay.js";
import {
  findCatalogFeedTileByKey,
  resolveCatalogFeedTileDisplay,
} from "../lib/resolveCatalogFeedTileDisplay.js";
import { PRODUCT_CATEGORY_DISPLAY_UI } from "../../../shared/config/appUiCopy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { ImageUrlField } from "../../../shared/ui/ImageUrlField/ImageUrlField.jsx";
import { ModalCloseIcon } from "../../../shared/ui/icon/index.js";

import "./EditProductCategoryDisplayModal.css";

/**
 * @param {{
 *   isOpen: boolean;
 *   tileKey: string | null;
 *   displays: import('../model/types.js').ProductCatalogFeedTileDisplayFromApi[];
 *   onClose: () => void;
 *   onSaved: (display: import('../model/types.js').ProductCatalogFeedTileDisplayFromApi) => void;
 * }} props
 */
export function EditProductCatalogFeedTileDisplayModal({
  isOpen,
  tileKey,
  displays,
  onClose,
  onSaved,
}) {
  const [label, setLabel] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const wasOpenRef = useRef(false);

  const tile = tileKey != null ? findCatalogFeedTileByKey(tileKey) : null;
  const overridesByKey = new Map(displays.map((row) => [row.tileKey, row]));
  const resolved =
    tile != null ? resolveCatalogFeedTileDisplay(tile, overridesByKey) : null;

  useEffect(() => {
    const didOpen = isOpen && !wasOpenRef.current;
    wasOpenRef.current = isOpen;

    if (!didOpen || !tile) {
      return undefined;
    }

    setLabel(resolved?.isCustomLabel ? resolved.label : "");
    setImageUrl(resolved?.imageUrl ?? "");
    setErrorMessage("");
    return undefined;
  }, [isOpen, tile, resolved?.isCustomLabel, resolved?.label, resolved?.imageUrl]);

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
    if (!tileKey || !resolved) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      const trimmedLabel = label.trim();
      const trimmedImage = imageUrl.trim();
      const { display } = await patchProductCatalogFeedTileDisplay(tileKey, {
        customLabel: trimmedLabel || null,
        imageUrl: trimmedImage || null,
        resetCustomLabel: trimmedLabel === "" && resolved.isCustomLabel,
        resetImageUrl: trimmedImage === "" && resolved.isCustomImage,
      });

      onSaved(display);
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : PRODUCT_CATEGORY_DISPLAY_UI.FEED_SAVE_FALLBACK,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!tileKey) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      const { display } = await patchProductCatalogFeedTileDisplay(tileKey, {
        resetCustomLabel: true,
        resetImageUrl: true,
      });
      onSaved(display);
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : PRODUCT_CATEGORY_DISPLAY_UI.FEED_SAVE_FALLBACK,
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !tileKey || !tile || !resolved) {
    return null;
  }

  const defaultLabel = tile.label;

  return createPortal(
    <div className="edit-category-display-modal__backdrop" role="presentation">
      <div
        className="edit-category-display-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-feed-tile-display-modal-title"
      >
        <div className="edit-category-display-modal__header">
          <h2
            id="edit-feed-tile-display-modal-title"
            className="edit-category-display-modal__title"
          >
            {PRODUCT_CATEGORY_DISPLAY_UI.FEED_EDIT_TITLE(resolved.label)}
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
              placeholder={PRODUCT_CATEGORY_DISPLAY_UI.LABEL_PLACEHOLDER(defaultLabel)}
              maxLength={120}
            />
            <span className="edit-category-display-modal__hint">
              {PRODUCT_CATEGORY_DISPLAY_UI.FEED_LABEL_HINT}
            </span>
          </label>

          <ImageUrlField
            label={PRODUCT_CATEGORY_DISPLAY_UI.IMAGE_FIELD}
            value={imageUrl}
            onChange={setImageUrl}
            hint={PRODUCT_CATEGORY_DISPLAY_UI.IMAGE_HINT}
          />

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
