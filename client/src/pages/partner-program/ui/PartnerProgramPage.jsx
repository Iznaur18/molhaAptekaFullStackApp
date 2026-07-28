import { useMemo, useState } from "react";

import { useConvertPartnerBalanceMutation } from "../../../entities/user/model/useConvertPartnerBalanceMutation.js";
import { useMyReferralProgramQuery } from "../../../entities/user/model/useMyReferralProgramQuery.js";
import { PARTNER_PROGRAM_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { copyTextToClipboard } from "../../../shared/lib/copyTextToClipboard.js";
import { createClientIdempotencyKey } from "../../../shared/lib/createClientIdempotencyKey.js";
import {
  INTEGER_INPUT_FIELD_PROPS,
  formatRubPriceInput,
  parseRubPriceInput,
} from "../../../shared/lib/numericInput.js";
import { shareOrCopyUrl } from "../../../shared/lib/shareOrCopyUrl.js";
import { resolvePartnerInviteUrl } from "../lib/resolvePartnerInviteUrl.js";

import "./PartnerProgramPage.css";

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
      />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

/**
 * @param {{
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   onLoyaltyPointsBalanceChange?: (balance: number) => void;
 * }} props
 */
export function PartnerProgramPage({
  isAuthorized,
  onRequestLogin,
  onLoyaltyPointsBalanceChange,
}) {
  const query = useMyReferralProgramQuery({ enabled: isAuthorized });
  const convertMutation = useConvertPartnerBalanceMutation();
  const [convertAmountRaw, setConvertAmountRaw] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [convertFeedback, setConvertFeedback] = useState("");
  const [convertFeedbackIsError, setConvertFeedbackIsError] = useState(false);

  const data = query.data;
  const convertAmount = useMemo(
    () => parseRubPriceInput(convertAmountRaw) ?? 0,
    [convertAmountRaw],
  );
  const inviteUrl = useMemo(
    () =>
      data
        ? resolvePartnerInviteUrl(data.referralCode, data.inviteUrl)
        : "",
    [data],
  );

  if (!isAuthorized) {
    return (
      <section className="partner-program-page partner-program-page_centered">
        <p className="partner-program-page__hint">{PARTNER_PROGRAM_PAGE_UI.LOGIN_HINT}</p>
        <button
          type="button"
          className="partner-program-page__login app-btn app-btn--primary"
          onClick={onRequestLogin}
        >
          {PARTNER_PROGRAM_PAGE_UI.LOGIN_BUTTON}
        </button>
      </section>
    );
  }

  if (query.isLoading) {
    return (
      <section className="partner-program-page">
        <p className="partner-program-page__state">{PARTNER_PROGRAM_PAGE_UI.LOADING}</p>
      </section>
    );
  }

  if (query.isError || !data) {
    return (
      <section className="partner-program-page">
        <p className="partner-program-page__state partner-program-page__state_error" role="alert">
          {query.error instanceof Error
            ? query.error.message
            : PARTNER_PROGRAM_PAGE_UI.LOAD_ERROR}
        </p>
      </section>
    );
  }

  const handleCopy = async () => {
    try {
      await copyTextToClipboard(inviteUrl);
      setCopyFeedback(PARTNER_PROGRAM_PAGE_UI.COPIED);
    } catch {
      setCopyFeedback(PARTNER_PROGRAM_PAGE_UI.COPY_FAILED);
    }
  };

  const handleShare = async () => {
    try {
      const result = await shareOrCopyUrl({
        title: PARTNER_PROGRAM_PAGE_UI.ARIA,
        text: PARTNER_PROGRAM_PAGE_UI.INVITE_HINT,
        url: inviteUrl,
      });
      if (result === "cancelled") {
        return;
      }
      setCopyFeedback(
        result === "shared"
          ? PARTNER_PROGRAM_PAGE_UI.SHARED
          : PARTNER_PROGRAM_PAGE_UI.SHARE_COPIED,
      );
    } catch {
      setCopyFeedback(PARTNER_PROGRAM_PAGE_UI.SHARE_FAILED);
    }
  };

  const handleConvert = async () => {
    if (convertAmount <= 0) {
      return;
    }
    setConvertFeedback("");
    setConvertFeedbackIsError(false);
    try {
      const result = await convertMutation.mutateAsync({
        amount: convertAmount,
        idempotencyKey: createClientIdempotencyKey(),
      });
      setConvertAmountRaw("");
      setConvertFeedback(PARTNER_PROGRAM_PAGE_UI.CONVERT_SUCCESS);
      if (
        typeof onLoyaltyPointsBalanceChange === "function" &&
        typeof result.loyaltyPointsBalance === "number"
      ) {
        onLoyaltyPointsBalanceChange(result.loyaltyPointsBalance);
      }
    } catch (error) {
      setConvertFeedbackIsError(true);
      setConvertFeedback(
        error instanceof Error
          ? error.message
          : PARTNER_PROGRAM_PAGE_UI.CONVERT_ERROR,
      );
    }
  };

  const canConvert =
    !convertMutation.isPending &&
    convertAmount > 0 &&
    convertAmount <= data.partnerBalance;

  return (
    <section className="partner-program-page" aria-label={PARTNER_PROGRAM_PAGE_UI.ARIA}>
      <div
        className="partner-program-page__hero"
        aria-label={`${PARTNER_PROGRAM_PAGE_UI.BALANCE_CAPTION}: ${data.partnerBalance}`}
      >
        <div className="partner-program-page__hero-text">
          <p className="partner-program-page__hero-caption">
            {PARTNER_PROGRAM_PAGE_UI.BALANCE_CAPTION}
          </p>
          <p className="partner-program-page__hero-row">
            <span className="partner-program-page__hero-value">{data.partnerBalance}</span>
            <span className="partner-program-page__hero-unit">
              {PARTNER_PROGRAM_PAGE_UI.BALANCE_UNIT}
            </span>
          </p>
          <p className="partner-program-page__hero-info">
            {PARTNER_PROGRAM_PAGE_UI.INFO(data.cashbackPercent)}
          </p>
        </div>
        <div className="partner-program-page__hero-icon" aria-hidden="true">
          <UsersIcon />
        </div>
      </div>

      <div className="partner-program-page__card">
        <h3 className="partner-program-page__card-title">{PARTNER_PROGRAM_PAGE_UI.STATS_TITLE}</h3>
        <div className="partner-program-page__stats">
          <div className="partner-program-page__stat">
            <span className="partner-program-page__stat-label">
              {PARTNER_PROGRAM_PAGE_UI.STAT_REFERRALS}
            </span>
            <span className="partner-program-page__stat-value">{data.totalReferrals}</span>
          </div>
          <div className="partner-program-page__stat">
            <span className="partner-program-page__stat-label">
              {PARTNER_PROGRAM_PAGE_UI.STAT_SPEND}
            </span>
            <span className="partner-program-page__stat-value">{data.totalReferralsSpend}</span>
          </div>
          <div className="partner-program-page__stat">
            <span className="partner-program-page__stat-label">
              {PARTNER_PROGRAM_PAGE_UI.STAT_EARNED}
            </span>
            <span className="partner-program-page__stat-value">{data.totalCashbackEarned}</span>
          </div>
        </div>
      </div>

      <div className="partner-program-page__card">
        <h3 className="partner-program-page__card-title">{PARTNER_PROGRAM_PAGE_UI.INVITE_TITLE}</h3>
        <p className="partner-program-page__card-hint">{PARTNER_PROGRAM_PAGE_UI.INVITE_HINT}</p>
        <div className="partner-program-page__invite-row">
          <span className="partner-program-page__invite-url" title={inviteUrl}>
            {inviteUrl}
          </span>
          <div className="partner-program-page__invite-actions">
            <button type="button" className="app-btn app-btn--secondary" onClick={handleCopy}>
              {PARTNER_PROGRAM_PAGE_UI.COPY_BUTTON}
            </button>
            <button type="button" className="app-btn app-btn--primary" onClick={handleShare}>
              {PARTNER_PROGRAM_PAGE_UI.SHARE_BUTTON}
            </button>
          </div>
        </div>
        {copyFeedback ? (
          <p className="partner-program-page__feedback" role="status">
            {copyFeedback}
          </p>
        ) : null}
      </div>

      <div className="partner-program-page__card">
        <h3 className="partner-program-page__card-title">
          {PARTNER_PROGRAM_PAGE_UI.CONVERT_SECTION}
        </h3>
        <label className="partner-program-page__field">
          {PARTNER_PROGRAM_PAGE_UI.CONVERT_LABEL}
          <input
            {...INTEGER_INPUT_FIELD_PROPS}
            className="partner-program-page__input"
            value={convertAmountRaw}
            onChange={(event) => {
              setConvertAmountRaw(formatRubPriceInput(event.target.value));
              setConvertFeedback("");
              setConvertFeedbackIsError(false);
            }}
            placeholder="0"
            aria-label={PARTNER_PROGRAM_PAGE_UI.CONVERT_LABEL}
          />
        </label>
        <p className="partner-program-page__card-hint">{PARTNER_PROGRAM_PAGE_UI.CONVERT_HINT}</p>
        <button
          type="button"
          className="partner-program-page__submit app-btn app-btn--primary"
          disabled={!canConvert}
          onClick={handleConvert}
        >
          {convertMutation.isPending
            ? PARTNER_PROGRAM_PAGE_UI.CONVERT_PENDING
            : PARTNER_PROGRAM_PAGE_UI.CONVERT_BUTTON}
        </button>
        {convertFeedback ? (
          <p
            className={
              convertFeedbackIsError
                ? "partner-program-page__feedback partner-program-page__feedback_error"
                : "partner-program-page__feedback"
            }
            role={convertFeedbackIsError ? "alert" : "status"}
          >
            {convertFeedback}
          </p>
        ) : null}
        {convertMutation.isError && !convertFeedback ? (
          <p
            className="partner-program-page__feedback partner-program-page__feedback_error"
            role="alert"
          >
            {convertMutation.error instanceof Error
              ? convertMutation.error.message
              : PARTNER_PROGRAM_PAGE_UI.CONVERT_ERROR}
          </p>
        ) : null}
      </div>

      <div className="partner-program-page__card">
        <h3 className="partner-program-page__card-title">{PARTNER_PROGRAM_PAGE_UI.LIST_TITLE}</h3>
        {data.referrals.length === 0 ? (
          <p className="partner-program-page__empty">{PARTNER_PROGRAM_PAGE_UI.LIST_EMPTY}</p>
        ) : (
          <>
            <div className="partner-program-page__row partner-program-page__row-head">
              <span>{PARTNER_PROGRAM_PAGE_UI.COL_NAME}</span>
              <span>{PARTNER_PROGRAM_PAGE_UI.COL_DATE}</span>
              <span>{PARTNER_PROGRAM_PAGE_UI.COL_SPEND}</span>
              <span>{PARTNER_PROGRAM_PAGE_UI.COL_CASHBACK}</span>
            </div>
            {data.referrals.map((row) => (
              <div key={row.userId} className="partner-program-page__row">
                <span className="partner-program-page__row-name">{row.userName}</span>
                <span className="partner-program-page__row-meta">
                  {row.registeredAt
                    ? new Date(row.registeredAt).toLocaleDateString("ru-RU")
                    : "—"}
                </span>
                <span className="partner-program-page__row-meta">{row.pointsSpentTotal}</span>
                <span className="partner-program-page__row-meta">{row.cashbackEarnedTotal}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
