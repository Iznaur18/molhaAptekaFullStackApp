import { useRef, useState } from "react";

import { uploadVideo } from "../../api/uploadVideo.js";
import { validateUploadVideoFile } from "../../lib/validateUploadVideoFile.js";
import { VIDEO_URL_FIELD_UI } from "../../config/appUiCopy.js";
import { UPLOAD_VIDEO_FILE_INPUT_ACCEPT } from "../../config/uploadConstants.js";

import "../ImageUrlField/ImageUrlField.css";

/**
 * @param {{
 *   value: string;
 *   onChange: (url: string) => void;
 *   disabled?: boolean;
 *   canUpload?: boolean;
 *   required?: boolean;
 *   validateFile?: (file: File) => Promise<string | null> | string | null;
 * }} props
 */
export function VideoUrlField({
  value,
  onChange,
  disabled = false,
  canUpload = true,
  required = false,
  validateFile = validateUploadVideoFile,
}) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const isDisabled = disabled || isUploading;
  const uploadEnabled = canUpload && !disabled;

  const handlePickFile = () => {
    if (!uploadEnabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = await Promise.resolve(validateFile(file));
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploadError("");
    setIsUploading(true);
    try {
      const url = await uploadVideo(file);
      onChange(url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : VIDEO_URL_FIELD_UI.ERROR_GENERIC;
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (event) => {
    setUploadError("");
    onChange(event.target.value);
  };

  return (
    <div className="image-url-field">
      <div className="image-url-field__row">
        <input
          className="image-url-field__input"
          type="url"
          value={value}
          onChange={handleUrlChange}
          placeholder="https://…/video.mp4"
          autoComplete="off"
          disabled={isDisabled}
          required={required}
        />
        {uploadEnabled ? (
          <button
            type="button"
            className="image-url-field__upload-btn"
            onClick={handlePickFile}
            disabled={isDisabled}
          >
            {isUploading
              ? VIDEO_URL_FIELD_UI.UPLOAD_LOADING
              : VIDEO_URL_FIELD_UI.UPLOAD_BUTTON}
          </button>
        ) : null}
      </div>
      <p className="image-url-field__hint">{VIDEO_URL_FIELD_UI.UPLOAD_HINT}</p>
      {uploadError ? (
        <p className="image-url-field__error" role="alert">
          {uploadError}
        </p>
      ) : null}
      <input
        ref={fileInputRef}
        className="image-url-field__file-input"
        type="file"
        accept={UPLOAD_VIDEO_FILE_INPUT_ACCEPT}
        aria-label={VIDEO_URL_FIELD_UI.FILE_INPUT_ARIA}
        tabIndex={-1}
        onChange={handleFileChange}
      />
    </div>
  );
}
