import { useCallback, useEffect, useRef, useState } from "react";

import { USER_STORY_UI } from "../../../shared/config/appUiCopy.js";
import { useRegisterBlockingOverlay } from "../../../shared/lib/useBlockingOverlayOccupancy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
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

const STORY_DIM_MS = 260;
const STORY_REVEAL_MS = 380;

/**
 * @param {{
 *   author: import('../model/types.js').UserStoryRingFromApi['author'];
 *   isOpen: boolean;
 *   isAuthorized: boolean;
 *   currentUserId: string | null;
 *   onClose: () => void;
 *   onOpenProfile: (userId: string) => void;
 *   onStoryDeleted?: () => void;
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
}) {
  const { deleteMutation, markViewedMutation } = useUserStoryMutations();
  const markStoryViewed = markViewedMutation.mutate;
  const markedViewedStoryIdsRef = useRef(/** @type {Set<string>} */ (new Set()));
  const dimTimerRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null));
  const revealTimerRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null));
  const revealRafRef = useRef(/** @type {number | null} */ (null));
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const [isDimmed, setIsDimmed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [incomingRevealed, setIncomingRevealed] = useState(false);
  const [pendingIndex, setPendingIndex] = useState(/** @type {number | null} */ (null));

  // overflow-only: body position:fixed на iOS оставляет полосы в safe-area
  useScrollLock(isOpen, { strategy: "overflow" });
  useRegisterBlockingOverlay(isOpen);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const previousThemeColor = themeColorMeta?.getAttribute("content") ?? null;
    if (!themeColorMeta) {
      themeColorMeta = document.createElement("meta");
      themeColorMeta.setAttribute("name", "theme-color");
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute("content", "#000000");

    return () => {
      if (!themeColorMeta) {
        return;
      }
      if (previousThemeColor == null) {
        themeColorMeta.remove();
      } else {
        themeColorMeta.setAttribute("content", previousThemeColor);
      }
    };
  }, [isOpen]);

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

  const clearTransitionTimers = useCallback(() => {
    if (dimTimerRef.current != null) {
      window.clearTimeout(dimTimerRef.current);
      dimTimerRef.current = null;
    }
    if (revealTimerRef.current != null) {
      window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    if (revealRafRef.current != null) {
      window.cancelAnimationFrame(revealRafRef.current);
      revealRafRef.current = null;
    }
  }, []);

  const resetTransitionState = useCallback(() => {
    clearTransitionTimers();
    setIsDimmed(false);
    setIsTransitioning(false);
    setIncomingRevealed(false);
    setPendingIndex(null);
  }, [clearTransitionTimers]);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
      resetTransitionState();
    }
  }, [authorId, isOpen, resetTransitionState]);

  useEffect(() => {
    if (!isOpen) {
      resetTransitionState();
    }
  }, [isOpen, resetTransitionState]);

  const activeStory = stories[activeIndex] ?? null;

  const goToIndex = useCallback(
    (nextIndex) => {
      if (
        isTransitioning ||
        nextIndex === activeIndex ||
        nextIndex < 0 ||
        nextIndex >= stories.length
      ) {
        return;
      }

      clearTransitionTimers();
      setIsTransitioning(true);
      setPendingIndex(nextIndex);
      setIsDimmed(false);

      // Затемнение текущего кадра → чёрный экран.
      revealRafRef.current = window.requestAnimationFrame(() => {
        revealRafRef.current = window.requestAnimationFrame(() => {
          setIsDimmed(true);
          revealRafRef.current = null;
        });
      });

      dimTimerRef.current = window.setTimeout(() => {
        setIncomingRevealed(false);
        setActiveIndex(nextIndex);
        setPendingIndex(null);
        dimTimerRef.current = null;
      }, STORY_DIM_MS);
    },
    [activeIndex, clearTransitionTimers, isTransitioning, stories.length],
  );

  const advanceStoryOrClose = useCallback(() => {
    if (activeIndex < stories.length - 1) {
      goToIndex(activeIndex + 1);
      return;
    }
    onClose();
  }, [activeIndex, goToIndex, onClose, stories.length]);

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
    isStoryMediaActive &&
    activeStory?.mediaType === USER_STORY_MEDIA_TYPE_VIDEO &&
    incomingRevealed;
  const { videoRef, resumeIfPaused } = useUserStoryVideoPlayback({
    enabled: isVideoStoryReady,
    storyId: activeStory?._id,
    onEnded: advanceStoryOrClose,
    onMediaLoading: markMediaLoading,
    onMediaReady: markMediaReady,
    onMediaError: markMediaError,
  });

  useEffect(() => {
    if (!isOpen) {
      markedViewedStoryIdsRef.current.clear();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !activeStory || !isAuthorized) {
      return;
    }

    const storyId = String(activeStory._id);
    if (markedViewedStoryIdsRef.current.has(storyId)) {
      return;
    }

    markedViewedStoryIdsRef.current.add(storyId);
    markStoryViewed(storyId);
  }, [activeStory?._id, isAuthorized, isOpen, markStoryViewed]);

  useEffect(() => {
    if (
      !isOpen ||
      phase !== "ready" ||
      !activeStory ||
      isReportOpen ||
      isTransitioning ||
      activeStory.mediaType !== USER_STORY_MEDIA_TYPE_IMAGE ||
      !isMediaReady ||
      !incomingRevealed
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
  }, [
    activeStory,
    advanceStoryOrClose,
    incomingRevealed,
    isMediaReady,
    isOpen,
    isReportOpen,
    isTransitioning,
    phase,
  ]);

  useEffect(() => {
    if (!isMediaReady || !activeStory || pendingIndex != null) {
      return undefined;
    }

    // Появление из чёрного: картинка всплывает, вуаль одновременно уходит.
    revealRafRef.current = window.requestAnimationFrame(() => {
      revealRafRef.current = window.requestAnimationFrame(() => {
        setIncomingRevealed(true);
        setIsDimmed(false);
        revealRafRef.current = null;

        if (isTransitioning) {
          revealTimerRef.current = window.setTimeout(() => {
            setIsTransitioning(false);
            revealTimerRef.current = null;
          }, STORY_REVEAL_MS);
        }
      });
    });

    return () => {
      if (revealRafRef.current != null) {
        window.cancelAnimationFrame(revealRafRef.current);
        revealRafRef.current = null;
      }
    };
  }, [activeStory, isMediaReady, isTransitioning, pendingIndex]);

  useEffect(() => {
    if (!isOpen || phase !== "ready") {
      return;
    }

    for (const offset of [1, -1, 2]) {
      const story = stories[activeIndex + offset];
      if (story == null || story.mediaType !== USER_STORY_MEDIA_TYPE_IMAGE) {
        continue;
      }
      const prefetch = new window.Image();
      prefetch.decoding = "async";
      prefetch.src = resolveUserStoryMediaUrl(story.mediaUrl);
    }
  }, [activeIndex, isOpen, phase, stories]);

  const handlePrev = () => {
    goToIndex(activeIndex - 1);
  };

  const handleNext = () => {
    goToIndex(activeIndex + 1);
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
  const showLoadingOverlay = isMediaLoading && !isTransitioning && !incomingRevealed;

  const activeLayerClassName = [
    "user-story-viewer__media-layer",
    "user-story-viewer__media-layer_active",
    incomingRevealed ? "user-story-viewer__media-layer_revealed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const dimVeilClassName = [
    "user-story-viewer__dim-veil",
    isDimmed ? "user-story-viewer__dim-veil_on" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className="user-story-viewer" role="dialog" aria-modal="true">
        {phase !== "ready" ? (
          <button
            type="button"
            className="user-story-viewer__close user-story-viewer__close_viewer"
            onClick={onClose}
            aria-label={USER_STORY_UI.CLOSE}
          >
            ×
          </button>
        ) : null}

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
            <div
              className="user-story-viewer__frame"
              onPointerDown={isVideoStoryReady ? resumeIfPaused : undefined}
            >
              {hasMultiple ? (
                <>
                  <button
                    type="button"
                    className="user-story-viewer__edge user-story-viewer__edge_prev"
                    aria-label={USER_STORY_UI.PREV_STORY}
                    disabled={isReportOpen || isTransitioning || activeIndex <= 0}
                    onClick={handlePrev}
                  />
                  <button
                    type="button"
                    className="user-story-viewer__edge user-story-viewer__edge_next"
                    aria-label={USER_STORY_UI.NEXT_STORY}
                    disabled={
                      isReportOpen ||
                      isTransitioning ||
                      activeIndex >= stories.length - 1
                    }
                    onClick={handleNext}
                  />
                </>
              ) : null}

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

              {showLoadingOverlay ? (
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

              <div className="user-story-viewer__media-stack">
                <div className={activeLayerClassName}>
                  {activeStory.mediaType === USER_STORY_MEDIA_TYPE_VIDEO ? (
                    <video
                      key={activeStory._id}
                      ref={videoRef}
                      className="user-story-viewer__media"
                      src={resolveUserStoryMediaUrl(activeStory.mediaUrl)}
                      playsInline
                    />
                  ) : (
                    <img
                      key={activeStory._id}
                      className="user-story-viewer__media"
                      src={resolveUserStoryMediaUrl(activeStory.mediaUrl)}
                      alt=""
                      draggable={false}
                      decoding="async"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      ref={(node) => {
                        if (
                          node != null &&
                          node.complete &&
                          node.naturalWidth > 0
                        ) {
                          handleImageLoad();
                        }
                      }}
                    />
                  )}
                </div>
                <div className={dimVeilClassName} aria-hidden />
              </div>

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
                      disabled={isDeleting || isTransitioning}
                      onClick={() => void handleDelete()}
                    >
                      {isDeleting ? USER_STORY_UI.DELETING : USER_STORY_UI.DELETE}
                    </button>
                  ) : null}
                  {canReport ? (
                    <button
                      type="button"
                      className="user-story-viewer__action"
                      disabled={isTransitioning}
                      onClick={() => setIsReportOpen(true)}
                    >
                      {USER_STORY_UI.REPORT}
                    </button>
                  ) : null}
                </footer>
              ) : null}
            </div>
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
