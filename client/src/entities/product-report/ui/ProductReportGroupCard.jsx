import { useState } from "react";

import { formatIsoDateTime } from "../../../shared/lib/formatIsoDateTime.js";
import {
  PRODUCT_REPORT_RESOLUTION_DISMISS,
  PRODUCT_REPORT_RESOLUTION_HIDE,
  PRODUCT_REPORT_RESOLUTION_REJECT,
} from "../model/constants.js";
import { useResolveProductReportsMutation } from "../model/useResolveProductReportsMutation.js";
import { PRODUCT_REPORTS_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./ProductReportGroupCard.css";

/**
 * @param {{
 *   group: import('../model/types.js').ProductReportGroup;
 *   onResolved: () => void;
 *   onOpenProduct: (product: import('../../product/model/types.js').ProductFromApi) => void;
 *   onOpenUser: (userId: string) => void;
 *   compact?: boolean;
 * }} props
 */
export function ProductReportGroupCard({
  group,
  onResolved,
  onOpenProduct,
  onOpenUser,
  compact = false,
}) {
  const resolveReportsMutation = useResolveProductReportsMutation();
  const [staffNote, setStaffNote] = useState("");
  const isBusy = resolveReportsMutation.isPending;
  const [error, setError] = useState("");

  const productId = String(group.product._id);
  const sellerId =
    group.product.productSeller != null &&
    typeof group.product.productSeller === "object"
      ? String(group.product.productSeller._id)
      : null;

  const handleResolve = async (resolution) => {
    const note = staffNote.trim();
    if (note.length === 0) {
      setError("Укажите комментарий staff");
      return;
    }

    setError("");
    try {
      await resolveReportsMutation.mutateAsync({
        productId,
        body: {
          resolution,
          staffNote: note,
        },
      });
      onResolved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  return (
    <article
      className={[
        "product-report-group-card",
        compact ? "product-report-group-card--compact" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="product-report-group-card__header">
        <h3 className="product-report-group-card__title">
          {group.product.productName ?? "Товар"}
        </h3>
        <span className="product-report-group-card__count">
          {PRODUCT_REPORTS_PAGE_UI.REPORTS_COUNT_LABEL(group.reportCount)}
        </span>
      </header>
      <div className="product-report-group-card__links">
        <button
          type="button"
          className="product-report-group-card__link"
          onClick={() => onOpenProduct(group.product)}
        >
          {PRODUCT_REPORTS_PAGE_UI.OPEN_PRODUCT}
        </button>
        {sellerId ? (
          <button
            type="button"
            className="product-report-group-card__link"
            onClick={() => onOpenUser(sellerId)}
          >
            {PRODUCT_REPORTS_PAGE_UI.OPEN_SELLER}
          </button>
        ) : null}
      </div>
      <ul className="product-report-group-card__reports" role="list">
        {group.reports.map((report) => {
          const reporterName = report.reporter?.userName?.trim() || report.reporter._id;
          return (
            <li key={report._id} className="product-report-group-card__report">
              <p className="product-report-group-card__report-meta">
                {PRODUCT_REPORTS_PAGE_UI.REPORT_ITEM_META(
                  reporterName,
                  formatIsoDateTime(report.createdAt),
                )}
                <button
                  type="button"
                  className="product-report-group-card__reporter-link"
                  onClick={() => onOpenUser(String(report.reporter._id))}
                >
                  {PRODUCT_REPORTS_PAGE_UI.OPEN_REPORTER}
                </button>
              </p>
              <p className="product-report-group-card__report-text">
                {report.reportText}
              </p>
            </li>
          );
        })}
      </ul>
      <label className="product-report-group-card__staff-label">
        {PRODUCT_REPORTS_PAGE_UI.STAFF_NOTE_LABEL}
        <textarea
          className="product-report-group-card__staff-note"
          value={staffNote}
          onChange={(event) => setStaffNote(event.target.value)}
          placeholder={PRODUCT_REPORTS_PAGE_UI.STAFF_NOTE_PLACEHOLDER}
          rows={2}
          disabled={isBusy}
        />
      </label>
      {error ? (
        <p className="product-report-group-card__error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="product-report-group-card__actions">
        <button
          type="button"
          className="app-btn app-btn--secondary"
          disabled={isBusy}
          onClick={() => void handleResolve(PRODUCT_REPORT_RESOLUTION_DISMISS)}
        >
          {isBusy
            ? PRODUCT_REPORTS_PAGE_UI.ACTION_PENDING
            : PRODUCT_REPORTS_PAGE_UI.ACTION_DISMISS}
        </button>
        <button
          type="button"
          className="app-btn app-btn--outline"
          disabled={isBusy}
          onClick={() => void handleResolve(PRODUCT_REPORT_RESOLUTION_HIDE)}
        >
          {PRODUCT_REPORTS_PAGE_UI.ACTION_HIDE}
        </button>
        <button
          type="button"
          className="app-btn app-btn--danger"
          disabled={isBusy}
          onClick={() => void handleResolve(PRODUCT_REPORT_RESOLUTION_REJECT)}
        >
          {PRODUCT_REPORTS_PAGE_UI.ACTION_REJECT}
        </button>
      </div>
    </article>
  );
}
