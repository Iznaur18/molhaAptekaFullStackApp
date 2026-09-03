import { useQuery } from "@tanstack/react-query";

import { fetchOneCImportJobs } from "../../../entities/onec/api/onecApi.js";
import { ONEC_INTEGRATION_PAGE_UI as UI } from "../model/onecIntegrationCopy.js";

/**
 * Сводка по одному разобранному пакету — короткая строка вместо сырого JSON.
 *
 * @param {Record<string, any> | null} stats
 */
function summarize(stats) {
  if (!stats) return "";
  const parts = [];
  const catalog = stats.catalog;
  if (catalog) {
    parts.push(`${UI.IMPORT_CREATED}: ${catalog.created ?? 0}`);
    parts.push(`${UI.IMPORT_UPDATED}: ${catalog.updated ?? 0}`);
    if (catalog.uncategorized > 0) {
      parts.push(`${UI.IMPORT_UNCATEGORIZED}: ${catalog.uncategorized}`);
    }
    if (catalog.imagesUploaded > 0) {
      parts.push(`${UI.IMPORT_IMAGES}: ${catalog.imagesUploaded}`);
    }
    if (catalog.held > 0) {
      parts.push(`${UI.IMPORT_HELD}: ${catalog.held}`);
    }
  }
  if (stats.offers) {
    const rows = Object.values(stats.offers);
    const sum = (key) => rows.reduce((acc, row) => acc + (row?.[key] ?? 0), 0);
    parts.push(`цены и остатки: ${sum("matched")}`);
    if (sum("restored") > 0) {
      parts.push(`${UI.IMPORT_RESTORED}: ${sum("restored")}`);
    }
    if (sum("held") > 0) {
      parts.push(`${UI.IMPORT_HELD}: ${sum("held")}`);
    }
  }
  if (stats.deactivated > 0) {
    parts.push(`${UI.IMPORT_DEACTIVATED}: ${stats.deactivated}`);
  }
  return parts.join(" · ");
}

/**
 * Журнал приёмки CommerceML: что 1С прислала и чем это закончилось.
 * Обновляется сам, пока есть незавершённые пакеты.
 */
export function OneCImportJobsList() {
  const jobsQuery = useQuery({
    queryKey: ["onec", "import-jobs"],
    queryFn: () => fetchOneCImportJobs({ limit: 20 }),
    refetchInterval: (query) => {
      const jobs = query.state.data ?? [];
      const busy = jobs.some(
        (job) => job.status === "pending" || job.status === "processing",
      );
      return busy ? 3000 : false;
    },
  });

  if (jobsQuery.isLoading) {
    return <p className="onec-page__state">{UI.LOADING}</p>;
  }

  const jobs = jobsQuery.data ?? [];
  if (jobs.length === 0) {
    return <p className="onec-page__state">{UI.IMPORTS_EMPTY}</p>;
  }

  return (
    <ul className="onec-page__log-list">
      {jobs.map((job) => (
        <li key={job.id} className="onec-page__log-item onec-page__log-item_block">
          <div className="onec-page__log-head">
            <span
              className={
                job.status === "completed"
                  ? "onec-page__log-badge onec-page__log-badge_ok"
                  : job.status === "failed"
                    ? "onec-page__log-badge onec-page__log-badge_err"
                    : "onec-page__log-badge"
              }
            >
              {UI.IMPORT_STATUS[job.status] ?? job.status}
            </span>
            <span className="onec-page__log-dir">{job.filename}</span>
            <time dateTime={job.createdAt}>
              {job.createdAt
                ? new Date(job.createdAt).toLocaleString("ru-RU")
                : ""}
            </time>
          </div>

          {job.errorMessage ? (
            <p className="onec-page__error">{job.errorMessage}</p>
          ) : (
            <p className="onec-page__log-msg">{summarize(job.stats)}</p>
          )}

          {job.issues?.length ? (
            <details className="onec-page__issues">
              <summary>
                {UI.IMPORT_ISSUES}: {job.issues.length}
              </summary>
              <ul>
                {job.issues.map((issue, index) => (
                  <li key={`${job.id}-${index}`}>
                    {issue.name || issue.externalId
                      ? `${issue.name || issue.externalId}: `
                      : ""}
                    {issue.message}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
