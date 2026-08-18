import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { parseUserRatingAggregate } from "../lib/parseUserRatingAggregate.js";
import { resolveVoteScoreTone } from "../lib/resolveVoteScoreTone.js";
import { useSubmitUserVoteRatingMutation } from "../model/useSubmitUserVoteRatingMutation.js";
import { useMyVoteForTargetQuery } from "../model/useMyVoteForTargetQuery.js";
import { userVoteQueryKeys } from "../model/userVoteQueryKeys.js";
import {
  USER_VOTE_RATING_VALUE_MAX,
  USER_VOTE_RATING_VALUE_MIN,
} from "../model/constants.js";
import {
  API_CLIENT_UI,
  USER_VOTE_RATING_UI,
} from "../../../shared/config/appUiCopy.js";
import { pluralizeRu } from "../../../shared/lib/pluralizeRu.js";

import "./UserVoteRatingForm.css";

const DEFAULT_SCORE = 5;

const SCORE_OPTIONS = Array.from(
  { length: USER_VOTE_RATING_VALUE_MAX - USER_VOTE_RATING_VALUE_MIN + 1 },
  (_, index) => USER_VOTE_RATING_VALUE_MIN + index,
);

function formatVotesCaption(countVotes) {
  if (countVotes <= 0) {
    return `0 ${USER_VOTE_RATING_UI.VOTES_FORMS[2]}`;
  }
  return `${countVotes} ${pluralizeRu(countVotes, USER_VOTE_RATING_UI.VOTES_FORMS)}`;
}

/**
 * @param {{
 *   children: import('react').ReactNode;
 *   averageLabel: string;
 *   hasAverage: boolean;
 *   votesCaption: string;
 * }} props
 */
function VoteRatingCollapsible({ children, averageLabel, hasAverage, votesCaption }) {
  return (
    <details className="user-vote-rating-form__details">
      <summary className="user-vote-rating-form__summary">
        <span className="user-vote-rating-form__summary-main">
          <span className="user-vote-rating-form__summary-title">
            {USER_VOTE_RATING_UI.COLLAPSE_SUMMARY}
          </span>
          <span className="user-vote-rating-form__summary-meta">
            <strong
              className={[
                "user-vote-rating-form__summary-avg",
                !hasAverage && "user-vote-rating-form__summary-avg_muted",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {averageLabel}
            </strong>
            <span className="user-vote-rating-form__summary-of">
              {USER_VOTE_RATING_UI.OUT_OF_MAX}
            </span>
            <span className="user-vote-rating-form__summary-votes">· {votesCaption}</span>
          </span>
        </span>
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

  const aggregate = useMemo(
    () => parseUserRatingAggregate(targetUser.userRatingByVotes),
    [targetUser.userRatingByVotes],
  );
  const votesCaption = formatVotesCaption(aggregate.countVotes);
  const hasAverage = aggregate.average != null;

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

  const wrap = (children) => (
    <VoteRatingCollapsible
      averageLabel={aggregate.averageLabel}
      hasAverage={hasAverage}
      votesCaption={votesCaption}
    >
      {children}
    </VoteRatingCollapsible>
  );

  const aggregateHero = (
    <div className="user-vote-rating-form__hero">
      <p className="user-vote-rating-form__hero-value">{aggregate.averageLabel}</p>
      <div className="user-vote-rating-form__hero-meta">
        <p className="user-vote-rating-form__hero-of">{USER_VOTE_RATING_UI.OUT_OF_MAX}</p>
        <p className="user-vote-rating-form__hero-votes">{votesCaption}</p>
      </div>
    </div>
  );

  if (!isAuthorized) {
    return wrap(
      <div className="user-vote-rating-form user-vote-rating-form_guest">
        {aggregateHero}
        <p className="user-vote-rating-form__hint">{USER_VOTE_RATING_UI.LOGIN_HINT}</p>
        <button
          type="button"
          className="user-vote-rating-form__submit"
          onClick={onRequestLogin}
        >
          {USER_VOTE_RATING_UI.LOGIN_BUTTON}
        </button>
      </div>,
    );
  }

  if (currentUserId == null) {
    return wrap(
      <div className="user-vote-rating-form">
        <p className="user-vote-rating-form__hint">{USER_VOTE_RATING_UI.ME_LOADING}</p>
      </div>,
    );
  }

  if (isSelf) {
    return wrap(
      <div className="user-vote-rating-form user-vote-rating-form_self">
        {aggregateHero}
        <p className="user-vote-rating-form__hint">{USER_VOTE_RATING_UI.SELF_HINT}</p>
      </div>,
    );
  }

  if (!myVoteResolved) {
    return wrap(
      <div className="user-vote-rating-form" aria-busy="true">
        {aggregateHero}
        <p className="user-vote-rating-form__hint">
          {USER_VOTE_RATING_UI.MY_VOTE_RESOLVING}
        </p>
      </div>,
    );
  }

  return wrap(
    <div className="user-vote-rating-form">
      {aggregateHero}
      {voteSubmitted ? (
        <div className="user-vote-rating-form__rated">
          <p className="user-vote-rating-form__rated-check" aria-hidden="true">
            {USER_VOTE_RATING_UI.SUCCESS_CHECKMARK}
          </p>
          <p className="user-vote-rating-form__rated-title">
            {USER_VOTE_RATING_UI.ALREADY_RATED_TITLE}
          </p>
          <p className="user-vote-rating-form__rated-score">
            {USER_VOTE_RATING_UI.YOUR_SCORE(score)}
          </p>
          {flash ? (
            <p className="user-vote-rating-form__flash" role="status">
              {flash}
            </p>
          ) : null}
        </div>
      ) : (
        <>
          <p className="user-vote-rating-form__range-caption">
            {USER_VOTE_RATING_UI.RANGE_LABEL}:{" "}
            <strong className="user-vote-rating-form__score">{score}</strong>
          </p>
          <div className="user-vote-rating-form__scale">
            <span>{USER_VOTE_RATING_UI.SCALE_LOW}</span>
            <span>{USER_VOTE_RATING_UI.SCALE_HIGH}</span>
          </div>
          <div className="user-vote-rating-form__chips" role="group" aria-label={USER_VOTE_RATING_UI.RANGE_LABEL}>
            {SCORE_OPTIONS.map((value) => {
              const selected = value === score;
              return (
                <button
                  key={value}
                  type="button"
                  className="user-vote-rating-form__chip"
                  data-tone={resolveVoteScoreTone(value)}
                  aria-pressed={selected}
                  aria-label={`${USER_VOTE_RATING_UI.RANGE_LABEL} ${value}`}
                  disabled={pending}
                  onClick={() => setScore(value)}
                >
                  {value}
                </button>
              );
            })}
          </div>
          {error ? (
            <p className="user-vote-rating-form__error" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            className="user-vote-rating-form__submit"
            disabled={pending}
            onClick={() => void handleSubmit()}
          >
            {pending ? USER_VOTE_RATING_UI.SUBMIT_LOADING : USER_VOTE_RATING_UI.SUBMIT}
          </button>
        </>
      )}
    </div>,
  );
}
