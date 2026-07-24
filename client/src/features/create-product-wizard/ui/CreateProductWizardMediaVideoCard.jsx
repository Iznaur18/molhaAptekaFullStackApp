import { useRef, useState } from "react";

import { validateUploadVideoFile } from "../../../shared/lib/validateUploadVideoFile.js";
import { useUploadAssetMutations } from "../../../shared/model/useUploadAssetMutations.js";
import { UPLOAD_VIDEO_FILE_INPUT_ACCEPT } from "../../../shared/config/uploadConstants.js";
import { CREATE_PRODUCT_MODAL_UI, VIDEO_URL_FIELD_UI } from "../../../shared/config/appUiCopy.js";

import "./CreateProductWizardMediaVideoCard.css";

/**
 * Паритет mobile `ProductPreviewVideoUploadField`: flat, без URL/accordion.
 *
 * @param {{
 *   value: string;
 *   onChange: (url: string) => void;
 *   disabled?: boolean;
 * }} props
 */
export function CreateProductWizardMediaVideoCard({ value, onChange, disabled = false }) {
  const fileInputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const { uploadVideoMutation } = useUploadAssetMutations();
  const [errorMessage, setErrorMessage] = useState("");

  const previewUrl = String(value ?? "").trim();
  const hasVideo = previewUrl.length > 0;
  const isBusy = uploadVideoMutation.isPending;

  const pickButtonLabel = isBusy
    ? CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_VIDEO_UPLOAD_LOADING
    : hasVideo
      ? CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_VIDEO_REPLACE
      : CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_VIDEO_PICK;

  const handlePickClick = () => {
    if (disabled || isBusy) {
      return;
    }
    setErrorMessage("");
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const validationError = validateUploadVideoFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage("");
    try {
      const storedUrl = await uploadVideoMutation.mutateAsync({
        file,
        purpose: "product-preview",
      });
      onChange(storedUrl);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : VIDEO_URL_FIELD_UI.ERROR_GENERIC,
      );
    }
  };

  const handleClear = () => {
    if (disabled || isBusy) {
      return;
    }
    setErrorMessage("");
    onChange("");
  };

  return (
    <section className="create-product-wizard-media-video" aria-label={CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_VIDEO_TITLE}>
      <h4 className="create-product-wizard-media-video__label">
        {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_VIDEO_TITLE}{" "}
        <span className="create-product-wizard-media-video__optional">
          {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_VIDEO_OPTIONAL_TAG}
        </span>
      </h4>
      <p className="create-product-wizard-media-video__hint">
        {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_VIDEO_DURATION_HINT}
      </p>

      {hasVideo ? (
        <div className="create-product-wizard-media-video__preview">
          <video
            className="create-product-wizard-media-video__player"
            src={previewUrl}
            muted
            playsInline
            loop
            autoPlay
            controls={false}
          />
        </div>
      ) : null}

      <button
        type="button"
        className="create-product-wizard-media-video__pick"
        onClick={handlePickClick}
        disabled={disabled || isBusy}
      >
        {pickButtonLabel}
      </button>

      {hasVideo ? (
        <button
          type="button"
          className="create-product-wizard-media-video__clear"
          onClick={handleClear}
          disabled={disabled || isBusy}
        >
          {CREATE_PRODUCT_MODAL_UI.WIZARD_MEDIA_VIDEO_CLEAR}
        </button>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept={UPLOAD_VIDEO_FILE_INPUT_ACCEPT}
        hidden
        onChange={(event) => void handleFileChange(event)}
      />

      {errorMessage ? (
        <p className="create-product-wizard-media-video__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
