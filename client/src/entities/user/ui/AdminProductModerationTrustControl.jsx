import { ADMIN_PRODUCT_MODERATION_TRUST_UI } from "../../../shared/config/appUiCopy.js";
import { ConfirmButton } from "../../../shared/ui/ConfirmButton/ConfirmButton.jsx";
import { useUserProfileMutations } from "../model/useUserProfileMutations.js";

import "./AdminProductModerationTrustControl.css";

/**
 * Разрешить продавцу публиковать товары без модерации (только admin).
 *
 * @param {{
 *   user: import('../model/types.js').UserPublicProfile;
 *   onChanged: (patch: { productModerationTrusted: boolean }) => void;
 * }} props
 */
export function AdminProductModerationTrustControl({ user, onChanged }) {
  const { productModerationTrustMutation } = useUserProfileMutations();
  const isTrusted = user.productModerationTrusted === true;
  const isPending = productModerationTrustMutation.isPending;
  const errorMessage =
    productModerationTrustMutation.error instanceof Error
      ? productModerationTrustMutation.error.message
      : "";

  const handleConfirm = async () => {
    try {
      const seller = await productModerationTrustMutation.mutateAsync({
        userId: String(user._id),
        trusted: !isTrusted,
      });
      onChanged({ productModerationTrusted: seller.productModerationTrusted === true });
    } catch {
      // Текст ошибки берём из состояния мутации ниже — она уже его сохранила.
    }
  };

  return (
    <section className="admin-moderation-trust">
      <div className="admin-moderation-trust__text">
        <h3 className="admin-moderation-trust__title">
          {ADMIN_PRODUCT_MODERATION_TRUST_UI.TITLE}
        </h3>
        <p className="admin-moderation-trust__status">
          {isTrusted
            ? ADMIN_PRODUCT_MODERATION_TRUST_UI.STATUS_ON
            : ADMIN_PRODUCT_MODERATION_TRUST_UI.STATUS_OFF}
        </p>
        <p className="admin-moderation-trust__hint">
          {ADMIN_PRODUCT_MODERATION_TRUST_UI.HINT}
        </p>
      </div>
      <ConfirmButton
        className="app-btn app-btn--outline admin-moderation-trust__button"
        label={
          isTrusted
            ? ADMIN_PRODUCT_MODERATION_TRUST_UI.ACTION_REVOKE
            : ADMIN_PRODUCT_MODERATION_TRUST_UI.ACTION_GRANT
        }
        question={
          isTrusted
            ? ADMIN_PRODUCT_MODERATION_TRUST_UI.CONFIRM_REVOKE
            : ADMIN_PRODUCT_MODERATION_TRUST_UI.CONFIRM_GRANT
        }
        pendingLabel={ADMIN_PRODUCT_MODERATION_TRUST_UI.ACTION_PENDING}
        isPending={isPending}
        disabled={isPending}
        onConfirm={() => void handleConfirm()}
      />
      {errorMessage ? (
        <p className="admin-moderation-trust__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
