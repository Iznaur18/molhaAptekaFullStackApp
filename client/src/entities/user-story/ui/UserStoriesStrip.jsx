import { useCallback, useMemo, useState } from "react";

import { USER_STORY_UI } from "../../../shared/config/appUiCopy.js";
import { resolveUserStoryAvatarUrl } from "../lib/resolveUserStoryMedia.js";
import { CreateUserStoryModal } from "./CreateUserStoryModal.jsx";
import { UserStoryViewer } from "./UserStoryViewer.jsx";

import "./UserStoriesStrip.css";

/**
 * @param {{
 *   rings: import('../model/types.js').UserStoryRingFromApi[];
 *   canPublish: boolean;
 *   showStrip: boolean;
 *   isAuthorized: boolean;
 *   currentUserId: string | null;
 *   onRefresh: () => void;
 *   onOpenProfile: (userId: string) => void;
 *   onRequestLogin?: () => void;
 * }} props
 */
export function UserStoriesStrip({
  rings,
  canPublish,
  showStrip,
  isAuthorized,
  currentUserId,
  onRefresh,
  onOpenProfile,
  onRequestLogin,
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewerAuthor, setViewerAuthor] = useState(
    /** @type {import('../model/types.js').UserStoryRingFromApi['author'] | null} */ (
      null
    ),
  );

  const sortedRings = useMemo(
    () =>
      [...rings].sort((left, right) => {
        if (left.isViewed !== right.isViewed) {
          return left.isViewed ? 1 : -1;
        }
        const leftTime = new Date(left.latestPublishedAt ?? 0).getTime();
        const rightTime = new Date(right.latestPublishedAt ?? 0).getTime();
        return rightTime - leftTime;
      }),
    [rings],
  );

  const handleAddClick = useCallback(() => {
    if (!isAuthorized) {
      onRequestLogin?.();
      return;
    }
    if (!canPublish) {
      return;
    }
    setIsCreateOpen(true);
  }, [canPublish, isAuthorized, onRequestLogin]);

  if (!showStrip && sortedRings.length === 0) {
    return null;
  }

  return (
    <>
      <section className="user-stories-strip" aria-label="Сторисы">
        <div className="user-stories-strip__scroll">
          <button
            type="button"
            className="user-stories-strip__item user-stories-strip__item_add"
            onClick={handleAddClick}
          >
              <span className="user-stories-strip__ring user-stories-strip__ring_add">
                <span className="user-stories-strip__plus" aria-hidden>
                  +
                </span>
              </span>
              <span className="user-stories-strip__label">
              {USER_STORY_UI.ADD_LABEL}
            </span>
          </button>

          {sortedRings.map((ring) => {
            const authorId = String(ring.author._id);
            const avatarUrl = resolveUserStoryAvatarUrl(ring.author);
            const authorName = ring.author.userName?.trim() || authorId;
            const ringClassName =
              ring.isOwn || ring.isViewed
                ? "user-stories-strip__ring user-stories-strip__ring_viewed"
                : "user-stories-strip__ring";

            return (
              <button
                key={authorId}
                type="button"
                className="user-stories-strip__item"
                onClick={() => setViewerAuthor(ring.author)}
              >
                <span className={ringClassName}>
                  {avatarUrl ? (
                    <img
                      className="user-stories-strip__avatar"
                      src={avatarUrl}
                      alt=""
                    />
                  ) : (
                    <span className="user-stories-strip__avatar-fallback" aria-hidden>
                      {authorName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  {ring.activeCount > 1 ? (
                    <span className="user-stories-strip__count">
                      {ring.activeCount}
                    </span>
                  ) : null}
                </span>
                <span className="user-stories-strip__label">{authorName}</span>
              </button>
            );
          })}
        </div>
      </section>

      <CreateUserStoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPublished={onRefresh}
      />

      {viewerAuthor ? (
        <UserStoryViewer
          author={viewerAuthor}
          isOpen={viewerAuthor != null}
          isAuthorized={isAuthorized}
          currentUserId={currentUserId}
          onClose={() => setViewerAuthor(null)}
          onOpenProfile={onOpenProfile}
          onStoryDeleted={onRefresh}
        />
      ) : null}
    </>
  );
}
