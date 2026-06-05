import { useEffect, useMemo, useState } from "react";

import { fetchMyVoteForTarget } from "../api/fetchMyVoteForTarget.js";
import { submitUserVoteRating } from "../api/submitUserVoteRating.js";
import {
  USER_VOTE_RATING_VALUE_MAX,
  USER_VOTE_RATING_VALUE_MIN,
} from "../model/constants.js";
import {
  API_CLIENT_UI,
  USER_PROFILE_COPY,
  USER_VOTE_RATING_UI,
  formatUserProfileRatingLine,
} from "../../../shared/config/appUiCopy.js";

import "./UserVoteRatingForm.css";

const DEFAULT_SCORE = 5;

function formatAggregateLine(userRatingByVotes) {
  if (!userRatingByVotes || typeof userRatingByVotes !== "object") {
    return USER_PROFILE_COPY.RATING_NONE;
  }
  const { countVotes = 0, totalRating = 0 } = userRatingByVotes;
  if (countVotes === 0) return USER_PROFILE_COPY.RATING_NONE;
  const avg = totalRating / countVotes;
  return formatUserProfileRatingLine(avg, countVotes, totalRating);
}

/**
 * @param {{ children: import('react').ReactNode }} props
 */
function VoteRatingCollapsible({ children }) {
  return (
    <details className="user-vote-rating-form__details">
      <summary className="user-vote-rating-form__summary">
        {USER_VOTE_RATING_UI.COLLAPSE_SUMMARY}
      </summary>
      <div className="user-vote-rating-form__panel">{children}</div>
    </details>
  );
}

/**
 * @param {{
 *   targetUser: import('../../user/model/types.js').UserPublicProfile;
 *   currentUserId: string | null;
 *   isAuthorized: boolean;
 *   onRated: (snapshot: import('../../user/model/types.js').UserPublicProfile) => void;
 *   onRequestLogin: () => void;
 *   onVotePersisted?: () => void;
 * }} props
 */
export function UserVoteRatingForm({
  targetUser,
  currentUserId,
  isAuthorized,
  onRated,
  onRequestLogin,
  onVotePersisted,
}) {
  const [score, setScore] = useState(DEFAULT_SCORE);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [myVoteResolved, setMyVoteResolved] = useState(false);

  const aggregateText = useMemo(
    () => formatAggregateLine(targetUser.userRatingByVotes),
    [targetUser.userRatingByVotes],
  );

  const isSelf =
    currentUserId != null && String(currentUserId) === String(targetUser._id);

  useEffect(() => {
    setError("");
    setFlash("");

    if (!isAuthorized || currentUserId == null || isSelf) {
      setScore(DEFAULT_SCORE);
      setVoteSubmitted(false);
      setMyVoteResolved(true);
      return undefined;
    }

    setScore(DEFAULT_SCORE);
    setVoteSubmitted(false);
    setMyVoteResolved(false);

    let cancelled = false;

    void (async () => {
      try {
        const v = await fetchMyVoteForTarget(String(targetUser._id));
        if (cancelled) return;
        if (
          v != null &&
          v >= USER_VOTE_RATING_VALUE_MIN &&
          v <= USER_VOTE_RATING_VALUE_MAX
        ) {
          setScore(v);
          setVoteSubmitted(true);
        }
      } catch {
        if (!cancelled) setVoteSubmitted(false);
      } finally {
        if (!cancelled) setMyVoteResolved(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [targetUser._id, isAuthorized, currentUserId, isSelf]);

  useEffect(() => {
    if (!flash) return undefined;
    const t = window.setTimeout(
      () => setFlash(""),
      USER_VOTE_RATING_UI.SUCCESS_FLASH_MS,
    );
    return () => window.clearTimeout(t);
  }, [flash]);

  const handleSubmit = async () => {
    try {
      setError("");
      setPending(true);
      const { user: snapshot } = await submitUserVoteRating(
        String(targetUser._id),
        score,
      );
      onRated(snapshot);
      onVotePersisted?.();
      setVoteSubmitted(true);
      setFlash(USER_VOTE_RATING_UI.SUCCESS);
    } catch (e) {
      const msg = e instanceof Error ? e.message : API_CLIENT_UI.VOTE_SUBMIT_FALLBACK;
      setError(msg);
    } finally {
      setPending(false);
    }
  };

  if (!isAuthorized) {
    return (
      <VoteRatingCollapsible>
        <div className="user-vote-rating-form user-vote-rating-form_guest">
          <p className="user-vote-rating-form__hint">
            {USER_VOTE_RATING_UI.LOGIN_HINT}
          </p>
          <button
            type="button"
            className="user-vote-rating-form__login"
            onClick={onRequestLogin}
          >
            {USER_VOTE_RATING_UI.LOGIN_BUTTON}
          </button>
        </div>
      </VoteRatingCollapsible>
    );
  }

  if (currentUserId == null) {
    return (
      <VoteRatingCollapsible>
        <div className="user-vote-rating-form">
          <p className="user-vote-rating-form__hint">
            {USER_VOTE_RATING_UI.ME_LOADING}
          </p>
        </div>
      </VoteRatingCollapsible>
    );
  }

  if (isSelf) {
    return (
      <VoteRatingCollapsible>
        <div className="user-vote-rating-form user-vote-rating-form_self">
          <p className="user-vote-rating-form__hint">{USER_VOTE_RATING_UI.SELF_HINT}</p>
        </div>
      </VoteRatingCollapsible>
    );
  }

  if (!myVoteResolved) {
    return (
      <VoteRatingCollapsible>
        <div className="user-vote-rating-form" aria-busy="true">
          <h3 className="user-vote-rating-form__title">{USER_VOTE_RATING_UI.TITLE}</h3>
          <p className="user-vote-rating-form__aggregate">
            <span className="user-vote-rating-form__aggregate-label">
              {USER_VOTE_RATING_UI.CURRENT_AGGREGATE}:{" "}
            </span>
            {aggregateText}
          </p>
          <p className="user-vote-rating-form__hint">
            {USER_VOTE_RATING_UI.MY_VOTE_RESOLVING}
          </p>
        </div>
      </VoteRatingCollapsible>
    );
  }

  return (
    <VoteRatingCollapsible>
      <div className="user-vote-rating-form">
        <h3 className="user-vote-rating-form__title">{USER_VOTE_RATING_UI.TITLE}</h3>
        <p className="user-vote-rating-form__aggregate">
          <span className="user-vote-rating-form__aggregate-label">
            {USER_VOTE_RATING_UI.CURRENT_AGGREGATE}:{" "}
          </span>
          {aggregateText}
        </p>
        <label className="user-vote-rating-form__range-label">
          <span className="user-vote-rating-form__range-caption">
            {USER_VOTE_RATING_UI.RANGE_LABEL}:{" "}
            <strong className="user-vote-rating-form__score">{score}</strong>
          </span>
          <input
            className="user-vote-rating-form__range"
            type="range"
            min={USER_VOTE_RATING_VALUE_MIN}
            max={USER_VOTE_RATING_VALUE_MAX}
            step={1}
            value={score}
            disabled={pending || voteSubmitted}
            onChange={(e) => setScore(Number(e.target.value))}
          />
        </label>
        {error ? (
          <p className="user-vote-rating-form__error" role="alert">
            {error}
          </p>
        ) : null}
        {flash ? (
          <p className="user-vote-rating-form__flash" role="status">
            {flash}
          </p>
        ) : null}
        {voteSubmitted ? (
          <button
            type="button"
            className="user-vote-rating-form__submit user-vote-rating-form__submit_done"
            disabled
          >
            {USER_VOTE_RATING_UI.ALREADY_RATED}
          </button>
        ) : (
          <button
            type="button"
            className="user-vote-rating-form__submit"
            disabled={pending}
            onClick={() => void handleSubmit()}
          >
            {pending ? USER_VOTE_RATING_UI.SUBMIT_LOADING : USER_VOTE_RATING_UI.SUBMIT}
          </button>
        )}
      </div>
    </VoteRatingCollapsible>
  );
}
