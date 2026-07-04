import { useCallback, useEffect, useMemo, useState } from "react";

import { contractNeedsSellerAttention } from "../../../entities/installment/lib/contractNeedsSellerAttention.js";
import { filterInstallmentSellerContracts } from "../../../entities/installment/lib/filterInstallmentSellerContracts.js";
import { summarizeInstallmentSellerContracts } from "../../../entities/installment/lib/summarizeInstallmentSellerContracts.js";
import { INSTALLMENT_CONTRACT_STATUS_FILTER_OPTIONS } from "../../../entities/installment/lib/installmentContractStatusFilters.js";
import { INSTALLMENT_SALES_LIST_FILTER_IN_PROGRESS } from "../../../entities/installment/model/constants.js";
import { useMyInstallmentSalesQuery } from "../../../entities/installment/model/useMyInstallmentSalesQuery.js";
import { InstallmentContractCard } from "../../../entities/installment/ui/InstallmentContractCard.jsx";
import { InstallmentPageLayout } from "../../../entities/installment/ui/InstallmentPageLayout.jsx";
import { InstallmentPaymentsOverview } from "../../../entities/installment/ui/InstallmentPaymentsOverview.jsx";
import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";
import { useRefetchOnVisible } from "../../../shared/lib/useRefetchOnVisible.js";

/**
 * @param {{
 *   isAuthorized?: boolean;
 *   onRequestLogin?: () => void;
 *   onCounterpartyClick?: (userId: string) => void;
 *   onProductClick?: (productId: string) => void;
 *   onQueueChanged?: () => void;
 * }} props
 */
export function InstallmentSalesPage({
  isAuthorized = false,
  onRequestLogin,
  onCounterpartyClick,
  onProductClick,
  onQueueChanged,
}) {
  const [statusFilter, setStatusFilter] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const salesQuery = useMyInstallmentSalesQuery({
    enabled: isAuthorized,
  });

  const allContracts = salesQuery.data ?? [];
  const summary = useMemo(
    () => summarizeInstallmentSellerContracts(allContracts),
    [allContracts],
  );
  const contracts = useMemo(
    () => filterInstallmentSellerContracts(allContracts, { status: statusFilter, attentionOnly }),
    [allContracts, statusFilter, attentionOnly],
  );

  const hasFilters = Boolean(statusFilter) || attentionOnly;
  const countLabel = hasFilters
    ? INSTALLMENT_UI.COUNT_FILTERED(contracts.length, allContracts.length)
    : INSTALLMENT_UI.COUNT_CONTRACTS(allContracts.length);

  const phase = !isAuthorized
    ? "success"
    : salesQuery.isPending
      ? "loading"
      : salesQuery.isError
        ? "error"
        : "success";
  const error =
    salesQuery.error instanceof Error
      ? salesQuery.error.message
      : INSTALLMENT_UI.ERROR_GENERIC;

  const reload = useCallback(async () => {
    await salesQuery.refetch();
  }, [salesQuery]);

  useRefetchOnVisible(reload, phase === "success" && isAuthorized);

  useEffect(() => {
    if (!isAuthorized) {
      onRequestLogin?.();
    }
  }, [isAuthorized, onRequestLogin]);

  useEffect(() => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      for (const contract of allContracts) {
        if (contractNeedsSellerAttention(contract)) {
          next.add(String(contract._id));
        }
      }
      return next;
    });
  }, [allContracts]);

  const toggleExpanded = useCallback((contractId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(contractId)) {
        next.delete(contractId);
      } else {
        next.add(contractId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(new Set(contracts.map((contract) => String(contract._id))));
  }, [contracts]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const handleActiveFilterClick = useCallback(() => {
    setStatusFilter(INSTALLMENT_SALES_LIST_FILTER_IN_PROGRESS);
    setAttentionOnly(false);
  }, []);

  if (!isAuthorized) {
    return null;
  }

  const layoutProps = {
    title: INSTALLMENT_UI.SALES_PAGE_TITLE,
    countLabel,
    statusFilter,
    onStatusFilterChange: (value) => {
      setStatusFilter(value);
      if (value) {
        setAttentionOnly(false);
      }
    },
    statusOptions: INSTALLMENT_CONTRACT_STATUS_FILTER_OPTIONS,
    statusFilterAriaLabel: INSTALLMENT_UI.CONTRACT_STATUS_FILTER_LABEL,
    onRefresh: () => {
      void reload();
    },
    isRefreshing: salesQuery.isFetching,
  };

  const overview = (
    <InstallmentPaymentsOverview
      activeCount={summary.activeCount}
      attentionCount={summary.attentionCount}
      totalRemainingRub={summary.totalRemainingRub}
      attentionOnly={attentionOnly}
      onAttentionFilterChange={setAttentionOnly}
      onActiveFilterClick={handleActiveFilterClick}
      remainingLabel={INSTALLMENT_UI.SALES_OVERVIEW_REMAINING}
      regionAriaLabel={INSTALLMENT_UI.SALES_PAGE_TITLE}
    />
  );

  const listActions =
    contracts.length > 0 ? (
      <div className="installment-page__list-actions">
        <button type="button" className="installment-page__list-action" onClick={expandAll}>
          {INSTALLMENT_UI.PAYMENTS_EXPAND_ALL}
        </button>
        <button type="button" className="installment-page__list-action" onClick={collapseAll}>
          {INSTALLMENT_UI.PAYMENTS_COLLAPSE_ALL}
        </button>
        {attentionOnly ? (
          <p className="installment-page__filter-hint">{INSTALLMENT_UI.SALES_ATTENTION_FILTER_HINT}</p>
        ) : null}
      </div>
    ) : null;

  if (phase === "loading") {
    return (
      <InstallmentPageLayout {...layoutProps}>
        {overview}
        <p className="installment-page__state">{INSTALLMENT_UI.SALES_PAGE_LOADING}</p>
      </InstallmentPageLayout>
    );
  }

  if (phase === "error") {
    return (
      <InstallmentPageLayout {...layoutProps}>
        {overview}
        <p className="installment-page__state installment-page__state_error" role="alert">
          {error}
        </p>
      </InstallmentPageLayout>
    );
  }

  const emptyMessage = hasFilters
    ? INSTALLMENT_UI.SALES_PAGE_EMPTY_BY_FILTER
    : INSTALLMENT_UI.SALES_PAGE_EMPTY;

  return (
    <InstallmentPageLayout {...layoutProps}>
      {overview}
      {listActions}
      {contracts.length === 0 ? (
        <p className="installment-page__state">{emptyMessage}</p>
      ) : (
        <ul className="installment-page__list" role="list">
          {contracts.map((contract) => {
            const contractId = String(contract._id);
            return (
              <li key={contractId} role="listitem">
                <InstallmentContractCard
                  compact
                  collapsible
                  expanded={expandedIds.has(contractId)}
                  onExpandedChange={() => toggleExpanded(contractId)}
                  contract={contract}
                  role="seller"
                  onCounterpartyClick={onCounterpartyClick}
                  onProductClick={onProductClick}
                  onUpdated={() => {
                    void reload();
                    onQueueChanged?.();
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}
    </InstallmentPageLayout>
  );
}
