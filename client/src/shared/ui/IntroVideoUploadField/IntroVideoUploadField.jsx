import { useRef, useState } from "react";

import { INTRO_VIDEO_UPLOAD_UI } from "../../config/appUiCopy.js";
import { UPLOAD_VIDEO_FILE_INPUT_ACCEPT } from "../../config/uploadConstants.js";
import { validateIntroUploadVideoFile } from "../../lib/validateIntroUploadVideoFile.js";
import { resolveUploadedImageUrl } from "../../lib/resolveUploadedImageUrl.js";
import { useUploadAssetMutations } from "../../model/useUploadAssetMutations.js";

import "./IntroVideoUploadField.css";

/**
 * @param {{
 *   value: string;
 *   onChange: (url: string) => void;
 *   disabled?: boolean;
 * }} props
 */
export function IntroVideoUploadField({ value, onChange, disabled = false }) {
  const { uploadVideoMutation } = useUploadAssetMutations();
  const fileInputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const [uploadError, setUploadError] = useState("");

  const isUploading = uploadVideoMutation.isPending;
  const isDisabled = disabled || isUploading;
  const previewSrc = value ? resolveUploadedImageUrl(value) : "";
  const hasVideo = Boolean(previewSrc);

  const buttonLabel = isUploading
    ? INTRO_VIDEO_UPLOAD_UI.UPLOAD_LOADING
    : hasVideo
      ? INTRO_VIDEO_UPLOAD_UI.REPLACE_BUTTON
      : INTRO_VIDEO_UPLOAD_UI.PICK_BUTTON;

  const handlePick = () => {
    if (isDisabled) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const validationError = validateIntroUploadVideoFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploadError("");
    try {
      const url = await uploadVideoMutation.mutateAsync({ file, purpose: "intro" });
      onChange(url);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : INTRO_VIDEO_UPLOAD_UI.ERROR_GENERIC,
      );
    }
  };

  return (
    <div className="intro-video-upload">
      {hasVideo ? (
        <video
          className="intro-video-upload__preview"
          src={previewSrc}
          controls
          playsInline
          preload="metadata"
        />
      ) : null}
      <button
        type="button"
        className="intro-video-upload__pick"
        onClick={handlePick}
        disabled={isDisabled}
      >
        {buttonLabel}
      </button>
      <p className="intro-video-upload__hint">{INTRO_VIDEO_UPLOAD_UI.DURATION_HINT}</p>
      {uploadError ? (
        <p className="intro-video-upload__error" role="alert">
          {uploadError}
        </p>
      ) : null}
      <input
        ref={fileInputRef}
        className="intro-video-upload__file-input"
        type="file"
        accept={UPLOAD_VIDEO_FILE_INPUT_ACCEPT}
        aria-label={INTRO_VIDEO_UPLOAD_UI.FILE_INPUT_ARIA}
        tabIndex={-1}
        onChange={(event) => void handleFileChange(event)}
      />
    </div>
  );
}
