import { useMemo, useState } from "react";
import {
  LOYALTY_POINTS_ADMIN_FREE_CREDIT_MAX,
  LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN,
} from "@molha/api-contract";

import { useAdminCreditOwnLoyaltyPointsMutation } from "../../../entities/user/model/useAdminCreditOwnLoyaltyPointsMutation.js";
import { useMyLoyaltyPointsStatusQuery } from "../../../entities/user/model/useMyLoyaltyPointsStatusQuery.js";
import { LOYALTY_POINTS_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import {
  INTEGER_INPUT_FIELD_PROPS,
  formatRubPriceInput,
  parseRubPriceInput,
} from "../../../shared/lib/numericInput.js";
import { rublesToLoyaltyPoints } from "../../../shared/config/loyaltyPointsConstants.js";
import {
  LOYALTY_POINTS_PURCHASE_MAX_RUB,
  LOYALTY_POINTS_PURCHASE_MIN_RUB,
} from "../model/loyaltyPointsPurchaseUiConstants.js";

import "./LoyaltyPointsPage.css";

/**
 * @param {string} raw
 */
function parsePurchaseAmountRub(raw) {
  return parseRubPriceInput(raw);
}

/**
 * @param {{
 *   isAuthorized: boolean;
 *   isAdmin?: boolean;
 *   onRequestLogin: () => void;
 *   onLoyaltyPointsBalanceChange?: (balance: number) => void;
 * }} props
 */
export function LoyaltyPointsPage({
  isAuthorized,
  isAdmin = false,
  onRequestLogin,
  onLoyaltyPointsBalanceChange,
}) {
  const statusQuery = useMyLoyaltyPointsStatusQuery({ enabled: isAuthorized });
  const adminCreditMutation = useAdminCreditOwnLoyaltyPointsMutation({
    onBalanceChange: onLoyaltyPointsBalanceChange,
  });
  const [purchaseAmountInput, setPurchaseAmountInput] = useState("");
  const [purchaseValidationError, setPurchaseValidationError] = useState("");
  const [comingSoonMessage, setComingSoonMessage] = useState("");
  const [adminAmountInput, setAdminAmountInput] = useState("");
  const [adminValidationError, setAdminValidationError] = useState("");
  const [adminSuccessMessage, setAdminSuccessMessage] = useState("");

  const loyaltyPointsBalance = statusQuery.data?.loyaltyPointsBalance ?? 0;
  const phase = !isAuthorized
    ? "idle"
    : statusQuery.isPending
      ? "loading"
      : statusQuery.isError
        ? "error"
        : "success";
  const errorMessage =
    statusQuery.error instanceof Error
      ? statusQuery.error.message
      : LOYALTY_POINTS_PAGE_UI.FETCH_FALLBACK;

  const purchaseAmountRub = useMemo(
    () => parsePurchaseAmountRub(purchaseAmountInput),
    [purchaseAmountInput],
  );

  const purchasePointsPreview = useMemo(() => {
    if (purchaseAmountRub == null) {
      return 0;
    }
    return rublesToLoyaltyPoints(purchaseAmountRub);
  }, [purchaseAmountRub]);

  const adminAmountPoints = useMemo(
    () => parsePurchaseAmountRub(adminAmountInput),
    [adminAmountInput],
  );

  const handlePurchaseAmountChange = (event) => {
    setPurchaseAmountInput(formatRubPriceInput(event.target.value));
    setPurchaseValidationError("");
    setComingSoonMessage("");
  };

  const handleAdminAmountChange = (event) => {
    setAdminAmountInput(formatRubPriceInput(event.target.value));
    setAdminValidationError("");
    setAdminSuccessMessage("");
  };

  const handlePurchaseSubmit = () => {
    setComingSoonMessage("");
    if (purchaseAmountRub == null) {
      setPurchaseValidationError(LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_MIN(1));
      return;
    }
    if (purchaseAmountRub < LOYALTY_POINTS_PURCHASE_MIN_RUB) {
      setPurchaseValidationError(
        LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_MIN(LOYALTY_POINTS_PURCHASE_MIN_RUB),
      );
      return;
    }
    if (purchaseAmountRub > LOYALTY_POINTS_PURCHASE_MAX_RUB) {
      setPurchaseValidationError(
        LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_MAX(LOYALTY_POINTS_PURCHASE_MAX_RUB),
      );
      return;
    }

    setPurchaseValidationError("");
    setComingSoonMessage(
      LOYALTY_POINTS_PAGE_UI.COMING_SOON_AMOUNT(
        purchaseAmountRub,
        purchasePointsPreview,
      ),
    );
  };

  const handleAdminFreeCreditSubmit = async () => {
    setAdminSuccessMessage("");
    if (adminAmountPoints == null) {
      setAdminValidationError(
        LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_AMOUNT_MIN(
          LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN,
        ),
      );
      return;
    }
    if (adminAmountPoints < LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN) {
      setAdminValidationError(
        LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_AMOUNT_MIN(
          LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN,
        ),
      );
      return;
    }
    if (adminAmountPoints > LOYALTY_POINTS_ADMIN_FREE_CREDIT_MAX) {
      setAdminValidationError(
        LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_AMOUNT_MAX(
          LOYALTY_POINTS_ADMIN_FREE_CREDIT_MAX,
        ),
      );
      return;
    }

    setAdminValidationError("");
    try {
      const result = await adminCreditMutation.mutateAsync({
        amount: adminAmountPoints,
      });
      setAdminSuccessMessage(
        LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_SUCCESS(
          result.credited,
          result.loyaltyPointsBalance,
        ),
      );
      setAdminAmountInput("");
    } catch (error) {
      setAdminValidationError(
        error instanceof Error
          ? error.message
          : LOYALTY_POINTS_PAGE_UI.FETCH_FALLBACK,
      );
    }
  };

  if (!isAuthorized) {
    return (
      <section className="loyalty-points-page">
        <p className="loyalty-points-page__hint">{LOYALTY_POINTS_PAGE_UI.LOGIN_HINT}</p>
        <button
          type="button"
          className="loyalty-points-page__login app-btn app-btn--primary"
          onClick={onRequestLogin}
        >
          {LOYALTY_POINTS_PAGE_UI.LOGIN_BUTTON}
        </button>
      </section>
    );
  }

  if (phase === "loading") {
    return (
      <p className="loyalty-points-page__state">{LOYALTY_POINTS_PAGE_UI.LOADING}</p>
    );
  }

  if (phase === "error") {
    return (
      <p
        className="loyalty-points-page__state loyalty-points-page__state_error"
        role="alert"
      >
        {errorMessage}
      </p>
    );
  }

  const canSubmitPurchase =
    purchaseAmountRub != null &&
    purchaseAmountRub >= LOYALTY_POINTS_PURCHASE_MIN_RUB &&
    purchaseAmountRub <= LOYALTY_POINTS_PURCHASE_MAX_RUB;

  const canSubmitAdminCredit =
    adminAmountPoints != null &&
    adminAmountPoints >= LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN &&
    adminAmountPoints <= LOYALTY_POINTS_ADMIN_FREE_CREDIT_MAX &&
    !adminCreditMutation.isPending;

  return (
    <section
      className="loyalty-points-page"
      aria-label={LOYALTY_POINTS_PAGE_UI.PAGE_ARIA}
    >
      <p className="loyalty-points-page__balance">
        {LOYALTY_POINTS_PAGE_UI.BALANCE_POINTS(loyaltyPointsBalance)}
      </p>
      <p className="loyalty-points-page__hint">{LOYALTY_POINTS_PAGE_UI.INFO}</p>
      <ul className="loyalty-points-page__uses">
        {LOYALTY_POINTS_PAGE_UI.USES.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="loyalty-points-page__purchase">
        <h3 className="loyalty-points-page__purchase-title">
          {LOYALTY_POINTS_PAGE_UI.PURCHASE_SECTION}
        </h3>
        <label className="loyalty-points-page__purchase-label">
          {LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_LABEL}
          <input
            {...INTEGER_INPUT_FIELD_PROPS}
            className="loyalty-points-page__purchase-input"
            name="purchaseAmountRub"
            value={purchaseAmountInput}
            onChange={handlePurchaseAmountChange}
            inputMode="numeric"
            aria-invalid={purchaseValidationError ? true : undefined}
            placeholder={String(LOYALTY_POINTS_PURCHASE_MIN_RUB)}
          />
        </label>
        <p className="loyalty-points-page__purchase-hint">
          {LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_HINT}
        </p>
        {purchasePointsPreview > 0 ? (
          <p className="loyalty-points-page__purchase-preview">
            {LOYALTY_POINTS_PAGE_UI.PURCHASE_POINTS_PREVIEW(purchasePointsPreview)}
          </p>
        ) : null}
        {purchaseValidationError ? (
          <p className="loyalty-points-page__purchase-error" role="alert">
            {purchaseValidationError}
          </p>
        ) : null}
        <button
          type="button"
          className="loyalty-points-page__buy app-btn app-btn--primary"
          onClick={handlePurchaseSubmit}
          disabled={!canSubmitPurchase}
        >
          {LOYALTY_POINTS_PAGE_UI.BUY}
        </button>
        {comingSoonMessage ? (
          <p className="loyalty-points-page__soon" role="status">
            {comingSoonMessage}
          </p>
        ) : null}
      </div>

      {isAdmin ? (
        <div className="loyalty-points-page__purchase loyalty-points-page__admin-credit">
          <h3 className="loyalty-points-page__purchase-title">
            {LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_SECTION}
          </h3>
          <label className="loyalty-points-page__purchase-label">
            {LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_AMOUNT_LABEL}
            <input
              {...INTEGER_INPUT_FIELD_PROPS}
              className="loyalty-points-page__purchase-input"
              name="adminFreeCreditAmount"
              value={adminAmountInput}
              onChange={handleAdminAmountChange}
              inputMode="numeric"
              aria-invalid={adminValidationError ? true : undefined}
              placeholder={String(LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN)}
              disabled={adminCreditMutation.isPending}
            />
          </label>
          <p className="loyalty-points-page__purchase-hint">
            {LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_AMOUNT_HINT}
          </p>
          {adminValidationError ? (
            <p className="loyalty-points-page__purchase-error" role="alert">
              {adminValidationError}
            </p>
          ) : null}
          {adminSuccessMessage ? (
            <p className="loyalty-points-page__soon" role="status">
              {adminSuccessMessage}
            </p>
          ) : null}
          <button
            type="button"
            className="loyalty-points-page__buy app-btn app-btn--primary"
            onClick={() => {
              void handleAdminFreeCreditSubmit();
            }}
            disabled={!canSubmitAdminCredit}
          >
            {adminCreditMutation.isPending
              ? LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_SUBMITTING
              : LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_SUBMIT}
          </button>
        </div>
      ) : null}
    </section>
  );
}
