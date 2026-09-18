import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { pickUserProfilePhotoUrl } from "../../user/lib/pickUserProfilePhotoUrl.js";
import { DEFAULT_USER_AVATAR_URL } from "../../user/model/userConstants.js";
import { USER_RATING_VOTES_SHEET_UI } from "../../../shared/config/appUiCopy.js";
import { formatIntegerGroupRu } from "../../../shared/lib/numericInput.js";
import { dispatchOpenUserProfileEvent } from "../../../shared/lib/openUserProfileEvent.js";
import { useEnterExitMountAnimation } from "../../../shared/lib/useEnterExitMountAnimation.js";
import { useRegisterBlockingOverlay } from "../../../shared/lib/useBlockingOverlayOccupancy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { useMyReceivedVotesInfiniteQuery } from "../model/useMyReceivedVotesInfiniteQuery.js";
import {
  USER_RATING_VOTES_SHEET_EXIT_MS,
  USER_RATING_VOTES_SHEET_SKELETON_ROWS,
} from "../model/constants.js";

import "../../../shared/ui/Skeleton/skeleton.css";
import "./UserRatingVotesSheet.css";

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 * }} props
 */
export function UserRatingVotesSheet({ isOpen, onClose }) {
  const sheetId = useId();
  const titleId = `${sheetId}-title`;
  const { mounted, isVisible: visible } = useEnterExitMountAnimation(isOpen, {
    exitMs: USER_RATING_VOTES_SHEET_EXIT_MS,
  });
  const votesQuery = useMyReceivedVotesInfiniteQuery({ enabled: mounted });

  useScrollLock(mounted);
  useRegisterBlockingOverlay(mounted);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }
    const handleKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible, onClose]);

  const votes = useMemo(
    () => votesQuery.data?.pages.flatMap((page) => page.votes) ?? [],
    [votesQuery.data],
  );
  const summary = votesQuery.data?.pages[0]?.summary ?? {
    countVotes: 0,
    averageRating: 0,
  };

  if (!mounted) {
    return null;
  }

  const handleOpenProfile = (userId) => {
    onClose();
    dispatchOpenUserProfileEvent(userId);
  };

  const backdropClass = [
    "user-rating-votes-sheet__backdrop",
    visible ? "user-rating-votes-sheet__backdrop--open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  let content;
  if (votesQuery.isPending) {
    content = (
      <ul
        className="user-rating-votes-sheet__list"
        role="status"
        aria-label={USER_RATING_VOTES_SHEET_UI.LOADING}
      >
        {Array.from({ length: USER_RATING_VOTES_SHEET_SKELETON_ROWS }, (_, index) => (
          <li key={index} className="user-rating-votes-sheet__row" aria-hidden="true">
            <span className="iz-skeleton iz-skeleton_circle user-rating-votes-sheet__avatar" />
            <span className="iz-skeleton iz-skeleton_line user-rating-votes-sheet__name-skeleton" />
            <span className="iz-skeleton iz-skeleton_line user-rating-votes-sheet__score-skeleton" />
          </li>
        ))}
      </ul>
    );
  } else if (votesQuery.isError) {
    content = (
      <div className="user-rating-votes-sheet__state" role="alert">
        <p>
          {votesQuery.error instanceof Error
            ? votesQuery.error.message
            : USER_RATING_VOTES_SHEET_UI.RETRY}
        </p>
        <button
          type="button"
          className="app-btn app-btn--secondary"
          onClick={() => void votesQuery.refetch()}
        >
          {USER_RATING_VOTES_SHEET_UI.RETRY}
        </button>
      </div>
    );
  } else if (votes.length === 0) {
    content = (
      <p className="user-rating-votes-sheet__state">
        {USER_RATING_VOTES_SHEET_UI.EMPTY}
      </p>
    );
  } else {
    content = (
      <>
        <ul className="user-rating-votes-sheet__list">
          {votes.map((vote) => {
            const voter = vote.voter;
            const displayName =
              voter?.userName?.trim() || USER_RATING_VOTES_SHEET_UI.DELETED_USER;
            const canOpen = Boolean(voter?._id);

            return (
              <li key={vote.voteId} className="user-rating-votes-sheet__row">
                <VoterAvatar url={voter?.userAvatarUrl ?? ""} />
                <button
                  type="button"
                  className="user-rating-votes-sheet__name"
                  disabled={!canOpen}
                  aria-label={
                    canOpen
                      ? USER_RATING_VOTES_SHEET_UI.OPEN_PROFILE_ARIA(displayName)
                      : undefined
                  }
                  onClick={() => {
                    if (canOpen) {
                      handleOpenProfile(voter._id);
                    }
                  }}
                >
                  {displayName}
                </button>
                <span
                  className="user-rating-votes-sheet__score"
                  aria-label={USER_RATING_VOTES_SHEET_UI.SCORE_ARIA(vote.userVoteValue)}
                >
                  {vote.userVoteValue}
                </span>
              </li>
            );
          })}
        </ul>
        {votesQuery.hasNextPage ? (
          <div className="user-rating-votes-sheet__footer">
            <button
              type="button"
              className="app-btn app-btn--secondary"
              disabled={votesQuery.isFetchingNextPage}
              onClick={() => void votesQuery.fetchNextPage()}
            >
              {USER_RATING_VOTES_SHEET_UI.LOAD_MORE}
            </button>
          </div>
        ) : null}
      </>
    );
  }

  return createPortal(
    <div className={backdropClass} role="presentation">
      <div className="user-rating-votes-sheet__scrim" aria-hidden="true" />
      <button
        type="button"
        className="user-rating-votes-sheet__dismiss"
        aria-label={USER_RATING_VOTES_SHEET_UI.CLOSE}
        onClick={onClose}
      />
      <div
        id={sheetId}
        className="user-rating-votes-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="user-rating-votes-sheet__header">
          <h2 id={titleId} className="user-rating-votes-sheet__title">
            {USER_RATING_VOTES_SHEET_UI.TITLE}
            <span className="user-rating-votes-sheet__total">
              {formatIntegerGroupRu(summary.countVotes)}
            </span>
          </h2>
          <button
            type="button"
            className="user-rating-votes-sheet__close"
            onClick={onClose}
          >
            {USER_RATING_VOTES_SHEET_UI.CLOSE}
          </button>
        </header>
        <p className="user-rating-votes-sheet__hint">
          {USER_RATING_VOTES_SHEET_UI.SUMMARY(
            Number(summary.averageRating) || 0,
            Number(summary.countVotes) || 0,
          )}
        </p>
        <div className="user-rating-votes-sheet__body">{content}</div>
      </div>
    </div>,
    document.body,
  );
}

function VoterAvatar({ url }) {
  const [failed, setFailed] = useState(false);
  const picked = pickUserProfilePhotoUrl({ userAvatarUrl: url });
  const src = !failed && picked ? picked : DEFAULT_USER_AVATAR_URL;
  return (
    <img
      className="user-rating-votes-sheet__avatar"
      src={src}
      alt=""
      width={36}
      height={36}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
