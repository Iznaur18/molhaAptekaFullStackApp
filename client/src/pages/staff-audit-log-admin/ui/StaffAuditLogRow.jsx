import { STAFF_AUDIT_LOG_ADMIN_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import {
  formatStaffAuditActor,
  formatStaffAuditTime,
  staffAuditStatusTone,
} from "../lib/formatStaffAuditEntry.js";

const UI = STAFF_AUDIT_LOG_ADMIN_PAGE_UI;

const hasContent = (value) =>
  value != null && (typeof value !== "object" || Object.keys(value).length > 0);

/**
 * @param {{
 *   entry: import('../../../entities/staff-audit-log/model/types.js').StaffAuditLogEntry;
 *   onFilterActor: (actorUserId: string) => void;
 * }} props
 */
export function StaffAuditLogRow({ entry, onFilterActor }) {
  const tone = staffAuditStatusTone(entry.statusCode);

  return (
    <li className="staff-audit-row">
      <div className="staff-audit-row__main">
        <time className="staff-audit-row__time">
          {formatStaffAuditTime(entry.createdAt)}
        </time>
        <button
          type="button"
          className="staff-audit-row__actor"
          onClick={() => onFilterActor(entry.actorUserId)}
          title={UI.FILTER_BY_ACTOR}
        >
          <span className="staff-audit-row__actor-name">
            {formatStaffAuditActor(entry.actor)}
          </span>
          <span className="staff-audit-row__actor-role">{entry.actorRole}</span>
        </button>
        <span className="staff-audit-row__action">
          <span className="staff-audit-row__method">{entry.method}</span>
          {entry.action}
        </span>
        <span
          className={`staff-audit-row__status staff-audit-row__status--${tone}`}
        >
          {entry.statusCode}
        </span>
      </div>

      <details className="staff-audit-row__details">
        <summary className="staff-audit-row__details-summary">{UI.DETAILS}</summary>
        <dl className="staff-audit-row__details-body">
          <dt>{UI.DETAILS_PATH}</dt>
          <dd>
            <code>{entry.path}</code>
          </dd>
          {hasContent(entry.params) ? (
            <>
              <dt>{UI.DETAILS_PARAMS}</dt>
              <dd>
                <pre>{JSON.stringify(entry.params, null, 2)}</pre>
              </dd>
            </>
          ) : null}
          {hasContent(entry.requestBody) ? (
            <>
              <dt>{UI.DETAILS_BODY}</dt>
              <dd>
                <pre>{JSON.stringify(entry.requestBody, null, 2)}</pre>
              </dd>
            </>
          ) : null}
          {entry.requestId ? (
            <>
              <dt>{UI.DETAILS_REQUEST_ID}</dt>
              <dd>
                <code>{entry.requestId}</code>
              </dd>
            </>
          ) : null}
        </dl>
      </details>
    </li>
  );
}
