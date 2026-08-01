import { useMemo, useState } from "react";

import { useMyReferralProgramQuery } from "../../../entities/user/model/useMyReferralProgramQuery.js";
import { AffiliateListingsPage } from "../../affiliate-listings/ui/AffiliateListingsPage.jsx";
import { PARTNER_PROGRAM_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { copyTextToClipboard } from "../../../shared/lib/copyTextToClipboard.js";
import { shareOrCopyUrl } from "../../../shared/lib/shareOrCopyUrl.js";
import { resolvePartnerInviteUrl } from "../lib/resolvePartnerInviteUrl.js";

import "./PartnerProgramPage.css";

/**
 * @param {{
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 * }} props
 */
export function PartnerProgramPage({
  isAuthorized,
  onRequestLogin,
}) {
  const query = useMyReferralProgramQuery({ enabled: isAuthorized });
  const [copyFeedback, setCopyFeedback] = useState("");

  const data = query.data;
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

  return (
    <section className="partner-program-page" aria-label={PARTNER_PROGRAM_PAGE_UI.ARIA}>
      <p className="partner-program-page__intro">
        {PARTNER_PROGRAM_PAGE_UI.INFO(data.cashbackPercent)}
      </p>

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

      <AffiliateListingsPage isAuthorized embedded />
    </section>
  );
}
