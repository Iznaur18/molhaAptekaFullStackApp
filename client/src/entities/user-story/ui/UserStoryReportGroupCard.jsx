import { useState } from "react";

import { formatIsoDateTime } from "../../../shared/lib/formatIsoDateTime.js";
import {
  PRODUCT_REPORTS_PAGE_UI,
  USER_STORY_UI,
} from "../../../shared/config/appUiCopy.js";
import { useResolveUserStoryReportsMutation } from "../model/useResolveUserStoryReportsMutation.js";
import { resolveUserStoryMediaUrl } from "../lib/resolveUserStoryMedia.js";
import {
  USER_STORY_MEDIA_TYPE_VIDEO,
  USER_STORY_REPORT_RESOLUTION_DISMISS,
  USER_STORY_REPORT_RESOLUTION_HIDE,
} from "../model/constants.js";

import "./UserStoryReportGroupCard.css";

/**
 * @param {{
 *   group: import('../model/types.js').UserStoryReportGroup;
 *   onResolved: () => void;
 *   onOpenUser: (userId: string) => void;
 *   compact?: boolean;
 * }} props
 */
export function UserStoryReportGroupCard({
  group,
  onResolved,
  onOpenUser,
  compact = false,
}) {
  const resolveReportsMutation = useResolveUserStoryReportsMutation();
  const [staffNote, setStaffNote] = useState("");
  const isBusy = resolveReportsMutation.isPending;
  const [error, setError] = useState("");

  const storyId = String(group.story._id);
  const authorId = String(group.author._id);

  const handleResolve = async (resolution) => {
    const note = staffNote.trim();
    if (note.length === 0) {
      setError("Укажите комментарий staff");
      return;
    }

    setError("");
    try {
      await resolveReportsMutation.mutateAsync({
        storyId,
        body: {
          resolution,
          staffNote: note,
        },
      });
      onResolved();
    } catch (e) {
      setError(e instanceof Error ? e.message : USER_STORY_UI.ERROR_GENERIC);
    }
  };

  const mediaUrl = resolveUserStoryMediaUrl(group.story.mediaUrl);

  return (
    <article
      className={[
        "user-story-report-group-card",
        compact ? "user-story-report-group-card--compact" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="user-story-report-group-card__header">
        <h3 className="user-story-report-group-card__title">Сторис</h3>
        <span className="user-story-report-group-card__count">
          {USER_STORY_UI.STORY_REPORTS_COUNT_LABEL(group.reportCount)}
        </span>
      </header>

      <div className="user-story-report-group-card__preview">
        {group.story.mediaType === USER_STORY_MEDIA_TYPE_VIDEO ? (
          <video
            className="user-story-report-group-card__media"
            src={mediaUrl}
            playsInline
          />
        ) : (
          <img className="user-story-report-group-card__media" src={mediaUrl} alt="" />
        )}
        {group.story.captionText ? (
          <p className="user-story-report-group-card__caption">
            {group.story.captionText}
          </p>
        ) : null}
      </div>

      <div className="user-story-report-group-card__links">
        <button
          type="button"
          className="user-story-report-group-card__link"
          onClick={() => onOpenUser(authorId)}
        >
          {USER_STORY_UI.STORY_REPORTS_OPEN_AUTHOR}
        </button>
      </div>

      <ul className="user-story-report-group-card__reports" role="list">
        {group.reports.map((report) => {
          const reporterName = report.reporter?.userName?.trim() || report.reporter._id;
          return (
            <li key={report._id} className="user-story-report-group-card__report">
              <p className="user-story-report-group-card__report-meta">
                {PRODUCT_REPORTS_PAGE_UI.REPORT_ITEM_META(
                  reporterName,
                  formatIsoDateTime(report.createdAt),
                )}
                <button
                  type="button"
                  className="user-story-report-group-card__reporter-link"
                  onClick={() => onOpenUser(String(report.reporter._id))}
                >
                  {PRODUCT_REPORTS_PAGE_UI.OPEN_REPORTER}
                </button>
              </p>
              <p className="user-story-report-group-card__report-text">
                {report.reportText}
              </p>
            </li>
          );
        })}
      </ul>

      <label className="user-story-report-group-card__staff-label">
        {USER_STORY_UI.STORY_REPORTS_STAFF_NOTE_LABEL}
        <textarea
          className="user-story-report-group-card__staff-note"
          value={staffNote}
          onChange={(event) => setStaffNote(event.target.value)}
          placeholder={USER_STORY_UI.STORY_REPORTS_STAFF_NOTE_PLACEHOLDER}
          rows={2}
          disabled={isBusy}
        />
      </label>

      {error ? (
        <p className="user-story-report-group-card__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="user-story-report-group-card__actions">
        <button
          type="button"
          className="user-story-report-group-card__action user-story-report-group-card__action_dismiss"
          disabled={isBusy}
          onClick={() => void handleResolve(USER_STORY_REPORT_RESOLUTION_DISMISS)}
        >
          {isBusy
            ? USER_STORY_UI.STORY_REPORTS_ACTION_PENDING
            : USER_STORY_UI.STORY_REPORTS_ACTION_DISMISS}
        </button>
        <button
          type="button"
          className="user-story-report-group-card__action user-story-report-group-card__action_hide"
          disabled={isBusy}
          onClick={() => void handleResolve(USER_STORY_REPORT_RESOLUTION_HIDE)}
        >
          {USER_STORY_UI.STORY_REPORTS_ACTION_HIDE}
        </button>
      </div>
    </article>
  );
}
