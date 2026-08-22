import { useEffect, useMemo, useState } from "react";

import {
  COMMON_UI,
  SELLER_PRODUCTS_PAGE_UI,
  USER_PROFILE_COPY,
} from "../../../shared/config/appUiCopy.js";
import { fetchUserPhone } from "../api/fetchUserPhone.js";
import { formatSearchRowRatingCompact } from "../lib/formatSearchRowRating.js";
import {
  formatRuPhoneDisplayOrEmpty,
  RU_PHONE_EMPTY_LABEL,
  toRuPhoneTelHref,
} from "../lib/ruPhone.js";

import "./SellerProfileQuickStats.css";

/**
 * @param {import('../model/types.js').UserPublicProfile} seller
 */
function resolvePhoneRow(seller) {
  const phone = String(seller.userPhoneNumber ?? "").trim();
  const hasPhoneNumber = Boolean(seller.hasPhoneNumber) || Boolean(phone);

  if (!hasPhoneNumber) {
    return {
      display: RU_PHONE_EMPTY_LABEL,
      href: null,
      needsPhoneReveal: false,
    };
  }

  return {
    display: phone ? formatRuPhoneDisplayOrEmpty(phone) : "",
    href: phone ? toRuPhoneTelHref(phone) : null,
    needsPhoneReveal: !phone,
  };
}

/**
 * @param {{
 *   seller: import('../model/types.js').UserPublicProfile;
 *   userId: string;
 *   hidePhoneUntilReveal?: boolean;
 * }} props
 */
export function SellerProfileQuickStats({
  seller,
  userId,
  hidePhoneUntilReveal = true,
}) {
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState(/** @type {string | null} */ (null));
  const [revealPending, setRevealPending] = useState(false);
  const [revealError, setRevealError] = useState("");

  const phoneRow = useMemo(() => resolvePhoneRow(seller), [seller]);

  useEffect(() => {
    setPhoneRevealed(false);
    setRevealedPhone(null);
    setRevealError("");
  }, [userId, phoneRow.display, phoneRow.href, phoneRow.needsPhoneReveal]);

  const followersValue =
    seller.followersCount == null
      ? "0"
      : String(Math.max(0, Math.floor(Number(seller.followersCount)) || 0));

  const ratingValue = formatSearchRowRatingCompact(seller.userRatingByVotes);

  const phoneDisplay = revealedPhone
    ? formatRuPhoneDisplayOrEmpty(revealedPhone)
    : phoneRow.display;
  const phoneHref = revealedPhone
    ? toRuPhoneTelHref(revealedPhone)
    : phoneRow.href;

  const phoneNeedsReveal =
    hidePhoneUntilReveal &&
    (Boolean(phoneRow.href) || phoneRow.needsPhoneReveal) &&
    !phoneRevealed;

  const stats = [
    {
      key: "followers",
      label: USER_PROFILE_COPY.LABELS.followersCount,
      value: followersValue,
    },
    {
      key: "rating",
      label: SELLER_PRODUCTS_PAGE_UI.STATS_VOTE_RATING,
      value: ratingValue,
    },
    {
      key: "phone",
      label: USER_PROFILE_COPY.LABELS.userPhoneNumber,
      value: phoneDisplay,
      href: phoneHref,
      needsReveal: phoneNeedsReveal,
      needsPhoneReveal: phoneRow.needsPhoneReveal,
    },
  ];

  return (
    <section
      className="seller-profile-quick-stats"
      aria-label={SELLER_PRODUCTS_PAGE_UI.STATS_ARIA}
    >
      <dl className="seller-profile-quick-stats__grid">
        {stats.map((row) => (
          <div
            key={row.key}
            className={[
              "seller-profile-quick-stats__item",
              row.key === "phone" ? "seller-profile-quick-stats__item_phone" : "",
              row.key === "rating" ? "seller-profile-quick-stats__item_rating" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="seller-profile-quick-stats__body">
              <dd className="seller-profile-quick-stats__value">
                {row.key === "phone" && row.needsReveal ? (
                  <span className="seller-profile-quick-stats__reveal-wrap">
                    <button
                      type="button"
                      className="seller-profile-quick-stats__reveal"
                      disabled={revealPending}
                      onClick={async () => {
                        if (row.needsPhoneReveal) {
                          if (!userId) {
                            setRevealError(USER_PROFILE_COPY.SHOW_PHONE_NUMBER_ERROR);
                            return;
                          }
                          setRevealPending(true);
                          setRevealError("");
                          try {
                            const phone = await fetchUserPhone(userId);
                            setRevealedPhone(phone);
                            setPhoneRevealed(true);
                          } catch (error) {
                            setRevealError(
                              error instanceof Error
                                ? error.message
                                : USER_PROFILE_COPY.SHOW_PHONE_NUMBER_ERROR,
                            );
                          } finally {
                            setRevealPending(false);
                          }
                          return;
                        }
                        setPhoneRevealed(true);
                      }}
                    >
                      {revealPending
                        ? USER_PROFILE_COPY.SHOW_PHONE_NUMBER_PENDING
                        : USER_PROFILE_COPY.SHOW_PHONE_NUMBER}
                    </button>
                    {revealError ? (
                      <span
                        className="seller-profile-quick-stats__reveal-error"
                        role="alert"
                      >
                        {revealError}
                      </span>
                    ) : null}
                  </span>
                ) : row.href && row.value !== RU_PHONE_EMPTY_LABEL ? (
                  <a className="seller-profile-quick-stats__link" href={row.href}>
                    {row.value}
                  </a>
                ) : (
                  row.value || COMMON_UI.EM_DASH
                )}
              </dd>
              <dt className="seller-profile-quick-stats__label">{row.label}</dt>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
