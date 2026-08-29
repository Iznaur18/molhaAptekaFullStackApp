import { INSTALLMENT_UI } from "../../../../shared/config/appUiCopy.js";
import { InstallmentBuyerBlock } from "../../../installment/ui/InstallmentBuyerBlock.jsx";
import {
  INSTALLMENT_MODERATION_PENDING,
  INSTALLMENT_MODERATION_REJECTED,
} from "../../../installment/model/constants.js";

/**
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 *   isSellerView: boolean;
 *   installmentUi: ReturnType<import('../../../installment/lib/resolveInstallmentUiState.js').resolveInstallmentUiState>;
 *   installmentProgram: import('../../../installment/model/types.js').InstallmentProgramFromApi | null;
 *   isInstallmentProgramLoading: boolean;
 *   isAuthorized: boolean;
 *   isUserDataConfirmed: boolean;
 *   onRequestLogin: () => void;
 *   onSuccess: () => void;
 *   dockSubmit?: boolean;
 *   isPurchaseBlocked?: boolean;
 *   blockedPurchaseLabel?: string;
 * }} props
 */
export function ProductDetailsModalInstallmentTab({
  product,
  isSellerView,
  installmentUi,
  installmentProgram,
  isInstallmentProgramLoading,
  isAuthorized,
  isUserDataConfirmed,
  onRequestLogin,
  onSuccess,
  dockSubmit = false,
  isPurchaseBlocked = false,
  blockedPurchaseLabel = "",
}) {
  if (isSellerView) {
    return (
      <section className="product-details-modal__installment-section">
        {isInstallmentProgramLoading ? (
          <p>{INSTALLMENT_UI.ACTION_PENDING}</p>
        ) : installmentProgram?.moderationStatus === INSTALLMENT_MODERATION_PENDING ? (
          <p>{INSTALLMENT_UI.MODERATION_PENDING}</p>
        ) : installmentProgram?.moderationStatus === INSTALLMENT_MODERATION_REJECTED ? (
          <p>{INSTALLMENT_UI.MODERATION_REJECTED}</p>
        ) : installmentUi.installmentActive ? (
          <p>{INSTALLMENT_UI.MODERATION_APPROVED}</p>
        ) : (
          <p>{INSTALLMENT_UI.SELLER_TAB_HINT}</p>
        )}
      </section>
    );
  }

  if (installmentUi.installmentActive && installmentProgram) {
    return (
      <InstallmentBuyerBlock
        product={product}
        program={installmentProgram}
        isAuthorized={isAuthorized}
        isUserDataConfirmed={isUserDataConfirmed}
        onRequestLogin={onRequestLogin}
        onSuccess={onSuccess}
        dockSubmit={dockSubmit}
        isPurchaseBlocked={isPurchaseBlocked}
        blockedPurchaseLabel={blockedPurchaseLabel}
      />
    );
  }

  return (
    <p>
      {isInstallmentProgramLoading
        ? INSTALLMENT_UI.ACTION_PENDING
        : INSTALLMENT_UI.MODERATION_PENDING}
    </p>
  );
}
