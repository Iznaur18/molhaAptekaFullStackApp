import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ADMIN_ANALYTICS_PERIOD_7D,
  ADMIN_ANALYTICS_PERIOD_30D,
  ADMIN_ANALYTICS_PERIOD_ALL,
  ADMIN_ANALYTICS_PERIOD_TODAY,
} from "@molha/api-contract";

import {
  fetchAdminAnalyticsExport,
  runAdminAnalyticsReconciliation,
} from "../../../entities/admin-analytics/api/adminAnalyticsApi.js";
import { downloadAnalyticsCsvFile } from "../../../entities/admin-analytics/lib/downloadAnalyticsCsvFile.js";
import { adminAnalyticsQueryKeys } from "../../../entities/admin-analytics/model/adminAnalyticsQueryKeys.js";
import { useAdminAnalyticsOverviewQuery } from "../../../entities/admin-analytics/model/useAdminAnalyticsOverviewQuery.js";
import { ADMIN_ANALYTICS_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { getPlausibleSharedDashboardUrl } from "../../../shared/lib/plausibleEnv.js";

import "./AdminAnalyticsPage.css";

const UI = ADMIN_ANALYTICS_PAGE_UI;
const PLAUSIBLE_SHARED_URL = getPlausibleSharedDashboardUrl();

const PERIOD_OPTIONS = [
  { value: ADMIN_ANALYTICS_PERIOD_TODAY, label: UI.PERIOD_TODAY },
  { value: ADMIN_ANALYTICS_PERIOD_7D, label: UI.PERIOD_7D },
  { value: ADMIN_ANALYTICS_PERIOD_30D, label: UI.PERIOD_30D },
  { value: ADMIN_ANALYTICS_PERIOD_ALL, label: UI.PERIOD_ALL },
];

export function AdminAnalyticsPage() {
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState(ADMIN_ANALYTICS_PERIOD_7D);
  const [exportHash, setExportHash] = useState("");
  const [exportError, setExportError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileError, setReconcileError] = useState("");

  const query = useAdminAnalyticsOverviewQuery(period);
  const data = query.data;
  const metrics = data?.metrics;
  const reconciliation = data?.reconciliation;

  const isRefreshing = query.isFetching && !query.isPending;
  const errorMessage =
    query.isError && query.error instanceof Error ? query.error.message : "";

  const handleExport = async () => {
    setExportError("");
    setIsExporting(true);
    try {
      const payload = await fetchAdminAnalyticsExport({ period });
      downloadAnalyticsCsvFile(payload);
      setExportHash(payload.sha256);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : UI.EXPORT_ERROR);
    } finally {
      setIsExporting(false);
    }
  };

  const handleReconcile = async () => {
    setReconcileError("");
    setIsReconciling(true);
    try {
      await runAdminAnalyticsReconciliation();
      await queryClient.invalidateQueries({
        queryKey: adminAnalyticsQueryKeys.all,
      });
    } catch (error) {
      setReconcileError(
        error instanceof Error ? error.message : UI.RECONCILE_ERROR,
      );
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <section className="admin-analytics-page">
      <header className="admin-analytics-page__header">
        <h2 className="admin-analytics-page__title">{UI.TITLE}</h2>
        <p className="admin-analytics-page__hint">{UI.HINT}</p>
        {PLAUSIBLE_SHARED_URL ? (
          <p className="admin-analytics-page__meta">
            <a href={PLAUSIBLE_SHARED_URL} target="_blank" rel="noreferrer">
              {UI.PLAUSIBLE_OPEN}
            </a>
          </p>
        ) : (
          <p className="admin-analytics-page__meta">{UI.PLAUSIBLE_HINT}</p>
        )}
      </header>

      <div className="admin-analytics-page__toolbar">
        <div className="admin-analytics-page__period-chips" role="group">
          {PERIOD_OPTIONS.map((option) => {
            const isActive = option.value === period;
            return (
              <button
                key={option.value}
                type="button"
                className={[
                  "admin-analytics-page__period-chip",
                  isActive ? "admin-analytics-page__period-chip_active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={isActive}
                onClick={() => setPeriod(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="app-btn app-btn--secondary"
          onClick={() => void query.refetch()}
          disabled={query.isPending || isRefreshing}
        >
          {UI.REFRESH}
        </button>
        <button
          type="button"
          className="app-btn app-btn--primary"
          onClick={() => void handleExport()}
          disabled={isExporting || query.isPending}
        >
          {isExporting ? UI.EXPORT_LOADING : UI.EXPORT}
        </button>
        <button
          type="button"
          className="app-btn app-btn--secondary"
          onClick={() => void handleReconcile()}
          disabled={isReconciling}
        >
          {isReconciling ? UI.RECONCILE_LOADING : UI.RECONCILE}
        </button>
      </div>

      {data ? (
        <p className="admin-analytics-page__meta">
          {UI.META(data.asOf, data.definitionsVersion, data.period.key)}
        </p>
      ) : null}

      {query.isPending ? (
        <p className="admin-analytics-page__state">{UI.LOADING}</p>
      ) : null}

      {errorMessage ? (
        <p className="admin-analytics-page__state admin-analytics-page__state_error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {exportError ? (
        <p className="admin-analytics-page__state admin-analytics-page__state_error" role="alert">
          {exportError}
        </p>
      ) : null}

      {reconcileError ? (
        <p className="admin-analytics-page__state admin-analytics-page__state_error" role="alert">
          {reconcileError}
        </p>
      ) : null}

      {metrics ? (
        <div className="admin-analytics-page__grid">
          <MetricTile label={UI.METRIC_NEW_USERS} value={metrics.newUsers} />
          <MetricTile
            label={UI.METRIC_PUBLICATIONS}
            value={metrics.publicationsCreated}
          />
          <MetricTile label={UI.METRIC_ORDERS} value={metrics.ordersCreated} />
          <MetricTile label={UI.METRIC_SOLD_UNITS} value={metrics.soldUnits} />
          <MetricTile label={UI.METRIC_GMV} value={formatRub(metrics.gmvRub)} />
          <MetricTile
            label={UI.METRIC_VIEWS}
            value={metrics.productViewsUnique}
          />
        </div>
      ) : null}

      <IntegrityPanel reconciliation={reconciliation} />

      {exportHash ? (
        <p className="admin-analytics-page__export-hash">
          {UI.EXPORT_SHA256(exportHash)}
        </p>
      ) : null}
    </section>
  );
}

/**
 * @param {{ label: string; value: string | number }} props
 */
function MetricTile({ label, value }) {
  return (
    <div className="admin-analytics-page__metric">
      <span className="admin-analytics-page__metric-label">{label}</span>
      <span className="admin-analytics-page__metric-value">{value}</span>
    </div>
  );
}

/**
 * @param {{ reconciliation: object | null | undefined }} props
 */
function IntegrityPanel({ reconciliation }) {
  if (!reconciliation) {
    return (
      <div className="admin-analytics-page__integrity">
        <h3 className="admin-analytics-page__integrity-title">{UI.INTEGRITY_TITLE}</h3>
        <p className="admin-analytics-page__integrity-body">{UI.INTEGRITY_EMPTY}</p>
      </div>
    );
  }

  const ok = reconciliation.ok === true;
  return (
    <div
      className={[
        "admin-analytics-page__integrity",
        ok
          ? "admin-analytics-page__integrity_ok"
          : "admin-analytics-page__integrity_bad",
      ].join(" ")}
    >
      <h3 className="admin-analytics-page__integrity-title">
        {ok ? UI.INTEGRITY_OK : UI.INTEGRITY_BAD}
      </h3>
      <p className="admin-analytics-page__integrity-body">
        {UI.INTEGRITY_DETAIL(reconciliation)}
      </p>
    </div>
  );
}

/** @param {number} value */
function formatRub(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}
