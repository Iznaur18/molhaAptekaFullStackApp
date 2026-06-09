import { useCallback, useEffect, useState } from "react";

import { INSTALLMENT_CONTRACT_STATUS_FILTER_OPTIONS } from "../../../entities/installment/lib/installmentContractStatusFilters.js";
import { useMyInstallmentSalesQuery } from "../../../entities/installment/model/useMyInstallmentSalesQuery.js";
import { InstallmentContractCard } from "../../../entities/installment/ui/InstallmentContractCard.jsx";
import { InstallmentPageLayout } from "../../../entities/installment/ui/InstallmentPageLayout.jsx";
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
  const salesQuery = useMyInstallmentSalesQuery({
    status: statusFilter,
    enabled: isAuthorized,
  });

  const contracts = salesQuery.data ?? [];
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

  if (!isAuthorized) {
    return null;
  }

  if (phase === "loading") {
    return (
      <InstallmentPageLayout
        title={INSTALLMENT_UI.SALES_PAGE_TITLE}
        countLabel={INSTALLMENT_UI.COUNT_CONTRACTS(0)}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={INSTALLMENT_CONTRACT_STATUS_FILTER_OPTIONS}
        statusFilterAriaLabel={INSTALLMENT_UI.CONTRACT_STATUS_FILTER_LABEL}
      >
        <p className="installment-page__state">{INSTALLMENT_UI.SALES_PAGE_LOADING}</p>
      </InstallmentPageLayout>
    );
  }

  if (phase === "error") {
    return (
      <InstallmentPageLayout
        title={INSTALLMENT_UI.SALES_PAGE_TITLE}
        countLabel={INSTALLMENT_UI.COUNT_CONTRACTS(0)}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={INSTALLMENT_CONTRACT_STATUS_FILTER_OPTIONS}
        statusFilterAriaLabel={INSTALLMENT_UI.CONTRACT_STATUS_FILTER_LABEL}
      >
        <p className="installment-page__state installment-page__state_error" role="alert">
          {error}
        </p>
      </InstallmentPageLayout>
    );
  }

  const emptyMessage = statusFilter
    ? INSTALLMENT_UI.SALES_PAGE_EMPTY_BY_FILTER
    : INSTALLMENT_UI.SALES_PAGE_EMPTY;

  return (
    <InstallmentPageLayout
      title={INSTALLMENT_UI.SALES_PAGE_TITLE}
      countLabel={INSTALLMENT_UI.COUNT_CONTRACTS(contracts.length)}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      statusOptions={INSTALLMENT_CONTRACT_STATUS_FILTER_OPTIONS}
      statusFilterAriaLabel={INSTALLMENT_UI.CONTRACT_STATUS_FILTER_LABEL}
    >
      {contracts.length === 0 ? (
        <p className="installment-page__state">{emptyMessage}</p>
      ) : (
        <ul className="installment-page__list" role="list">
          {contracts.map((contract) => (
            <li key={contract._id} role="listitem">
              <InstallmentContractCard
                compact
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
          ))}
        </ul>
      )}
    </InstallmentPageLayout>
  );
}
