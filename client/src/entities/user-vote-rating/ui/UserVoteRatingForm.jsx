import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { useSubmitUserVoteRatingMutation } from "../model/useSubmitUserVoteRatingMutation.js";
import { useMyVoteForTargetQuery } from "../model/useMyVoteForTargetQuery.js";
import { userVoteQueryKeys } from "../model/userVoteQueryKeys.js";
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
  const queryClient = useQueryClient();
  const submitVoteMutation = useSubmitUserVoteRatingMutation();
  const [score, setScore] = useState(DEFAULT_SCORE);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  const aggregateText = useMemo(
    () => formatAggregateLine(targetUser.userRatingByVotes),
    [targetUser.userRatingByVotes],
  );

  const isSelf =
    currentUserId != null && String(currentUserId) === String(targetUser._id);

  const myVoteQuery = useMyVoteForTargetQuery({
    targetUserId: String(targetUser._id),
    enabled: isAuthorized && currentUserId != null && !isSelf,
  });

  const myVoteResolved =
    !isAuthorized || currentUserId == null || isSelf || !myVoteQuery.isLoading;

  useEffect(() => {
    setError("");
    setFlash("");

    if (!isAuthorized || currentUserId == null || isSelf) {
      setScore(DEFAULT_SCORE);
      setVoteSubmitted(false);
      return undefined;
    }

    if (myVoteQuery.isLoading) {
      return undefined;
    }

    const voteValue = myVoteQuery.data;
    if (
      voteValue != null &&
      voteValue >= USER_VOTE_RATING_VALUE_MIN &&
      voteValue <= USER_VOTE_RATING_VALUE_MAX
    ) {
      setScore(voteValue);
      setVoteSubmitted(true);
      return undefined;
    }

    setScore(DEFAULT_SCORE);
    setVoteSubmitted(false);
    return undefined;
  }, [
    currentUserId,
    isAuthorized,
    isSelf,
    myVoteQuery.data,
    myVoteQuery.isLoading,
    targetUser._id,
  ]);

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
      const { user: snapshot } = await submitVoteMutation.mutateAsync({
        targetUserId: String(targetUser._id),
        score,
      });
      onRated(snapshot);
      onVotePersisted?.();
      queryClient.setQueryData(userVoteQueryKeys.myForTarget(String(targetUser._id)), score);
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
