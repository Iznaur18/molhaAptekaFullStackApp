import { useCallback, useEffect, useState } from "react";

import { USER_STORY_UI } from "../../../shared/config/appUiCopy.js";
import { deleteUserStory } from "../api/deleteUserStory.js";
import { fetchUserStoriesByAuthor } from "../api/fetchUserStoriesByAuthor.js";
import { markUserStoryViewed } from "../api/markUserStoryViewed.js";
import {
  resolveUserStoryAvatarUrl,
  resolveUserStoryMediaUrl,
} from "../lib/resolveUserStoryMedia.js";
import { USER_STORY_MEDIA_TYPE_IMAGE, USER_STORY_MEDIA_TYPE_VIDEO, USER_STORY_IMAGE_VIEW_DURATION_MS } from "../model/constants.js";
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
  const [stories, setStories] = useState(
    /** @type {import('../model/types.js').UserStoryFromApi[]} */ ([]),
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const authorId = String(author._id);
  const isOwn = currentUserId != null && authorId === String(currentUserId);
  const activeStory = stories[activeIndex] ?? null;

  const loadStories = useCallback(async () => {
    setPhase("loading");
    setError("");
    try {
      const list = await fetchUserStoriesByAuthor(authorId);
      setStories(list);
      setActiveIndex(0);
      setPhase(list.length > 0 ? "ready" : "empty");
    } catch (e) {
      setError(e instanceof Error ? e.message : USER_STORY_UI.ERROR_GENERIC);
      setPhase("error");
    }
  }, [authorId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    void loadStories();
  }, [isOpen, loadStories]);

  useEffect(() => {
    if (!isOpen || !activeStory || !isAuthorized) {
      return;
    }
    void markUserStoryViewed(activeStory._id);
    onStoryViewed?.();
  }, [activeStory?._id, isAuthorized, isOpen, onStoryViewed]);

  useEffect(() => {
    if (
      !isOpen ||
      phase !== "ready" ||
      !activeStory ||
      isReportOpen ||
      activeStory.mediaType !== USER_STORY_MEDIA_TYPE_IMAGE
    ) {
      return;
    }

    const timerId = window.setTimeout(() => {
      if (activeIndex < stories.length - 1) {
        setActiveIndex((index) => index + 1);
        return;
      }
      onClose();
    }, USER_STORY_IMAGE_VIEW_DURATION_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [
    activeIndex,
    activeStory,
    isOpen,
    isReportOpen,
    onClose,
    phase,
    stories.length,
  ]);

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
    try {
      await deleteUserStory(activeStory._id);
      onStoryDeleted?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : USER_STORY_UI.ERROR_GENERIC);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const avatarUrl = resolveUserStoryAvatarUrl(author);
  const authorName = author.userName?.trim() || authorId;
  const canReport =
    isAuthorized && !isOwn && activeStory != null && phase === "ready";
  const hasMultiple = stories.length > 1;

  return (
    <>
      <div className="user-story-viewer" role="dialog" aria-modal="true">
        {phase === "loading" ? (
          <p className="user-story-viewer__state">{USER_STORY_UI.LOADING}</p>
        ) : null}

        {phase === "error" ? (
          <p className="user-story-viewer__state user-story-viewer__state_error" role="alert">
            {error}
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

            <div className="user-story-viewer__frame">
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
                    <img
                      className="user-story-viewer__avatar"
                      src={avatarUrl}
                      alt=""
                    />
                  ) : (
                    <span className="user-story-viewer__avatar-fallback" aria-hidden>
                      {authorName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="user-story-viewer__name">{authorName}</span>
                </button>
              </header>

              {activeStory.mediaType === USER_STORY_MEDIA_TYPE_VIDEO ? (
                <video
                  className="user-story-viewer__media"
                  src={resolveUserStoryMediaUrl(activeStory.mediaUrl)}
                  autoPlay
                  playsInline
                  controls
                />
              ) : (
                <img
                  className="user-story-viewer__media"
                  src={resolveUserStoryMediaUrl(activeStory.mediaUrl)}
                  alt=""
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
