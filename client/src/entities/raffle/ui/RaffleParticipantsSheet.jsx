import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import { pickUserProfilePhotoUrl } from "../../user/lib/pickUserProfilePhotoUrl.js";
import { DEFAULT_USER_AVATAR_URL } from "../../user/model/userConstants.js";
import { RAFFLE_PARTICIPANTS_SHEET_UI } from "../../../shared/config/appUiCopy.js";
import { formatIntegerGroupRu } from "../../../shared/lib/numericInput.js";
import { dispatchOpenUserProfileEvent } from "../../../shared/lib/openUserProfileEvent.js";
import { pluralizeRu } from "../../../shared/lib/pluralizeRu.js";
import { useEnterExitMountAnimation } from "../../../shared/lib/useEnterExitMountAnimation.js";
import { useRegisterBlockingOverlay } from "../../../shared/lib/useBlockingOverlayOccupancy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { useRaffleParticipantsQuery } from "../model/useRaffleParticipantsQuery.js";

import "../../../shared/ui/Skeleton/skeleton.css";
import "./RaffleParticipantsSheet.css";

const RAFFLE_PARTICIPANTS_SHEET_EXIT_MS = 260;
const SKELETON_ROWS = 6;

/**
 * Окно «Участники» (снизу вверх, как выбор региона): кто участвует в розыгрыше
 * и сколько купил. Список грузится при открытии.
 *
 * @param {{
 *   isOpen: boolean;
 *   raffleId: string;
 *   participantsCount: number;
 *   onClose: () => void;
 * }} props
 */
export function RaffleParticipantsSheet({
  isOpen,
  raffleId,
  participantsCount,
  onClose,
}) {
  const sheetId = useId();
  const titleId = `${sheetId}-title`;
  const { mounted, isVisible: visible } = useEnterExitMountAnimation(isOpen, {
    exitMs: RAFFLE_PARTICIPANTS_SHEET_EXIT_MS,
  });
  const participantsQuery = useRaffleParticipantsQuery({ raffleId, enabled: mounted });

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

  if (!mounted) {
    return null;
  }

  const data = participantsQuery.data ?? null;
  const participants = data?.participants ?? [];
  const total = data?.total ?? participantsCount;

  const handleOpenProfile = (userId) => {
    onClose();
    dispatchOpenUserProfileEvent(userId);
  };

  const backdropClass = [
    "raffle-participants-sheet__backdrop",
    visible ? "raffle-participants-sheet__backdrop--open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  let content;
  if (participantsQuery.isPending) {
    content = (
      <ul
        className="raffle-participants-sheet__list"
        role="status"
        aria-label={RAFFLE_PARTICIPANTS_SHEET_UI.LOADING}
      >
        {Array.from(
          { length: Math.min(SKELETON_ROWS, Math.max(1, participantsCount)) },
          (_, index) => (
            <li
              key={index}
              className="raffle-participants-sheet__row"
              aria-hidden="true"
            >
              <span className="iz-skeleton raffle-participants-sheet__rank-skeleton" />
              <span className="iz-skeleton iz-skeleton_circle raffle-participants-sheet__avatar" />
              <span className="iz-skeleton iz-skeleton_line raffle-participants-sheet__name-skeleton" />
              <span className="iz-skeleton iz-skeleton_line raffle-participants-sheet__count-skeleton" />
            </li>
          ),
        )}
      </ul>
    );
  } else if (participantsQuery.isError) {
    content = (
      <div className="raffle-participants-sheet__state" role="alert">
        <p>{participantsQuery.error.message}</p>
        <button
          type="button"
          className="app-btn app-btn--secondary"
          onClick={() => void participantsQuery.refetch()}
        >
          {RAFFLE_PARTICIPANTS_SHEET_UI.RETRY}
        </button>
      </div>
    );
  } else if (participants.length === 0) {
    content = (
      <p className="raffle-participants-sheet__state">
        {RAFFLE_PARTICIPANTS_SHEET_UI.EMPTY}
      </p>
    );
  } else {
    content = (
      <>
        <ol className="raffle-participants-sheet__list">
          {participants.map((participant, index) => (
            <li key={participant.userId} className="raffle-participants-sheet__row">
              <span className="raffle-participants-sheet__rank">{index + 1}</span>
              <ParticipantAvatar url={participant.userAvatarUrl} />
              <button
                type="button"
                className="raffle-participants-sheet__name"
                aria-label={RAFFLE_PARTICIPANTS_SHEET_UI.OPEN_PROFILE_ARIA(
                  participant.userName,
                )}
                onClick={() => handleOpenProfile(participant.userId)}
              >
                {participant.userName}
              </button>
              <span className="raffle-participants-sheet__count">
                {formatIntegerGroupRu(participant.ticketCount)}{" "}
                {pluralizeRu(
                  participant.ticketCount,
                  RAFFLE_PARTICIPANTS_SHEET_UI.ITEM_FORMS,
                )}
              </span>
            </li>
          ))}
        </ol>
        {total > participants.length ? (
          <p className="raffle-participants-sheet__footnote">
            {RAFFLE_PARTICIPANTS_SHEET_UI.SHOWN_OF_TOTAL(participants.length, total)}
          </p>
        ) : null}
      </>
    );
  }

  return createPortal(
    <div className={backdropClass} role="presentation">
      <div className="raffle-participants-sheet__scrim" aria-hidden="true" />
      <button
        type="button"
        className="raffle-participants-sheet__dismiss"
        aria-label={RAFFLE_PARTICIPANTS_SHEET_UI.CLOSE}
        onClick={onClose}
      />
      <div
        id={sheetId}
        className="raffle-participants-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="raffle-participants-sheet__header">
          <h2 id={titleId} className="raffle-participants-sheet__title">
            {RAFFLE_PARTICIPANTS_SHEET_UI.TITLE}
            <span className="raffle-participants-sheet__total">
              {formatIntegerGroupRu(total)}
            </span>
          </h2>
          <button
            type="button"
            className="raffle-participants-sheet__close"
            onClick={onClose}
          >
            {RAFFLE_PARTICIPANTS_SHEET_UI.CLOSE}
          </button>
        </header>
        <p className="raffle-participants-sheet__hint">
          {RAFFLE_PARTICIPANTS_SHEET_UI.HINT}
        </p>
        <div className="raffle-participants-sheet__body">{content}</div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * @param {{ url: string }} props
 */
function ParticipantAvatar({ url }) {
  const [failed, setFailed] = useState(false);
  const picked = pickUserProfilePhotoUrl({ userAvatarUrl: url });
  const src = !failed && picked ? picked : DEFAULT_USER_AVATAR_URL;
  return (
    <img
      className="raffle-participants-sheet__avatar"
      src={src}
      alt=""
      width={36}
      height={36}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
