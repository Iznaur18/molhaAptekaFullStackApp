import { useState } from "react";

import { countWords } from "../../user/lib/countWords.js";
import { UserPremiumDisplayName } from "../../user/ui/UserPremiumDisplayName.jsx";
import { resolveDataConfirmationRequest } from "../api/resolveDataConfirmationRequest.js";
import {
  formatPassportDate,
  formatPassportFullName,
} from "../lib/formatPassportDisplay.js";
import {
  USER_DATA_CONFIRMATION_RESOLUTION_APPROVE,
  USER_DATA_CONFIRMATION_RESOLUTION_REJECT,
} from "../model/constants.js";
import { formatIsoDateTime } from "../../../shared/lib/formatIsoDateTime.js";
import { resolveImageUrlForDisplay } from "../../../shared/lib/resolveUploadedImageUrl.js";
import {
  DATA_CONFIRMATION_PAGE_UI,
  USER_LIST_ROW_UI,
} from "../../../shared/config/appUiCopy.js";

import "./DataConfirmationRequestCard.css";

/**
 * @param {{
 *   request: import('../model/types.js').DataConfirmationRequest;
 *   onResolved: () => void;
 *   onOpenUser: (userId: string) => void;
 * }} props
 */
export function DataConfirmationRequestCard({ request, onResolved, onOpenUser }) {
  const [staffNote, setStaffNote] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  const applicant = request.user;
  const displayName = applicant?.userName?.trim() || USER_LIST_ROW_UI.MISSING_NAME;
  const passport = request.passport;
  const selfiePhotoUrl = request.passportSelfiePhotoUrl?.trim() ?? "";
  const selfieDisplayUrl = selfiePhotoUrl
    ? resolveImageUrlForDisplay(selfiePhotoUrl)
    : "";

  const handleResolve = async (resolution) => {
    if (resolution === USER_DATA_CONFIRMATION_RESOLUTION_REJECT) {
      const note = staffNote.trim();
      if (countWords(note) < DATA_CONFIRMATION_PAGE_UI.STAFF_NOTE_MIN_WORDS) {
        setError(
          `Комментарий: не меньше ${DATA_CONFIRMATION_PAGE_UI.STAFF_NOTE_MIN_WORDS} слов`,
        );
        return;
      }
    }

    setIsBusy(true);
    setError("");
    try {
      await resolveDataConfirmationRequest(String(request._id), {
        resolution,
        staffNote:
          resolution === USER_DATA_CONFIRMATION_RESOLUTION_REJECT
            ? staffNote.trim()
            : "",
      });
      onResolved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <article className="data-confirmation-card">
      <header className="data-confirmation-card__header">
        <UserPremiumDisplayName
          name={displayName}
          isPremium={Boolean(applicant?.isPremiumUser)}
          isUserDataConfirmed={false}
        />
        <span className="data-confirmation-card__meta">
          {DATA_CONFIRMATION_PAGE_UI.SUBMITTED_LABEL}:{" "}
          {formatIsoDateTime(request.createdAt)}
        </span>
      </header>
      {applicant?._id ? (
        <button
          type="button"
          className="data-confirmation-card__link"
          onClick={() => onOpenUser(String(applicant._id))}
        >
          {DATA_CONFIRMATION_PAGE_UI.OPEN_APPLICANT}
        </button>
      ) : null}
      <section className="data-confirmation-card__passport">
        <h4>{DATA_CONFIRMATION_PAGE_UI.PASSPORT_SECTION}</h4>
        <dl className="data-confirmation-card__passport-grid">
          <div>
            <dt>ФИО</dt>
            <dd>{formatPassportFullName(passport)}</dd>
          </div>
          <div>
            <dt>Дата рождения</dt>
            <dd>{formatPassportDate(passport.birthDate)}</dd>
          </div>
          <div>
            <dt>Серия и номер</dt>
            <dd>
              {passport.series} {passport.number}
            </dd>
          </div>
          <div>
            <dt>Кем выдан</dt>
            <dd>{passport.issuedBy}</dd>
          </div>
          <div>
            <dt>Дата выдачи</dt>
            <dd>{formatPassportDate(passport.issuedAt)}</dd>
          </div>
          <div>
            <dt>Код подразделения</dt>
            <dd>{passport.departmentCode}</dd>
          </div>
        </dl>
      </section>
      <section className="data-confirmation-card__selfie">
        <h4>{DATA_CONFIRMATION_PAGE_UI.PASSPORT_SELFIE_SECTION}</h4>
        {selfieDisplayUrl ? (
          <a
            className="data-confirmation-card__selfie-link"
            href={selfieDisplayUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="data-confirmation-card__selfie-image"
              src={selfieDisplayUrl}
              alt={DATA_CONFIRMATION_PAGE_UI.PASSPORT_SELFIE_SECTION}
            />
            <span>{DATA_CONFIRMATION_PAGE_UI.PASSPORT_SELFIE_OPEN}</span>
          </a>
        ) : (
          <p className="data-confirmation-card__selfie-missing">
            {DATA_CONFIRMATION_PAGE_UI.PASSPORT_SELFIE_MISSING}
          </p>
        )}
      </section>
      <label className="data-confirmation-card__note">
        {DATA_CONFIRMATION_PAGE_UI.STAFF_NOTE_LABEL}
        <textarea
          rows={2}
          value={staffNote}
          onChange={(e) => setStaffNote(e.target.value)}
          placeholder={DATA_CONFIRMATION_PAGE_UI.STAFF_NOTE_PLACEHOLDER}
          disabled={isBusy}
        />
      </label>
      {error ? (
        <p className="data-confirmation-card__error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="data-confirmation-card__actions">
        <button
          type="button"
          disabled={isBusy}
          onClick={() => void handleResolve(USER_DATA_CONFIRMATION_RESOLUTION_APPROVE)}
        >
          {isBusy
            ? DATA_CONFIRMATION_PAGE_UI.ACTION_PENDING
            : DATA_CONFIRMATION_PAGE_UI.ACTION_APPROVE}
        </button>
        <button
          type="button"
          className="data-confirmation-card__reject"
          disabled={isBusy}
          onClick={() => void handleResolve(USER_DATA_CONFIRMATION_RESOLUTION_REJECT)}
        >
          {DATA_CONFIRMATION_PAGE_UI.ACTION_REJECT}
        </button>
      </div>
    </article>
  );
}
