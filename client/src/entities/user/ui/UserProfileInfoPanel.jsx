import { useEffect, useMemo, useState } from "react";

import {
  COMMON_UI,
  FORMAT_BOOLEAN_RU,
  USER_PROFILE_COPY,
} from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { fetchUserPhone } from "../api/fetchUserPhone.js";
import {
  groupProfileRows,
  isBooleanProfileRow,
} from "../lib/groupProfileRows.js";
import { getProfileSectionTone } from "../lib/profileRowColors.js";
import { getProfileRowIcon } from "../lib/profileRowIcons.js";
import {
  formatRuPhoneDisplayOrEmpty,
  RU_PHONE_EMPTY_LABEL,
  toRuPhoneTelHref,
} from "../lib/ruPhone.js";

import "./UserProfileInfoPanel.css";

const PHONE_ROW_ID = "userPhoneNumber";

/**
 * @param {{
 * rows: { id: string; label: string; value: string; href?: string; needsPhoneReveal?: boolean }[];
 * className?: string;
 * hidePhoneUntilReveal?: boolean;
 * userId?: string | null;
 * accountSectionFooter?: import('react').ReactNode;
 * }} props
 */
export function UserProfileInfoPanel({
  rows,
  className = "",
  hidePhoneUntilReveal = false,
  userId = null,
  accountSectionFooter = null,
}) {
  const sections = useMemo(() => groupProfileRows(rows), [rows]);

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className={["user-profile-info", className].filter(Boolean).join(" ")}>
      {sections.map((section) => (
        <ProfileDetailsSection
          key={section.id}
          sectionId={section.id}
          title={section.title}
          rows={section.rows}
          hidePhoneUntilReveal={hidePhoneUntilReveal}
          userId={userId}
          sectionFooter={section.id === "account" ? accountSectionFooter : null}
        />
      ))}
    </div>
  );
}

/**
 * @param {{
 * sectionId: string;
 * title: string | null;
 * rows: { id: string; label: string; value: string; href?: string; needsPhoneReveal?: boolean }[];
 * hidePhoneUntilReveal: boolean;
 * userId: string | null;
 * sectionFooter?: import('react').ReactNode;
 * }} props
 */
function ProfileDetailsSection({
  sectionId,
  title,
  rows,
  hidePhoneUntilReveal,
  userId,
  sectionFooter = null,
}) {
  const sectionTone = getProfileSectionTone(sectionId);

  return (
    <section className="user-profile-info__section" data-tone={sectionTone}>
      {title ? <h3 className="user-profile-info__section-title">{title}</h3> : null}
      <dl className="user-profile-info__details">
        {rows.map((row) => {
          const icon = getProfileRowIcon(row.id);
          const isEmpty =
            row.value === COMMON_UI.EM_DASH || row.value === RU_PHONE_EMPTY_LABEL;

          return (
            <div key={row.id} className="user-profile-info__detail-row">
              <dt className="user-profile-info__detail-label">
                {icon ? (
                  <span className="user-profile-info__detail-icon" aria-hidden="true">
                    <AppIcon icon={icon} size="sm" strokeWidth={2.1} />
                  </span>
                ) : null}
                <span>{row.label}</span>
              </dt>
              <dd
                className={[
                  "user-profile-info__detail-value",
                  isEmpty && !row.needsPhoneReveal
                    ? "user-profile-info__detail-value_empty"
                    : "",
                  isBooleanProfileRow(row.id)
                    ? resolveBooleanValueClass(row.value)
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <ProfileDetailValue
                  row={row}
                  hidePhoneUntilReveal={hidePhoneUntilReveal}
                  userId={userId}
                />
              </dd>
            </div>
          );
        })}
        {sectionFooter}
      </dl>
    </section>
  );
}

/**
 * @param {{
 * row: { id: string; value: string; href?: string; needsPhoneReveal?: boolean };
 * hidePhoneUntilReveal: boolean;
 * userId: string | null;
 * }} props
 */
function ProfileDetailValue({ row, hidePhoneUntilReveal, userId }) {
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState(/** @type {string | null} */ (null));
  const [revealPending, setRevealPending] = useState(false);
  const [revealError, setRevealError] = useState("");

  const needsReveal =
    hidePhoneUntilReveal &&
    row.id === PHONE_ROW_ID &&
    (Boolean(row.href) || Boolean(row.needsPhoneReveal));

  useEffect(() => {
    setPhoneRevealed(false);
    setRevealedPhone(null);
    setRevealError("");
  }, [row.href, row.value, row.needsPhoneReveal]);

  if (needsReveal && !phoneRevealed) {
    return (
      <span className="user-profile-info__reveal-wrap">
        <button
          type="button"
          className="user-profile-info__reveal-phone"
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
          <span className="user-profile-info__reveal-error" role="alert">
            {revealError}
          </span>
        ) : null}
      </span>
    );
  }

  if (row.id === PHONE_ROW_ID && revealedPhone) {
    const href = toRuPhoneTelHref(revealedPhone);
    const value = formatRuPhoneDisplayOrEmpty(revealedPhone);
    if (href) {
      return (
        <a className="user-profile-info__detail-link" href={href}>
          {value}
        </a>
      );
    }
    return value;
  }

  if (row.href) {
    const isExternalHttp = /^https?:\/\//i.test(row.href);
    return (
      <a
        className="user-profile-info__detail-link"
        href={row.href}
        {...(isExternalHttp
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {row.value}
      </a>
    );
  }

  return row.value;
}

/**
 * @param {string} value
 * @returns {string}
 */
function resolveBooleanValueClass(value) {
  if (value === FORMAT_BOOLEAN_RU.YES) {
    return "user-profile-info__detail-value_positive";
  }

  if (value === FORMAT_BOOLEAN_RU.NO) {
    return "user-profile-info__detail-value_negative";
  }

  return "";
}
