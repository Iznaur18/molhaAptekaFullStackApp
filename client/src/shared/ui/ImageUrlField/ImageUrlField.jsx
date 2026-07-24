import { useRef, useState } from "react";

import { useUploadAssetMutations } from "../../model/useUploadAssetMutations.js";
import { prepareBrowserImageFileForUpload } from "../../lib/prepareBrowserImageFileForUpload.js";
import { validateUploadImageFile } from "../../lib/validateUploadImageFile.js";
import { IMAGE_URL_FIELD_UI } from "../../config/appUiCopy.js";
import { UPLOAD_FILE_INPUT_ACCEPT } from "../../config/uploadConstants.js";

import "./ImageUrlField.css";

/**
 * @param {{
 *   value: string;
 *   onChange: (url: string) => void;
 *   onUploaded?: (url: string) => void;
 *   transformFileBeforeUpload?: (file: File) => Promise<File | null>;
 *   disabled?: boolean;
 *   canUpload?: boolean;
 *   compact?: boolean;
 *   inputClassName?: string;
 *   placeholder?: string;
 *   name?: string;
 *   id?: string;
 *   ariaLabel?: string;
 *   required?: boolean;
 * }} props
 */
export function ImageUrlField({
  value,
  onChange,
  onUploaded,
  transformFileBeforeUpload,
  disabled = false,
  canUpload = true,
  compact = false,
  inputClassName = "",
  placeholder = "https://",
  name,
  id,
  ariaLabel,
  required = false,
}) {
  const { uploadImageMutation } = useUploadAssetMutations();
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState("");

  const isUploading = uploadImageMutation.isPending;

  const isDisabled = disabled || isUploading;
  const uploadEnabled = canUpload && !disabled;

  const handlePickFile = () => {
    if (!uploadEnabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const rawFile = event.target.files?.[0];
    event.target.value = "";
    if (!rawFile) return;

    setUploadError("");
    try {
      let fileForUpload = rawFile;
      if (transformFileBeforeUpload) {
        const transformed = await transformFileBeforeUpload(rawFile);
        if (!transformed) {
          return;
        }
        fileForUpload = transformed;
      }

      const file = await prepareBrowserImageFileForUpload(fileForUpload);
      const validationError = validateUploadImageFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      const url = await uploadImageMutation.mutateAsync(file);
      onChange(url);
      onUploaded?.(url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : IMAGE_URL_FIELD_UI.ERROR_GENERIC;
      setUploadError(message);
    }
  };

  const handleUrlChange = (event) => {
    setUploadError("");
    onChange(event.target.value);
  };

  const rootClass = ["image-url-field", compact ? "image-url-field_compact" : ""]
    .filter(Boolean)
    .join(" ");

  const inputClass = compact
    ? "image-url-field__input"
    : inputClassName || "image-url-field__input";

  return (
    <div className={rootClass}>
      <div className="image-url-field__row">
        <input
          className={inputClass}
          type="text"
          inputMode="url"
          name={name}
          id={id}
          value={value}
          onChange={handleUrlChange}
          placeholder={placeholder}
          autoComplete="off"
          disabled={isDisabled}
          required={required}
          aria-label={ariaLabel}
        />
        {uploadEnabled ? (
          <button
            type="button"
            className="image-url-field__upload-btn"
            onClick={handlePickFile}
            disabled={isDisabled}
          >
            {isUploading
              ? IMAGE_URL_FIELD_UI.UPLOAD_LOADING
              : IMAGE_URL_FIELD_UI.UPLOAD_BUTTON}
          </button>
        ) : null}
      </div>
      {!canUpload && !compact ? (
        <p className="image-url-field__hint">
          {IMAGE_URL_FIELD_UI.UPLOAD_DISABLED_HINT}
        </p>
      ) : compact ? null : (
        <p className="image-url-field__hint">{IMAGE_URL_FIELD_UI.UPLOAD_HINT}</p>
      )}
      {uploadError ? (
        <p className="image-url-field__error" role="alert">
          {uploadError}
        </p>
      ) : null}
      <input
        ref={fileInputRef}
        className="image-url-field__file-input"
        type="file"
        accept={UPLOAD_FILE_INPUT_ACCEPT}
        aria-label={IMAGE_URL_FIELD_UI.FILE_INPUT_ARIA}
        tabIndex={-1}
        onChange={handleFileChange}
      />
    </div>
  );
}
