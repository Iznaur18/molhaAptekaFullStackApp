import { useState } from "react";

import { useUserFollowMutations } from "../model/useUserFollowMutations.js";
import { USER_FOLLOW_BUTTON_UI } from "../../../shared/config/appUiCopy.js";

import "./UserFollowButton.css";

/**
 * @param {{
 *   targetUserId: string;
 *   isFollowing: boolean;
 *   isAuthorized: boolean;
 *   isSelf: boolean;
 *   disabled?: boolean;
 *   onRequestLogin: () => void;
 *   onFollowChange?: (next: {
 *     isFollowing: boolean;
 *     followersCount?: number;
 *     followingCount?: number;
 *   }) => void;
 * }} props
 */
export function UserFollowButton({
  targetUserId,
  isFollowing,
  isAuthorized,
  isSelf,
  disabled = false,
  onRequestLogin,
  onFollowChange,
}) {
  const { followMutation, unfollowMutation } = useUserFollowMutations();
  const [errorMessage, setErrorMessage] = useState("");

  if (isSelf) return null;

  const isBusy = followMutation.isPending || unfollowMutation.isPending;

  const handleClick = async () => {
    if (!isAuthorized) {
      onRequestLogin();
      return;
    }
    if (isBusy || disabled) return;

    setErrorMessage("");

    try {
      const result = isFollowing
        ? await unfollowMutation.mutateAsync(targetUserId)
        : await followMutation.mutateAsync(targetUserId);
      onFollowChange?.({
        isFollowing: Boolean(result.isFollowing),
        followersCount: result.followersCount,
        followingCount: result.followingCount,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : USER_FOLLOW_BUTTON_UI.ERROR;
      setErrorMessage(message);
    }
  };

  const label = isFollowing
    ? USER_FOLLOW_BUTTON_UI.UNFOLLOW
    : USER_FOLLOW_BUTTON_UI.FOLLOW;

  return (
    <div className="user-follow-button">
      <button
        type="button"
        className={
          isFollowing
            ? "user-follow-button__btn user-follow-button__btn_following"
            : "user-follow-button__btn"
        }
        onClick={() => void handleClick()}
        disabled={isBusy || disabled}
        aria-pressed={isFollowing}
      >
        {isBusy ? USER_FOLLOW_BUTTON_UI.LOADING : label}
      </button>
      {errorMessage ? (
        <p className="user-follow-button__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
