import { useCallback, useEffect, useState } from "react";

import { useMyInstallmentContractsQuery } from "../../../entities/installment/model/useMyInstallmentContractsQuery.js";
import { INSTALLMENT_CONTRACT_STATUS_FILTER_OPTIONS } from "../../../entities/installment/lib/installmentContractStatusFilters.js";
import { InstallmentContractCard } from "../../../entities/installment/ui/InstallmentContractCard.jsx";
import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";
import { useRefetchOnVisible } from "../../../shared/lib/useRefetchOnVisible.js";
import {
  ListPageFilter,
  ListPageFilterBar,
  ListPageFilterSelect,
} from "../../../shared/ui/ListPageFilterBar/ListPageFilterBar.jsx";

import "./InstallmentPaymentsPage.css";

/**
 * @param {{
 *   isAuthorized?: boolean;
 *   onRequestLogin?: () => void;
 *   onCounterpartyClick?: (userId: string) => void;
 *   onProductClick?: (productId: string) => void;
 *   onQueueChanged?: () => void;
 * }} props
 */
export function InstallmentPaymentsPage({
  isAuthorized = false,
  onRequestLogin,
  onCounterpartyClick,
  onProductClick,
  onQueueChanged,
}) {
  const [statusFilter, setStatusFilter] = useState("");
  const contractsQuery = useMyInstallmentContractsQuery({
    status: statusFilter,
    enabled: isAuthorized,
  });

  const contracts = contractsQuery.data ?? [];
  const phase = !isAuthorized
    ? "success"
    : contractsQuery.isPending
      ? "loading"
      : contractsQuery.isError
        ? "error"
        : "success";
  const error =
    contractsQuery.error instanceof Error
      ? contractsQuery.error.message
      : INSTALLMENT_UI.ERROR_GENERIC;

  const reload = useCallback(async () => {
    await contractsQuery.refetch();
  }, [contractsQuery]);

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
      <p className="installment-list-page__state">
        {INSTALLMENT_UI.PAYMENTS_PAGE_LOADING}
      </p>
    );
  }

  if (phase === "error") {
    return (
      <p
        className="installment-list-page__state installment-list-page__state_error"
        role="alert"
      >
        {error}
      </p>
    );
  }

  const emptyMessage = statusFilter
    ? INSTALLMENT_UI.PAYMENTS_PAGE_EMPTY_BY_FILTER
    : INSTALLMENT_UI.PAYMENTS_PAGE_EMPTY;

  return (
    <div className="installment-list-page">
      <ListPageFilterBar className="installment-list-page__filters">
        <ListPageFilter label={INSTALLMENT_UI.CONTRACT_STATUS_FILTER_LABEL}>
          <ListPageFilterSelect
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {INSTALLMENT_CONTRACT_STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </ListPageFilterSelect>
        </ListPageFilter>
      </ListPageFilterBar>

      {contracts.length === 0 ? (
        <p className="installment-list-page__state">{emptyMessage}</p>
      ) : (
        <ul className="installment-list-page__list" role="list">
          {contracts.map((contract) => (
            <li key={contract._id} role="listitem">
              <InstallmentContractCard
                contract={contract}
                role="buyer"
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
    </div>
  );
}
