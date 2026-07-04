import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";

import "./InstallmentPageLayout.css";

/**
 * @param {{
 *   title: string;
 *   countLabel: string;
 *   statusFilter?: string;
 *   onStatusFilterChange?: (value: string) => void;
 *   statusOptions?: Array<{ value: string; label: string }>;
 *   statusFilterAriaLabel?: string;
 *   onRefresh?: () => void;
 *   isRefreshing?: boolean;
 *   children: import("react").ReactNode;
 * }} props
 */
export function InstallmentPageLayout({
  title,
  countLabel,
  statusFilter = "",
  onStatusFilterChange,
  statusOptions = [],
  statusFilterAriaLabel = "",
  onRefresh,
  isRefreshing = false,
  children,
}) {
  const hasStatusFilters =
    statusOptions.length > 0 && typeof onStatusFilterChange === "function";

  return (
    <div className="installment-page">
      <div className="installment-page__toolbar">
        <div className="installment-page__toolbar-head">
          <h3 className="installment-page__heading">{title}</h3>
          <div className="installment-page__toolbar-meta">
            <span className="installment-page__count">{countLabel}</span>
            {typeof onRefresh === "function" ? (
              <button
                type="button"
                className="installment-page__refresh"
                onClick={onRefresh}
                disabled={isRefreshing}
                aria-busy={isRefreshing}
              >
                {INSTALLMENT_UI.PAYMENTS_REFRESH}
              </button>
            ) : null}
          </div>
        </div>

        {hasStatusFilters ? (
          <div
            className="installment-page__chips"
            role="group"
            aria-label={statusFilterAriaLabel}
          >
            {statusOptions.map((option) => {
              const isActive = statusFilter === option.value;

              return (
                <button
                  key={option.value || "all"}
                  type="button"
                  className={[
                    "installment-page__chip",
                    isActive ? "installment-page__chip_active" : "",
                    option.value ? `installment-page__chip_${option.value}` : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={isActive}
                  onClick={() => onStatusFilterChange(option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {children}
    </div>
  );
}
