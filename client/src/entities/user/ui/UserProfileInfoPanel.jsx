import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";

import {
  COMMON_UI,
  FORMAT_BOOLEAN_RU,
  PROFILE_STATS_TREND_UI,
  USER_PROFILE_COPY,
} from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { fetchUserPhone } from "../api/fetchUserPhone.js";
import { groupProfileRows, isBooleanProfileRow } from "../lib/groupProfileRows.js";
import { getProfileSectionTone } from "../lib/profileRowColors.js";
import { getProfileRowIcon } from "../lib/profileRowIcons.js";
import { PROFILE_ROW_ID, PROFILE_SECTION_ID } from "../lib/profileRowIds.js";
import {
  buildSparklinePaths,
  formatStatsTrendPercentLabel,
} from "../lib/statsTrendSparkline.js";
import { useMyStatsTrendsQuery } from "../model/useMyStatsTrendsQuery.js";
import {
  formatRuPhoneDisplayOrEmpty,
  RU_PHONE_EMPTY_LABEL,
  toRuPhoneTelHref,
} from "../lib/ruPhone.js";

import "./UserProfileInfoPanel.css";

const PHONE_ROW_ID = PROFILE_ROW_ID.PHONE;
const STATS_SECTION_ID = PROFILE_SECTION_ID.STATS;
const STATS_WIDE_ROW_ID = PROFILE_ROW_ID.LOYALTY_POINTS;
const SPARKLINE_WIDTH = 72;
const SPARKLINE_HEIGHT = 28;

/** @type {ReadonlySet<string>} */
const STATS_TREND_ROW_IDS = new Set([
  PROFILE_ROW_ID.FOLLOWERS,
  PROFILE_ROW_ID.TOTAL_SALES_COUNT,
]);

/**
 * @param {{
 * rows: { id: string; label: string; value: string; href?: string; needsPhoneReveal?: boolean }[];
 * className?: string;
 * hidePhoneUntilReveal?: boolean;
 * userId?: string | null;
 * accountSectionFooter?: import('react').ReactNode;
 * rowActions?: Record<string, () => void>;
 * showStatsTrends?: boolean;
 * }} props `rowActions` — строка с этим id нажимается целиком (свой профиль:
 *   «Продажи» → «Мои продажи» и т. п.).
 */
export function UserProfileInfoPanel({
  rows,
  className = "",
  hidePhoneUntilReveal = false,
  userId = null,
  accountSectionFooter = null,
  rowActions = null,
  showStatsTrends = false,
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
          rowActions={rowActions}
          showStatsTrends={showStatsTrends}
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
 * rowActions?: Record<string, () => void> | null;
 * showStatsTrends?: boolean;
 * }} props
 */
function ProfileDetailsSection({
  sectionId,
  title,
  rows,
  hidePhoneUntilReveal,
  userId,
  sectionFooter = null,
  rowActions = null,
  showStatsTrends = false,
}) {
  const sectionTone = getProfileSectionTone(sectionId);
  const isStatsSection = sectionId === STATS_SECTION_ID;
  const trendsQuery = useMyStatsTrendsQuery({
    enabled: showStatsTrends && isStatsSection,
  });

  if (isStatsSection) {
    return (
      <section
        className="user-profile-info__section user-profile-info__section_stats"
        data-tone={sectionTone}
      >
        {title ? <h3 className="user-profile-info__section-title">{title}</h3> : null}
        <dl className="user-profile-info__stats-grid">
          {rows.map((row) => (
            <ProfileStatCard
              key={row.id}
              row={row}
              isWide={row.id === STATS_WIDE_ROW_ID}
              onRowAction={rowActions?.[row.id] ?? null}
              trend={resolveRowTrend(row.id, trendsQuery.data)}
            />
          ))}
        </dl>
      </section>
    );
  }

  return (
    <section className="user-profile-info__section" data-tone={sectionTone}>
      {title ? <h3 className="user-profile-info__section-title">{title}</h3> : null}
      <dl className="user-profile-info__details">
        {rows.map((row) => {
          const icon = getProfileRowIcon(row.id);
          const isEmpty =
            row.value === COMMON_UI.EM_DASH || row.value === RU_PHONE_EMPTY_LABEL;
          const onRowAction = rowActions?.[row.id] ?? null;

          return (
            <div
              key={row.id}
              className={[
                "user-profile-info__detail-row",
                onRowAction ? "user-profile-info__detail-row_action" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <dt className="user-profile-info__detail-label">
                {icon ? (
                  <span className="user-profile-info__detail-icon" aria-hidden="true">
                    <AppIcon icon={icon} size="sm" strokeWidth={2.1} />
                  </span>
                ) : null}
                {onRowAction ? (
                  // Кнопка растянута на всю строку (::after), разметка dl не ломается.
                  <button
                    type="button"
                    className="user-profile-info__detail-action"
                    onClick={onRowAction}
                  >
                    {row.label}
                  </button>
                ) : (
                  <span>{row.label}</span>
                )}
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
 * @param {string} rowId
 * @param {{
 *   followers?: { percentChange: number; series: number[] };
 *   sales?: { percentChange: number; series: number[] };
 * } | undefined} trends
 * @returns {{ percentChange: number; series: number[] } | null}
 */
function resolveRowTrend(rowId, trends) {
  if (!trends || !STATS_TREND_ROW_IDS.has(rowId)) {
    return null;
  }
  if (rowId === PROFILE_ROW_ID.FOLLOWERS) {
    return trends.followers ?? null;
  }
  if (rowId === PROFILE_ROW_ID.TOTAL_SALES_COUNT) {
    return trends.sales ?? null;
  }
  return null;
}

/**
 * @param {{
 * row: { id: string; label: string; value: string };
 * isWide: boolean;
 * onRowAction: (() => void) | null;
 * trend?: { percentChange: number; series: number[] } | null;
 * }} props
 */
function ProfileStatCard({ row, isWide, onRowAction, trend = null }) {
  const icon = getProfileRowIcon(row.id);
  const isEmpty = row.value === COMMON_UI.EM_DASH;
  const showTrend = Boolean(trend) && !isWide;
  const percentChange = trend?.percentChange ?? 0;
  const percentLabel = formatStatsTrendPercentLabel(percentChange);
  const trendTone = percentChange > 0 ? "up" : percentChange < 0 ? "down" : "flat";
  const sparkPaths = showTrend
    ? buildSparklinePaths(trend.series, {
        width: SPARKLINE_WIDTH,
        height: SPARKLINE_HEIGHT,
      })
    : null;
  const trendAria =
    trendTone === "up"
      ? PROFILE_STATS_TREND_UI.UP_ARIA(row.label)
      : trendTone === "down"
        ? PROFILE_STATS_TREND_UI.DOWN_ARIA(row.label)
        : PROFILE_STATS_TREND_UI.FLAT_ARIA(row.label);

  return (
    <div
      className={[
        "user-profile-info__stat-card",
        isWide ? "user-profile-info__stat-card_wide" : "",
        onRowAction ? "user-profile-info__stat-card_action" : "",
        showTrend ? "user-profile-info__stat-card_trend" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-row-id={row.id}
    >
      {icon ? (
        <span className="user-profile-info__stat-icon" aria-hidden="true">
          <AppIcon icon={icon} size="sm" strokeWidth={2.2} />
        </span>
      ) : null}
      <div className="user-profile-info__stat-text">
        <dt className="user-profile-info__stat-label">
          {onRowAction ? (
            <button
              type="button"
              className="user-profile-info__detail-action"
              onClick={onRowAction}
            >
              {row.label}
            </button>
          ) : (
            <span>{row.label}</span>
          )}
        </dt>
        <dd
          className={[
            "user-profile-info__stat-value",
            isEmpty ? "user-profile-info__stat-value_empty" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {row.value}
        </dd>
        {showTrend ? (
          <p
            className={[
              "user-profile-info__stat-trend",
              `user-profile-info__stat-trend_${trendTone}`,
            ].join(" ")}
            aria-label={`${trendAria}: ${percentLabel}. ${PROFILE_STATS_TREND_UI.WINDOW_ARIA}`}
          >
            <span aria-hidden="true">
              {percentLabel}
              {trendTone === "up" ? " ↑" : trendTone === "down" ? " ↓" : ""}
            </span>
          </p>
        ) : null}
      </div>
      {sparkPaths ? (
        <svg
          className="user-profile-info__stat-sparkline"
          viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
          width={SPARKLINE_WIDTH}
          height={SPARKLINE_HEIGHT}
          aria-hidden="true"
          focusable="false"
        >
          <path
            className="user-profile-info__stat-sparkline-area"
            d={sparkPaths.areaPath}
          />
          <path
            className="user-profile-info__stat-sparkline-line"
            d={sparkPaths.linePath}
            fill="none"
          />
        </svg>
      ) : null}
      <span className="user-profile-info__stat-chevron" aria-hidden="true">
        <AppIcon icon={ChevronRight} size="sm" strokeWidth={2.2} />
      </span>
    </div>
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
  const [revealedPhone, setRevealedPhone] = useState(
    /** @type {string | null} */ (null),
  );
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
        {...(isExternalHttp ? { target: "_blank", rel: "noopener noreferrer" } : {})}
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
