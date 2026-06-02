import { useCallback, useRef, useState } from "react";

import { uploadImage } from "../../../shared/api/uploadImage.js";
import { uploadVideo } from "../../../shared/api/uploadVideo.js";
import { USER_STORY_UI } from "../../../shared/config/appUiCopy.js";
import { UPLOAD_FILE_INPUT_ACCEPT, UPLOAD_VIDEO_FILE_INPUT_ACCEPT } from "../../../shared/config/uploadConstants.js";
import { validateUploadImageFile } from "../../../shared/lib/validateUploadImageFile.js";
import { createUserStory } from "../api/createUserStory.js";
import { cropImageToAspectRatio } from "../lib/cropImageToAspectRatio.js";
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
  const imageInputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const videoInputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const [captionText, setCaptionText] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [mediaType, setMediaType] = useState(
    /** @type {'image' | 'video' | null} */ (null),
  );
  const [selectedFile, setSelectedFile] = useState(/** @type {File | null} */ (null));
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

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

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleImagePick = async (event) => {
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
    setIsBusy(true);
    try {
      const cropped = await cropImageToAspectRatio(file);
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(cropped);
      setMediaType(USER_STORY_MEDIA_TYPE_IMAGE);
      setPreviewUrl(URL.createObjectURL(cropped));
    } catch {
      setError(USER_STORY_UI.ERROR_IMAGE);
    } finally {
      setIsBusy(false);
    }
  };

  const handleVideoPick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setError("");
    setIsBusy(true);
    try {
      const validationError = await validateStoryVideoFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(file);
      setMediaType(USER_STORY_MEDIA_TYPE_VIDEO);
      setPreviewUrl(URL.createObjectURL(file));
    } finally {
      setIsBusy(false);
    }
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

    setIsBusy(true);
    setError("");
    try {
      const mediaUrl =
        mediaType === USER_STORY_MEDIA_TYPE_VIDEO
          ? await uploadVideo(selectedFile)
          : await uploadImage(selectedFile);

      await createUserStory({
        mediaType,
        mediaUrl,
        captionText: caption,
      });

      resetForm();
      onPublished();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : USER_STORY_UI.ERROR_GENERIC);
    } finally {
      setIsBusy(false);
    }
  };

  const handlePreviewVideoRef = useCallback((node) => {
    if (!node) {
      return;
    }

    node.muted = false;
    node.loop = true;
    void node.play().catch(() => {});
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="create-user-story-modal__backdrop" role="presentation">
      <div
        className="create-user-story-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-user-story-title"
      >
        <header className="create-user-story-modal__header">
          <h2 id="create-user-story-title" className="create-user-story-modal__title">
            {USER_STORY_UI.CREATE_TITLE}
          </h2>
          <button
            type="button"
            className="create-user-story-modal__close"
            onClick={handleClose}
            aria-label={USER_STORY_UI.CLOSE}
          >
            ×
          </button>
        </header>

        <div className="create-user-story-modal__preview">
          {previewUrl ? (
            mediaType === USER_STORY_MEDIA_TYPE_VIDEO ? (
              <video
                ref={handlePreviewVideoRef}
                className="create-user-story-modal__media"
                src={previewUrl}
                playsInline
                loop
              />
            ) : (
              <img
                className="create-user-story-modal__media"
                src={previewUrl}
                alt=""
              />
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
            disabled={isBusy}
            onClick={() => imageInputRef.current?.click()}
          >
            {USER_STORY_UI.PICK_PHOTO}
          </button>
          <button
            type="button"
            className="create-user-story-modal__pick"
            disabled={isBusy}
            onClick={() => videoInputRef.current?.click()}
          >
            {USER_STORY_UI.PICK_VIDEO}
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept={UPLOAD_FILE_INPUT_ACCEPT}
            hidden
            onChange={(event) => void handleImagePick(event)}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept={UPLOAD_VIDEO_FILE_INPUT_ACCEPT}
            hidden
            onChange={(event) => void handleVideoPick(event)}
          />
        </div>

        <label className="create-user-story-modal__caption-label">
          {USER_STORY_UI.CAPTION_LABEL}
          <textarea
            className="create-user-story-modal__caption"
            value={captionText}
            onChange={(event) => setCaptionText(event.target.value)}
            placeholder={USER_STORY_UI.CAPTION_PLACEHOLDER}
            maxLength={USER_STORY_CAPTION_MAX_CHARS}
            rows={2}
            disabled={isBusy}
          />
        </label>

        {error ? (
          <p className="create-user-story-modal__error" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          className="create-user-story-modal__submit"
          disabled={isBusy}
          onClick={() => void handlePublish()}
        >
          {isBusy ? USER_STORY_UI.PUBLISHING : USER_STORY_UI.PUBLISH}
        </button>
      </div>
    </div>
  );
}
