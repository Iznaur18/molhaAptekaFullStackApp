import { useMemo } from "react";

import { COMMON_UI, FORMAT_BOOLEAN_RU } from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import {
  groupProfileRows,
  isBooleanProfileRow,
} from "../lib/groupProfileRows.js";
import { getProfileSectionTone } from "../lib/profileRowColors.js";
import { getProfileRowIcon } from "../lib/profileRowIcons.js";

import "./UserProfileInfoPanel.css";

/**
 * @param {{
 * rows: { id: string; label: string; value: string }[];
 * className?: string;
 * }} props
 */
export function UserProfileInfoPanel({ rows, className = "" }) {
  const sections = useMemo(() => groupProfileRows(rows), [rows]);

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className={["user-profile-info", className].filter(Boolean).join(" ")}>
      {sections.map((section) =>
        section.id === "stats" ? (
          <ProfileStatsSection
            key={section.id}
            sectionId={section.id}
            rows={section.rows}
          />
        ) : (
          <ProfileDetailsSection
            key={section.id}
            sectionId={section.id}
            title={section.title}
            rows={section.rows}
          />
        ),
      )}
    </div>
  );
}

/**
 * @param {{
 * sectionId: string;
 * rows: { id: string; label: string; value: string }[];
 * }} props
 */
function ProfileStatsSection({ sectionId, rows }) {
  const sectionTone = getProfileSectionTone(sectionId);

  return (
    <section
      className="user-profile-info__stats"
      data-tone={sectionTone}
      aria-label="Статистика профиля"
    >
      {rows.map((row) => {
        const icon = getProfileRowIcon(row.id);

        return (
          <article key={row.id} className="user-profile-info__stat-card">
            <div className="user-profile-info__stat-head">
              {icon ? (
                <span className="user-profile-info__stat-icon" aria-hidden="true">
                  <AppIcon icon={icon} size="sm" strokeWidth={2.1} />
                </span>
              ) : null}
              <p className="user-profile-info__stat-value">{row.value}</p>
            </div>
            <p className="user-profile-info__stat-label">{row.label}</p>
          </article>
        );
      })}
    </section>
  );
}

/**
 * @param {{
 * sectionId: string;
 * title: string | null;
 * rows: { id: string; label: string; value: string }[];
 * }} props
 */
function ProfileDetailsSection({ sectionId, title, rows }) {
  const sectionTone = getProfileSectionTone(sectionId);

  return (
    <section className="user-profile-info__section" data-tone={sectionTone}>
      {title ? <h3 className="user-profile-info__section-title">{title}</h3> : null}
      <dl className="user-profile-info__details">
        {rows.map((row) => {
          const icon = getProfileRowIcon(row.id);
          const isEmpty = row.value === COMMON_UI.EM_DASH;

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
                  isEmpty ? "user-profile-info__detail-value_empty" : "",
                  isBooleanProfileRow(row.id)
                    ? resolveBooleanValueClass(row.value)
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {row.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
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
