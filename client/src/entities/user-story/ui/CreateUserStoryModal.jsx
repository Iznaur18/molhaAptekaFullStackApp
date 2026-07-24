import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";

import { useUploadAssetMutations } from "../../../shared/model/useUploadAssetMutations.js";
import { USER_STORY_UI } from "../../../shared/config/appUiCopy.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import {
  UPLOAD_FILE_INPUT_ACCEPT,
  UPLOAD_VIDEO_FILE_INPUT_ACCEPT,
} from "../../../shared/config/uploadConstants.js";
import { validateUploadImageFile } from "../../../shared/lib/validateUploadImageFile.js";
import { useUserStoryMutations } from "../model/useUserStoryMutations.js";
import { useCreateUserStoryModalAnimation } from "../model/useCreateUserStoryModalAnimation.js";
import { validateStoryVideoFile } from "../lib/validateStoryVideoFile.js";
import {
  USER_STORY_CAPTION_MAX_CHARS,
  USER_STORY_MEDIA_TYPE_IMAGE,
  USER_STORY_MEDIA_TYPE_VIDEO,
} from "../model/constants.js";

import "./CreateUserStoryModal.css";

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onPublished: () => void;
 * }} props
 */
export function CreateUserStoryModal({ isOpen, onClose, onPublished }) {
  const { createMutation } = useUserStoryMutations();
  const { uploadImageMutation, uploadVideoMutation } = useUploadAssetMutations();
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const imageInputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const videoInputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const [captionText, setCaptionText] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [mediaType, setMediaType] = useState(
    /** @type {'image' | 'video' | null} */ (null),
  );
  const [selectedFile, setSelectedFile] = useState(/** @type {File | null} */ (null));
  const [error, setError] = useState("");
  const { mounted, isVisible } = useCreateUserStoryModalAnimation(isOpen);

  const isFormBusy =
    uploadImageMutation.isPending ||
    uploadVideoMutation.isPending ||
    createMutation.isPending;

  useScrollLock(mounted);
  useDialogFocusTrap(panelRef, {
    active: isOpen && isVisible,
    initialFocusRef: closeButtonRef,
  });

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !isFormBusy) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isFormBusy, isOpen, onClose]);

  const resetForm = useCallback(() => {
    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setCaptionText("");
    setPreviewUrl("");
    setMediaType(null);
    setSelectedFile(null);
    setError("");
  }, [previewUrl]);

  useEffect(() => {
    if (!mounted && !isOpen) {
      resetForm();
    }
  }, [isOpen, mounted, resetForm]);

  const handleClose = () => {
    if (isFormBusy) {
      return;
    }
    onClose();
  };

  const replacePreview = (file, nextMediaType) => {
    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(file);
    setMediaType(nextMediaType);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleImagePick = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const validationError = validateUploadImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    replacePreview(file, USER_STORY_MEDIA_TYPE_IMAGE);
  };

  const handleVideoPick = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const validationError = validateStoryVideoFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    replacePreview(file, USER_STORY_MEDIA_TYPE_VIDEO);
  };

  const handlePublish = async () => {
    const caption = captionText.trim();
    if (caption.length > USER_STORY_CAPTION_MAX_CHARS) {
      setError(USER_STORY_UI.ERROR_CAPTION);
      return;
    }

    if (!selectedFile || !mediaType) {
      setError(USER_STORY_UI.ERROR_MEDIA_REQUIRED);
      return;
    }

    setError("");
    try {
      const mediaUrl =
        mediaType === USER_STORY_MEDIA_TYPE_VIDEO
          ? await uploadVideoMutation.mutateAsync({ file: selectedFile, purpose: "story" })
          : await uploadImageMutation.mutateAsync(selectedFile);

      await createMutation.mutateAsync({
        mediaType,
        mediaUrl,
        captionText: caption,
      });

      onPublished();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : USER_STORY_UI.ERROR_GENERIC);
    }
  };

  const handlePreviewVideoRef = useCallback((node) => {
    if (!node) {
      return;
    }

    node.muted = true;
    node.loop = true;
    void node.play().catch(() => {});
  }, []);

  if (!mounted) {
    return null;
  }

  const backdropClassName = [
    "create-user-story-modal__backdrop",
    isVisible ? "create-user-story-modal__backdrop--open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <div className={backdropClassName} role="presentation">
      <div className="create-user-story-modal__scrim" aria-hidden="true" />
      <button
        type="button"
        className="create-user-story-modal__dismiss"
        aria-label={USER_STORY_UI.CLOSE}
        disabled={isFormBusy}
        onClick={handleClose}
      />
      <div
        ref={panelRef}
        className="create-user-story-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-user-story-title"
      >
        <div className="create-user-story-modal__body">
          <header className="create-user-story-modal__header">
            <h2 id="create-user-story-title" className="create-user-story-modal__title">
              {USER_STORY_UI.CREATE_TITLE}
            </h2>
            <button
              ref={closeButtonRef}
              type="button"
              className="create-user-story-modal__close"
              onClick={handleClose}
              disabled={isFormBusy}
            >
              {USER_STORY_UI.CLOSE}
            </button>
          </header>

          <div className="create-user-story-modal__preview">
            {previewUrl ? (
              mediaType === USER_STORY_MEDIA_TYPE_VIDEO ? (
                <video
                  ref={handlePreviewVideoRef}
                  className="create-user-story-modal__media"
                  src={previewUrl}
                  muted
                  playsInline
                  loop
                />
              ) : (
                <img className="create-user-story-modal__media" src={previewUrl} alt="" />
              )
            ) : (
              <p className="create-user-story-modal__placeholder">
                {USER_STORY_UI.ERROR_MEDIA_REQUIRED}
              </p>
            )}
          </div>

          <div className="create-user-story-modal__pickers">
            <button
              type="button"
              className="create-user-story-modal__pick"
              disabled={isFormBusy}
              onClick={() => imageInputRef.current?.click()}
            >
              {USER_STORY_UI.PICK_PHOTO}
            </button>
            <button
              type="button"
              className="create-user-story-modal__pick"
              disabled={isFormBusy}
              onClick={() => videoInputRef.current?.click()}
            >
              {USER_STORY_UI.PICK_VIDEO}
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept={UPLOAD_FILE_INPUT_ACCEPT}
              hidden
              onChange={handleImagePick}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept={UPLOAD_VIDEO_FILE_INPUT_ACCEPT}
              hidden
              onChange={handleVideoPick}
            />
          </div>

          <p className="create-user-story-modal__video-hint">{USER_STORY_UI.VIDEO_DURATION_HINT}</p>

          <label className="create-user-story-modal__caption-label">
            {USER_STORY_UI.CAPTION_LABEL}
            <textarea
              className="create-user-story-modal__caption"
              value={captionText}
              onChange={(event) => setCaptionText(event.target.value)}
              placeholder={USER_STORY_UI.CAPTION_PLACEHOLDER}
              maxLength={USER_STORY_CAPTION_MAX_CHARS}
              rows={2}
              disabled={isFormBusy}
            />
          </label>

          {error ? (
            <p className="create-user-story-modal__error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="create-user-story-modal__footer">
          <button
            type="button"
            className="create-user-story-modal__submit"
            disabled={isFormBusy}
            onClick={() => void handlePublish()}
          >
            {isFormBusy ? USER_STORY_UI.PUBLISHING : USER_STORY_UI.PUBLISH}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
