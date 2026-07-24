import { useRef, useState } from "react";

import { EDIT_PROFILE_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { UPLOAD_FILE_INPUT_ACCEPT } from "../../../shared/config/uploadConstants.js";
import { prepareBrowserImageFileForUpload } from "../../../shared/lib/prepareBrowserImageFileForUpload.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { useSquareImageCropBeforeUpload } from "../../../shared/lib/useSquareImageCropBeforeUpload.js";
import { validateUploadImageFile } from "../../../shared/lib/validateUploadImageFile.js";
import { useUploadAssetMutations } from "../../../shared/model/useUploadAssetMutations.js";
import { SquareImageCropModal } from "../../../shared/ui/SquareImageCropModal/SquareImageCropModal.jsx";
import {
  DEFAULT_USER_AVATAR_FOCUS,
  formatProfileImageObjectPosition,
} from "../lib/profileImageFocus.js";

import "./ProfileAvatarUpload.css";

/**
 * @param {{
 *   avatarUrl: string;
 *   avatarFocus?: { x: number; y: number };
 *   disabled?: boolean;
 *   onAvatarUrlChange: (url: string) => void;
 *   onAvatarFocusChange?: (focus: { x: number; y: number }) => void;
 * }} props
 */
export function ProfileAvatarUpload({
  avatarUrl,
  avatarFocus = DEFAULT_USER_AVATAR_FOCUS,
  disabled = false,
  onAvatarUrlChange,
  onAvatarFocusChange,
}) {
  const fileInputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const { uploadImageMutation } = useUploadAssetMutations();
  const {
    cropFile,
    transformFileBeforeUpload,
    handleCropConfirm,
    handleCropCancel,
  } = useSquareImageCropBeforeUpload();
  const [localError, setLocalError] = useState("");

  const isBusy = uploadImageMutation.isPending;
  const isDisabled = disabled || isBusy;
  const displayUrl = resolveUploadedImageUrl(avatarUrl);
  const objectPosition = formatProfileImageObjectPosition(avatarFocus);

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
      const cropped = await transformFileBeforeUpload(rawFile);
      if (!cropped) return;

      const file = await prepareBrowserImageFileForUpload(cropped);
      const validationError = validateUploadImageFile(file);
      if (validationError) {
        setLocalError(validationError);
        return;
      }

      const url = await uploadImageMutation.mutateAsync(file);
      onAvatarUrlChange(url);
      onAvatarFocusChange?.(DEFAULT_USER_AVATAR_FOCUS);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : EDIT_PROFILE_MODAL_UI.UPLOAD_ERROR,
      );
    }
  };

  return (
    <div className="profile-avatar-upload">
      <p className="profile-avatar-upload__label">{EDIT_PROFILE_MODAL_UI.LABEL_AVATAR}</p>
      <div className="profile-avatar-upload__preview" aria-hidden={!displayUrl}>
        {displayUrl ? (
          <img
            className="profile-avatar-upload__image"
            src={displayUrl}
            alt=""
            style={{ objectPosition }}
          />
        ) : null}
      </div>
      <button
        type="button"
        className="profile-avatar-upload__button"
        onClick={handlePick}
        disabled={isDisabled}
      >
        {isBusy ? EDIT_PROFILE_MODAL_UI.UPLOAD_LOADING : EDIT_PROFILE_MODAL_UI.UPLOAD_BUTTON}
      </button>
      <p className="profile-avatar-upload__hint">{EDIT_PROFILE_MODAL_UI.UPLOAD_HINT}</p>
      {localError ? (
        <p className="profile-avatar-upload__error" role="alert">
          {localError}
        </p>
      ) : null}
      <input
        ref={fileInputRef}
        className="profile-avatar-upload__file"
        type="file"
        accept={UPLOAD_FILE_INPUT_ACCEPT}
        tabIndex={-1}
        aria-label={EDIT_PROFILE_MODAL_UI.UPLOAD_BUTTON}
        onChange={(event) => void handleFileChange(event)}
      />
      <SquareImageCropModal
        file={cropFile}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
    </div>
  );
}
