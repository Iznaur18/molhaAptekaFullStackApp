import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useInstallmentMutations } from "../../../entities/installment/model/useInstallmentMutations.js";
import { installmentQueryKeys } from "../../../entities/installment/model/installmentQueryKeys.js";
import { usePendingInstallmentModerationQuery } from "../../../entities/installment/model/usePendingInstallmentModerationQuery.js";
import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";

import "./InstallmentModerationPage.css";

/**
 * @typedef {import('../../../entities/installment/model/types.js').InstallmentProgramFromApi & { productName?: string | null }} PendingInstallmentProgram
 */

/**
 * @param {{ onQueueChanged?: () => void }} props
 */
export function InstallmentModerationPage({ onQueueChanged }) {
  const queryClient = useQueryClient();
  const { approveModerationMutation, rejectModerationMutation } = useInstallmentMutations();
  const queueQuery = usePendingInstallmentModerationQuery();
  const [actionError, setActionError] = useState("");
  const [pendingProductId, setPendingProductId] = useState(null);
  const [rejectComments, setRejectComments] = useState(
    /** @type {Record<string, string>} */ ({}),
  );

  const programs = queueQuery.data?.programs ?? [];
  const phase = queueQuery.isPending
    ? "loading"
    : queueQuery.isError && programs.length === 0
      ? "error"
      : "success";
  const error =
    queueQuery.error instanceof Error
      ? queueQuery.error.message
      : INSTALLMENT_UI.ERROR_GENERIC;

  const removeFromQueue = (productId) => {
    queryClient.setQueryData(installmentQueryKeys.moderationPending(), (old) => {
      if (!old?.programs) {
        return old;
      }
      return {
        ...old,
        programs: old.programs.filter((row) => String(row.productId) !== productId),
      };
    });
  };

  const handleApprove = async (productId) => {
    try {
      setPendingProductId(productId);
      setActionError("");
      await approveModerationMutation.mutateAsync(productId);
      removeFromQueue(productId);
      onQueueChanged?.();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : INSTALLMENT_UI.ERROR_GENERIC);
    } finally {
      setPendingProductId(null);
    }
  };

  const handleReject = async (productId) => {
    try {
      setPendingProductId(productId);
      setActionError("");
      await rejectModerationMutation.mutateAsync({
        productId,
        comment: rejectComments[productId] ?? "",
      });
      removeFromQueue(productId);
      onQueueChanged?.();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : INSTALLMENT_UI.ERROR_GENERIC);
    } finally {
      setPendingProductId(null);
    }
  };

  if (phase === "loading") {
    return (
      <p className="installment-moderation-page__state">
        {INSTALLMENT_UI.MODERATION_PAGE_LOADING}
      </p>
    );
  }

  if (phase === "error" && programs.length === 0) {
    return (
      <p
        className="installment-moderation-page__state installment-moderation-page__state_error"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (programs.length === 0) {
    return (
      <p className="installment-moderation-page__state">
        {INSTALLMENT_UI.MODERATION_PAGE_EMPTY}
      </p>
    );
  }

  return (
    <div className="installment-moderation-page">
      {actionError ? (
        <p
          className="installment-moderation-page__state installment-moderation-page__state_error"
          role="alert"
        >
          {actionError}
        </p>
      ) : null}
      <div className="installment-moderation-page__list">
        {programs.map((program) => {
          const productId = String(program.productId);
          const isBusy = pendingProductId === productId;
          return (
            <article key={productId} className="installment-moderation-page__card">
              <h3 className="installment-moderation-page__title">
                {program.productName ?? productId}
              </h3>
              <ul className="installment-moderation-page__plans">
                {program.plans.map((plan) => (
                  <li key={plan._id}>
                    {plan.title}: {plan.monthsCount} мес × {plan.monthlyAmountRub} ₽
                  </li>
                ))}
              </ul>
              <label>
                {INSTALLMENT_UI.MODERATION_REJECT_COMMENT}
                <textarea
                  className="installment-moderation-page__textarea"
                  value={rejectComments[productId] ?? ""}
                  onChange={(event) =>
                    setRejectComments((prev) => ({
                      ...prev,
                      [productId]: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="installment-moderation-page__actions">
                <button
                  type="button"
                  className="installment-moderation-page__btn installment-moderation-page__btn_primary"
                  disabled={isBusy}
                  onClick={() => void handleApprove(productId)}
                >
                  {isBusy
                    ? INSTALLMENT_UI.ACTION_PENDING
                    : INSTALLMENT_UI.MODERATION_APPROVE}
                </button>
                <button
                  type="button"
                  className="installment-moderation-page__btn installment-moderation-page__btn_danger"
                  disabled={isBusy}
                  onClick={() => void handleReject(productId)}
                >
                  {isBusy
                    ? INSTALLMENT_UI.ACTION_PENDING
                    : INSTALLMENT_UI.MODERATION_REJECT}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
