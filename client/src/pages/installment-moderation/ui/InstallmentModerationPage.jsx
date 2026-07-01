import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useInstallmentMutations } from "../../../entities/installment/model/useInstallmentMutations.js";
import { installmentQueryKeys } from "../../../entities/installment/model/installmentQueryKeys.js";
import { usePendingInstallmentModerationQuery } from "../../../entities/installment/model/usePendingInstallmentModerationQuery.js";
import { InstallmentPageLayout } from "../../../entities/installment/ui/InstallmentPageLayout.jsx";
import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";

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
      <InstallmentPageLayout
        title={INSTALLMENT_UI.MODERATION_PAGE_TITLE}
        countLabel={INSTALLMENT_UI.COUNT_PROGRAMS(0)}
      >
        <p className="installment-page__state">{INSTALLMENT_UI.MODERATION_PAGE_LOADING}</p>
      </InstallmentPageLayout>
    );
  }

  if (phase === "error" && programs.length === 0) {
    return (
      <InstallmentPageLayout
        title={INSTALLMENT_UI.MODERATION_PAGE_TITLE}
        countLabel={INSTALLMENT_UI.COUNT_PROGRAMS(0)}
      >
        <p className="installment-page__state installment-page__state_error" role="alert">
          {error}
        </p>
      </InstallmentPageLayout>
    );
  }

  return (
    <InstallmentPageLayout
      title={INSTALLMENT_UI.MODERATION_PAGE_TITLE}
      countLabel={INSTALLMENT_UI.COUNT_PROGRAMS(programs.length)}
    >
      {actionError ? (
        <p className="installment-page__state installment-page__state_error" role="alert">
          {actionError}
        </p>
      ) : null}

      {programs.length === 0 ? (
        <p className="installment-page__state">{INSTALLMENT_UI.MODERATION_PAGE_EMPTY}</p>
      ) : (
        <ul className="installment-page__list" role="list">
          {programs.map((program) => {
            const productId = String(program.productId);
            const isBusy = pendingProductId === productId;

            return (
              <li key={productId} role="listitem">
                <article className="installment-queue-card">
                  <div className="installment-queue-card__head">
                    <h3 className="installment-queue-card__title">
                      {program.productName ?? productId}
                    </h3>
                  </div>
                  {program.seller?._id ? (
                    <p className="installment-queue-card__seller">
                      {INSTALLMENT_UI.SELLER_LABEL}:{" "}
                      <a
                        className="installment-queue-card__seller-link"
                        href={`/user/${program.seller._id}`}
                      >
                        {program.seller.userName?.trim() ||
                          program.seller.email?.trim() ||
                          program.seller._id}
                      </a>
                    </p>
                  ) : null}
                  {(program.buyers ?? []).length > 0 ? (
                    <p className="installment-queue-card__seller">
                      {(program.buyers ?? []).length > 1
                        ? INSTALLMENT_UI.BUYERS_LABEL
                        : INSTALLMENT_UI.BUYER_LABEL}
                      :{" "}
                      {(program.buyers ?? []).map((buyer, index) => (
                        <span key={buyer._id}>
                          {index > 0 ? ", " : null}
                          <a
                            className="installment-queue-card__seller-link"
                            href={`/user/${buyer._id}`}
                          >
                            {buyer.userName?.trim() ||
                              buyer.email?.trim() ||
                              buyer._id}
                          </a>
                        </span>
                      ))}
                    </p>
                  ) : null}
                  <ul className="installment-queue-card__plans" role="list">
                    {program.plans.map((plan) => (
                      <li key={plan._id} className="installment-queue-card__plan-pill">
                        {plan.title}: {plan.monthsCount} мес × {plan.monthlyAmountRub} ₽
                      </li>
                    ))}
                  </ul>
                  <label className="installment-queue-card__field">
                    {INSTALLMENT_UI.MODERATION_REJECT_COMMENT}
                    <textarea
                      className="installment-queue-card__textarea"
                      value={rejectComments[productId] ?? ""}
                      onChange={(event) =>
                        setRejectComments((prev) => ({
                          ...prev,
                          [productId]: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <div className="installment-queue-card__actions">
                    <button
                      type="button"
                      className="installment-queue-card__btn installment-queue-card__btn_success"
                      disabled={isBusy}
                      onClick={() => void handleApprove(productId)}
                    >
                      {isBusy
                        ? INSTALLMENT_UI.ACTION_PENDING
                        : INSTALLMENT_UI.MODERATION_APPROVE}
                    </button>
                    <button
                      type="button"
                      className="installment-queue-card__btn installment-queue-card__btn_danger"
                      disabled={isBusy}
                      onClick={() => void handleReject(productId)}
                    >
                      {isBusy
                        ? INSTALLMENT_UI.ACTION_PENDING
                        : INSTALLMENT_UI.MODERATION_REJECT}
                    </button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </InstallmentPageLayout>
  );
}
