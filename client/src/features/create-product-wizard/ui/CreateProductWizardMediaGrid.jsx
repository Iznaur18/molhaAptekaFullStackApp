import { useRef, useState } from "react";

import { PRODUCT_IMAGE_URLS_MAX } from "../../../entities/product/model/productConstants.js";
import { useUploadAssetMutations } from "../../../shared/model/useUploadAssetMutations.js";
import { resolveImageUrlForDisplay } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { validateUploadImageFile } from "../../../shared/lib/validateUploadImageFile.js";
import { UPLOAD_FILE_INPUT_ACCEPT } from "../../../shared/config/uploadConstants.js";
import { CREATE_PRODUCT_MODAL_UI, IMAGE_URL_FIELD_UI } from "../../../shared/config/appUiCopy.js";

import "./CreateProductWizardMediaGrid.css";

const PRODUCT_PHOTO_GRID_COLUMNS = 3;

/**
 * Паритет mobile `ProductPhotoGrid`: 3-col, cover bar, ✕, multi-pick «+ Фото».
 *
 * @param {{
 *   urls: string[];
 *   onChange: (urls: string[]) => void;
 *   maxCount?: number;
 *   disabled?: boolean;
 * }} props
 */
export function CreateProductWizardMediaGrid({
  urls,
  onChange,
  maxCount = PRODUCT_IMAGE_URLS_MAX,
  disabled = false,
}) {
  const fileInputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const { uploadImageMutation } = useUploadAssetMutations();
  const [uploadingCount, setUploadingCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const remaining = maxCount - urls.length - uploadingCount;
  const isBusy = uploadingCount > 0;

  const handleAddClick = () => {
    if (disabled || isBusy || remaining <= 0) {
      return;
    }
    setErrorMessage("");
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0 || remaining <= 0) {
      return;
    }

    const selected = files.slice(0, remaining);
    setUploadingCount(selected.length);
    let next = [...urls];

    for (const file of selected) {
      const validationError = validateUploadImageFile(file);
      if (validationError) {
        setErrorMessage(validationError);
        setUploadingCount((count) => Math.max(0, count - 1));
        continue;
      }

      try {
        const storedUrl = await uploadImageMutation.mutateAsync(file);
        next = [...next, storedUrl];
        onChange(next);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : IMAGE_URL_FIELD_UI.ERROR_GENERIC,
        );
      } finally {
        setUploadingCount((count) => Math.max(0, count - 1));
      }
    }
  };

  const makeCover = (index) => {
    if (index === 0 || disabled) {
      return;
    }
    onChange([urls[index], ...urls.filter((_, i) => i !== index)]);
  };

  const removeAt = (index) => {
    if (disabled) {
      return;
    }
    onChange(urls.filter((_, i) => i !== index));
  };

  return (
    <div className="create-product-wizard-media-grid">
      <div
        className="create-product-wizard-media-grid__tiles"
        style={{ "--product-photo-grid-columns": PRODUCT_PHOTO_GRID_COLUMNS }}
      >
        {urls.map((url, index) => (
          <div key={`${url}-${index}`} className="create-product-wizard-media-grid__tile">
            <button
              type="button"
              className="create-product-wizard-media-grid__tile-hit"
              onClick={() => makeCover(index)}
              disabled={disabled || index === 0}
              aria-label={
                index === 0
                  ? CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_COVER_BADGE
                  : CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_TAP_TO_COVER_HINT
              }
            >
              <img
                className="create-product-wizard-media-grid__tile-image"
                src={resolveImageUrlForDisplay(url)}
                alt=""
              />
              {index === 0 ? (
                <span className="create-product-wizard-media-grid__cover-badge">
                  {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_COVER_BADGE}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className="create-product-wizard-media-grid__remove"
              onClick={() => removeAt(index)}
              disabled={disabled}
              aria-label={CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_REMOVE}
            >
              ✕
            </button>
          </div>
        ))}

        {Array.from({ length: uploadingCount }).map((_, index) => (
          <div
            key={`uploading-${index}`}
            className="create-product-wizard-media-grid__tile create-product-wizard-media-grid__tile_uploading"
            aria-busy="true"
          >
            <span className="create-product-wizard-media-grid__spinner" aria-hidden="true" />
          </div>
        ))}

        {urls.length + uploadingCount < maxCount ? (
          <button
            type="button"
            className="create-product-wizard-media-grid__add"
            onClick={handleAddClick}
            disabled={disabled || isBusy}
            aria-label={CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_ADD_PHOTO_ARIA}
          >
            + {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_ADD_PHOTO_TILE}
          </button>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={UPLOAD_FILE_INPUT_ACCEPT}
        multiple
        hidden
        onChange={(event) => void handleFilesSelected(event)}
      />

      <p className="create-product-wizard-media-grid__counter">
        {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_FILLED_COUNT(urls.length, maxCount)}
      </p>
      {urls.length > 0 ? (
        <p className="create-product-wizard-media-grid__hint">
          {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_CROP_HINT}
        </p>
      ) : null}
      {urls.length > 1 ? (
        <p className="create-product-wizard-media-grid__hint">
          {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_TAP_TO_COVER_HINT}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="create-product-wizard-media-grid__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
