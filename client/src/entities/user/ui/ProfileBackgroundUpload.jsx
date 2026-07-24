import { useRef, useState } from "react";

import { EDIT_PROFILE_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { UPLOAD_FILE_INPUT_ACCEPT } from "../../../shared/config/uploadConstants.js";
import { prepareBrowserImageFileForUpload } from "../../../shared/lib/prepareBrowserImageFileForUpload.js";
import { validateUploadImageFile } from "../../../shared/lib/validateUploadImageFile.js";
import { useUploadAssetMutations } from "../../../shared/model/useUploadAssetMutations.js";
import { DEFAULT_USER_BACKGROUND_FOCUS } from "../lib/profileImageFocus.js";
import { UserBackgroundPresetPicker } from "./UserBackgroundPresetPicker.jsx";
import { UserBackgroundPreview } from "./UserBackgroundPreview.jsx";

import "./ProfileBackgroundUpload.css";

/**
 * @param {{
 *   mode: 'preset' | 'image' | 'admin';
 *   presetId: string;
 *   imageUrl: string;
 *   focus?: { x: number; y: number };
 *   disabled?: boolean;
 *   onPresetChange: (presetId: string) => void;
 *   onImageUrlChange: (url: string) => void;
 *   onFocusChange?: (focus: { x: number; y: number }) => void;
 * }} props
 */
export function ProfileBackgroundUpload({
  mode,
  presetId,
  imageUrl,
  focus = DEFAULT_USER_BACKGROUND_FOCUS,
  disabled = false,
  onPresetChange,
  onImageUrlChange,
  onFocusChange,
}) {
  const fileInputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const { uploadImageMutation } = useUploadAssetMutations();
  const [localError, setLocalError] = useState("");

  const isBusy = uploadImageMutation.isPending;
  const isDisabled = disabled || isBusy;
  const showImageControls = mode === "image" || mode === "admin";

  const handlePick = () => {
    if (isDisabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const rawFile = event.target.files?.[0];
    event.target.value = "";
    if (!rawFile) return;

    setLocalError("");
    try {
      const file = await prepareBrowserImageFileForUpload(rawFile);
      const validationError = validateUploadImageFile(file);
      if (validationError) {
        setLocalError(validationError);
        return;
      }

      const url = await uploadImageMutation.mutateAsync(file);
      onImageUrlChange(url);
      onFocusChange?.(DEFAULT_USER_BACKGROUND_FOCUS);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : EDIT_PROFILE_MODAL_UI.UPLOAD_ERROR,
      );
    }
  };

  const handleRemoveImage = () => {
    if (isDisabled) return;
    onImageUrlChange("");
    onFocusChange?.(DEFAULT_USER_BACKGROUND_FOCUS);
  };

  return (
    <div className="profile-background-upload">
      <p className="profile-background-upload__label">
        {EDIT_PROFILE_MODAL_UI.LABEL_BACKGROUND}
      </p>

      <div className="profile-background-upload__preview">
        <UserBackgroundPreview
          presetId={presetId}
          imageUrl={imageUrl}
          mode={mode}
          focus={focus}
        />
      </div>

      {mode === "preset" ? (
        <UserBackgroundPresetPicker
          value={presetId}
          onChange={onPresetChange}
          disabled={isDisabled}
          legend={EDIT_PROFILE_MODAL_UI.LABEL_BG_PRESET}
        />
      ) : null}

      {showImageControls ? (
        <div className="profile-background-upload__actions">
          <button
            type="button"
            className="profile-background-upload__upload"
            onClick={handlePick}
            disabled={isDisabled}
          >
            {isBusy
              ? EDIT_PROFILE_MODAL_UI.UPLOAD_LOADING
              : EDIT_PROFILE_MODAL_UI.BG_UPLOAD_BUTTON}
          </button>
          {imageUrl.trim() ? (
            <button
              type="button"
              className="profile-background-upload__remove"
              onClick={handleRemoveImage}
              disabled={isDisabled}
            >
              {EDIT_PROFILE_MODAL_UI.BG_REMOVE_IMAGE}
            </button>
          ) : null}
        </div>
      ) : null}

      {mode === "admin" ? (
        <UserBackgroundPresetPicker
          value={presetId}
          onChange={onPresetChange}
          disabled={isDisabled}
          legend={EDIT_PROFILE_MODAL_UI.LABEL_BG_PRESET}
        />
      ) : null}

      {localError ? (
        <p className="profile-background-upload__error" role="alert">
          {localError}
        </p>
      ) : null}

      <input
        ref={fileInputRef}
        className="profile-background-upload__file"
        type="file"
        accept={UPLOAD_FILE_INPUT_ACCEPT}
        tabIndex={-1}
        aria-label={EDIT_PROFILE_MODAL_UI.BG_UPLOAD_BUTTON}
        onChange={(event) => void handleFileChange(event)}
      />
    </div>
  );
}
