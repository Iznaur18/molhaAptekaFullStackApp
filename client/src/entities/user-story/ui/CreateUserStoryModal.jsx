import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";

import { useUploadAssetMutations } from "../../../shared/model/useUploadAssetMutations.js";
import { USER_STORY_UI } from "../../../shared/config/appUiCopy.js";
import { useRegisterBlockingOverlay } from "../../../shared/lib/useBlockingOverlayOccupancy.js";
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

const DISMISS_GUARD_MS = 700;

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
  const previewUrlRef = useRef("");
  const dismissGuardUntilRef = useRef(0);
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
  useRegisterBlockingOverlay(mounted);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

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

  const revokePreviewIfNeeded = useCallback(() => {
    const current = previewUrlRef.current;
    if (current.startsWith("blob:")) {
      URL.revokeObjectURL(current);
    }
  }, []);

  const resetForm = useCallback(() => {
    revokePreviewIfNeeded();
    setCaptionText("");
    setPreviewUrl("");
    setMediaType(null);
    setSelectedFile(null);
    setError("");
  }, [revokePreviewIfNeeded]);

  useEffect(() => {
    if (!mounted && !isOpen) {
      resetForm();
    }
  }, [isOpen, mounted, resetForm]);

  const armDismissGuard = useCallback(() => {
    dismissGuardUntilRef.current = Date.now() + DISMISS_GUARD_MS;
  }, []);

  const handleClose = () => {
    if (isFormBusy) {
      return;
    }
    onClose();
  };

  const handleDismiss = () => {
    if (isFormBusy || Date.now() < dismissGuardUntilRef.current) {
      return;
    }
    handleClose();
  };

  const replacePreview = (file, nextMediaType) => {
    revokePreviewIfNeeded();
    setSelectedFile(file);
    setMediaType(nextMediaType);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const applyPickedFile = (file, nextMediaType) => {
    const validationError =
      nextMediaType === USER_STORY_MEDIA_TYPE_VIDEO
        ? validateStoryVideoFile(file)
        : validateUploadImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    replacePreview(file, nextMediaType);
  };

  const resolvePickedMediaType = (file) => {
    if (file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name)) {
      return USER_STORY_MEDIA_TYPE_VIDEO;
    }
    return USER_STORY_MEDIA_TYPE_IMAGE;
  };

  const handleFileInputChange = (event) => {
    armDismissGuard();
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    applyPickedFile(file, resolvePickedMediaType(file));
  };

  const mediaFileAccept = `${UPLOAD_FILE_INPUT_ACCEPT},${UPLOAD_VIDEO_FILE_INPUT_ACCEPT}`;

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
      <button
        type="button"
        className="create-user-story-modal__scrim"
        aria-label={USER_STORY_UI.CLOSE}
        disabled={isFormBusy}
        onClick={handleDismiss}
      />
      <div className="create-user-story-modal__keyboard-bleed" aria-hidden="true" />
      <div
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
              type="button"
              className="create-user-story-modal__close"
              onClick={handleClose}
              disabled={isFormBusy}
            >
              {USER_STORY_UI.CLOSE}
            </button>
          </header>

          <label
            className={[
              "create-user-story-modal__preview",
              isFormBusy ? "create-user-story-modal__preview--disabled" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
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
            <input
              type="file"
              accept={mediaFileAccept}
              className="create-user-story-modal__file-input"
              disabled={isFormBusy}
              onClick={armDismissGuard}
              onChange={handleFileInputChange}
              aria-label={USER_STORY_UI.ERROR_MEDIA_REQUIRED}
            />
          </label>

          {error ? (
            <p className="create-user-story-modal__error" role="alert">
              {error}
            </p>
          ) : null}

          <label className="create-user-story-modal__caption-label">
            {USER_STORY_UI.CAPTION_LABEL}
            <textarea
              className="create-user-story-modal__caption"
              value={captionText}
              onChange={(event) => setCaptionText(event.target.value)}
              placeholder={USER_STORY_UI.CAPTION_PLACEHOLDER}
              maxLength={USER_STORY_CAPTION_MAX_CHARS}
              rows={6}
              disabled={isFormBusy}
              enterKeyHint="done"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </label>
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
