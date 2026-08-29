import { useState } from "react";

import { USER_BLOCK_BUTTON_UI } from "../../../shared/config/appUiCopy.js";

import { useUserBlockMutations } from "../model/useUserBlockMutations.js";

import "./UserBlockProfileRow.css";

/**
 * @param {{
 *   targetUserId: string;
 *   isBlockedByMe: boolean;
 *   isAuthorized: boolean;
 *   isSelf: boolean;
 *   disabled?: boolean;
 *   onRequestLogin: () => void;
 *   onBlockedChange?: (patch: { isBlockedByMe: boolean }) => void;
 * }} props
 */
export function UserBlockProfileRow({
  targetUserId,
  isBlockedByMe,
  isAuthorized,
  isSelf,
  disabled = false,
  onRequestLogin,
  onBlockedChange,
}) {
  const { blockMutation, unblockMutation } = useUserBlockMutations({ onBlockedChange });
  const [errorMessage, setErrorMessage] = useState("");

  if (isSelf) {
    return null;
  }

  const isBusy = blockMutation.isPending || unblockMutation.isPending;
  const label = isBlockedByMe
    ? USER_BLOCK_BUTTON_UI.UNBLOCK
    : USER_BLOCK_BUTTON_UI.BLOCK;

  const handleClick = async () => {
    if (!isAuthorized) {
      onRequestLogin();
      return;
    }
    if (isBusy || disabled) {
      return;
    }

    setErrorMessage("");

    try {
      if (isBlockedByMe) {
        await unblockMutation.mutateAsync(targetUserId);
      } else {
        await blockMutation.mutateAsync(targetUserId);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : USER_BLOCK_BUTTON_UI.ERROR;
      setErrorMessage(message);
    }
  };

  return (
    <div className="user-profile-info__detail-row user-block-profile-row">
      <dt className="user-profile-info__detail-label">
        <span>{USER_BLOCK_BUTTON_UI.LABEL}</span>
      </dt>
      <dd className="user-profile-info__detail-value">
        <button
          type="button"
          className={
            isBlockedByMe
              ? "user-block-profile-row__btn user-block-profile-row__btn_blocked"
              : "user-block-profile-row__btn"
          }
          onClick={() => void handleClick()}
          disabled={isBusy || disabled}
          aria-pressed={isBlockedByMe}
        >
          {isBusy ? USER_BLOCK_BUTTON_UI.LOADING : label}
        </button>
        {errorMessage ? (
          <span className="user-block-profile-row__error" role="alert">
            {errorMessage}
          </span>
        ) : null}
      </dd>
    </div>
  );
}
