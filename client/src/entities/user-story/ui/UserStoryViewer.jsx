import { useCallback, useEffect, useState } from "react";

import { USER_STORY_UI } from "../../../shared/config/appUiCopy.js";
import { useUserStoryMutations } from "../model/useUserStoryMutations.js";
import {
  resolveUserStoryAvatarUrl,
  resolveUserStoryMediaUrl,
} from "../lib/resolveUserStoryMedia.js";
import { useUserStoryMediaLoadState } from "../lib/useUserStoryMediaLoadState.js";
import { useUserStoryVideoPlayback } from "../lib/useUserStoryVideoPlayback.js";
import { useUserStoriesByAuthorQuery } from "../model/useUserStoriesByAuthorQuery.js";
import {
  USER_STORY_MEDIA_TYPE_IMAGE,
  USER_STORY_MEDIA_TYPE_VIDEO,
  USER_STORY_IMAGE_VIEW_DURATION_MS,
} from "../model/constants.js";
import { ReportUserStoryModal } from "./ReportUserStoryModal.jsx";

import "./UserStoryViewer.css";

/**
 * @param {{
 *   author: import('../model/types.js').UserStoryRingFromApi['author'];
 *   isOpen: boolean;
 *   isAuthorized: boolean;
 *   currentUserId: string | null;
 *   onClose: () => void;
 *   onOpenProfile: (userId: string) => void;
 *   onStoryDeleted?: () => void;
 *   onStoryViewed?: () => void;
 * }} props
 */
export function UserStoryViewer({
  author,
  isOpen,
  isAuthorized,
  currentUserId,
  onClose,
  onOpenProfile,
  onStoryDeleted,
  onStoryViewed,
}) {
  const { deleteMutation, markViewedMutation } = useUserStoryMutations();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [actionError, setActionError] = useState("");

  const authorId = String(author._id);
  const isOwn = currentUserId != null && authorId === String(currentUserId);

  const storiesQuery = useUserStoriesByAuthorQuery({
    authorId,
    enabled: isOpen,
  });

  const stories = storiesQuery.data ?? [];
  const phase = !isOpen
    ? "idle"
    : storiesQuery.isLoading
      ? "loading"
      : storiesQuery.isError
        ? "error"
        : stories.length > 0
          ? "ready"
          : "empty";
  const error =
    storiesQuery.error instanceof Error
      ? storiesQuery.error.message
      : USER_STORY_UI.ERROR_GENERIC;

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
    }
  }, [authorId, isOpen]);

  const activeStory = stories[activeIndex] ?? null;
  const advanceStoryOrClose = useCallback(() => {
    if (activeIndex < stories.length - 1) {
      setActiveIndex((index) => index + 1);
      return;
    }
    onClose();
  }, [activeIndex, onClose, stories.length]);

  const isStoryMediaActive =
    isOpen && phase === "ready" && activeStory != null && !isReportOpen;
  const {
    isMediaLoading,
    hasMediaError,
    isMediaReady,
    markMediaLoading,
    markMediaReady,
    markMediaError,
    handleImageLoad,
    handleImageError,
  } = useUserStoryMediaLoadState({
    storyId: activeStory?._id,
    mediaType: activeStory?.mediaType,
    isActive: isStoryMediaActive,
  });

  const isVideoStoryReady =
    isStoryMediaActive && activeStory?.mediaType === USER_STORY_MEDIA_TYPE_VIDEO;
  const { videoRef, resumeIfPaused } = useUserStoryVideoPlayback({
    enabled: isVideoStoryReady,
    storyId: activeStory?._id,
    onEnded: advanceStoryOrClose,
    onMediaLoading: markMediaLoading,
    onMediaReady: markMediaReady,
    onMediaError: markMediaError,
  });

  useEffect(() => {
    if (!isOpen || !activeStory || !isAuthorized) {
      return;
    }
    void markViewedMutation.mutate(activeStory._id);
    onStoryViewed?.();
  }, [activeStory?._id, isAuthorized, isOpen, markViewedMutation, onStoryViewed]);

  useEffect(() => {
    if (
      !isOpen ||
      phase !== "ready" ||
      !activeStory ||
      isReportOpen ||
      activeStory.mediaType !== USER_STORY_MEDIA_TYPE_IMAGE ||
      !isMediaReady
    ) {
      return;
    }

    const timerId = window.setTimeout(
      advanceStoryOrClose,
      USER_STORY_IMAGE_VIEW_DURATION_MS,
    );

    return () => {
      window.clearTimeout(timerId);
    };
  }, [activeStory, advanceStoryOrClose, isMediaReady, isOpen, isReportOpen, phase]);

  const handlePrev = () => {
    setActiveIndex((index) => Math.max(0, index - 1));
  };

  const handleNext = () => {
    setActiveIndex((index) => Math.min(stories.length - 1, index + 1));
  };

  const handleDelete = async () => {
    if (!activeStory) {
      return;
    }

    setIsDeleting(true);
    setActionError("");
    try {
      await deleteMutation.mutateAsync(activeStory._id);
      onStoryDeleted?.();
      onClose();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : USER_STORY_UI.ERROR_GENERIC);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const avatarUrl = resolveUserStoryAvatarUrl(author);
  const authorName = author.userName?.trim() || authorId;
  const canReport = isAuthorized && !isOwn && activeStory != null && phase === "ready";
  const hasMultiple = stories.length > 1;
  const displayError = actionError || (phase === "error" ? error : "");

  return (
    <>
      <div className="user-story-viewer" role="dialog" aria-modal="true">
        {phase === "loading" ? (
          <p className="user-story-viewer__state">{USER_STORY_UI.LOADING}</p>
        ) : null}

        {displayError ? (
          <p
            className="user-story-viewer__state user-story-viewer__state_error"
            role="alert"
          >
            {displayError}
          </p>
        ) : null}

        {phase === "empty" ? (
          <p className="user-story-viewer__state">{USER_STORY_UI.ERROR_GENERIC}</p>
        ) : null}

        {phase === "ready" && activeStory ? (
          <div className="user-story-viewer__stage">
            {hasMultiple ? (
              <button
                type="button"
                className="user-story-viewer__edge user-story-viewer__edge_prev"
                aria-label={USER_STORY_UI.PREV_STORY}
                disabled={activeIndex <= 0}
                onClick={handlePrev}
              />
            ) : null}

            <div
              className="user-story-viewer__frame"
              onPointerDown={isVideoStoryReady ? resumeIfPaused : undefined}
            >
              <button
                type="button"
                className="user-story-viewer__close"
                onClick={onClose}
                aria-label={USER_STORY_UI.CLOSE}
              >
                ×
              </button>

              <header className="user-story-viewer__header">
                <button
                  type="button"
                  className="user-story-viewer__author"
                  onClick={() => onOpenProfile(authorId)}
                >
                  {avatarUrl ? (
                    <img className="user-story-viewer__avatar" src={avatarUrl} alt="" />
                  ) : (
                    <span className="user-story-viewer__avatar-fallback" aria-hidden>
                      {authorName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="user-story-viewer__name">{authorName}</span>
                </button>
              </header>

              {isMediaLoading ? (
                <div className="user-story-viewer__media-state" aria-live="polite">
                  <span className="user-story-viewer__spinner" aria-hidden />
                  <p className="user-story-viewer__media-state-text">
                    {USER_STORY_UI.MEDIA_LOADING}
                  </p>
                </div>
              ) : null}

              {hasMediaError ? (
                <div
                  className="user-story-viewer__media-state user-story-viewer__media-state_error"
                  role="alert"
                >
                  <p className="user-story-viewer__media-state-text">
                    {USER_STORY_UI.MEDIA_LOAD_ERROR}
                  </p>
                </div>
              ) : null}

              {activeStory.mediaType === USER_STORY_MEDIA_TYPE_VIDEO ? (
                <video
                  ref={videoRef}
                  className={
                    isMediaLoading
                      ? "user-story-viewer__media user-story-viewer__media_hidden"
                      : "user-story-viewer__media"
                  }
                  src={resolveUserStoryMediaUrl(activeStory.mediaUrl)}
                  playsInline
                />
              ) : (
                <img
                  className={
                    isMediaLoading
                      ? "user-story-viewer__media user-story-viewer__media_hidden"
                      : "user-story-viewer__media"
                  }
                  src={resolveUserStoryMediaUrl(activeStory.mediaUrl)}
                  alt=""
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}

              {activeStory.captionText ? (
                <p
                  className={
                    isOwn || canReport
                      ? "user-story-viewer__caption"
                      : "user-story-viewer__caption user-story-viewer__caption_no-footer"
                  }
                >
                  {activeStory.captionText}
                </p>
              ) : null}

              {isOwn || canReport ? (
                <footer className="user-story-viewer__footer">
                  {isOwn ? (
                    <button
                      type="button"
                      className="user-story-viewer__action user-story-viewer__action_delete"
                      disabled={isDeleting}
                      onClick={() => void handleDelete()}
                    >
                      {isDeleting ? USER_STORY_UI.DELETING : USER_STORY_UI.DELETE}
                    </button>
                  ) : null}
                  {canReport ? (
                    <button
                      type="button"
                      className="user-story-viewer__action"
                      onClick={() => setIsReportOpen(true)}
                    >
                      {USER_STORY_UI.REPORT}
                    </button>
                  ) : null}
                </footer>
              ) : null}
            </div>

            {hasMultiple ? (
              <button
                type="button"
                className="user-story-viewer__edge user-story-viewer__edge_next"
                aria-label={USER_STORY_UI.NEXT_STORY}
                disabled={activeIndex >= stories.length - 1}
                onClick={handleNext}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {activeStory ? (
        <ReportUserStoryModal
          isOpen={isReportOpen}
          storyId={activeStory._id}
          onClose={() => setIsReportOpen(false)}
        />
      ) : null}
    </>
  );
}
