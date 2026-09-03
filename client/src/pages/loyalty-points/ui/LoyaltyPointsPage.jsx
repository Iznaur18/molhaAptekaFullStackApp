import { useEffect, useMemo, useState } from "react";
import {
  LOYALTY_POINTS_ADMIN_FREE_CREDIT_MAX,
  LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN,
} from "@molha/api-contract";

import {
  forgetPendingPaymentId,
  readPendingPaymentId,
  rememberPendingPaymentId,
} from "../../../entities/payment/lib/pendingPaymentStorage.js";
import {
  useCreateLoyaltyPointsPaymentMutation,
  useMyPaymentQuery,
  usePaymentConfigQuery,
} from "../../../entities/payment/model/paymentQueries.js";
import { useAdminCreditOwnLoyaltyPointsMutation } from "../../../entities/user/model/useAdminCreditOwnLoyaltyPointsMutation.js";
import { useMyLoyaltyPointsStatusQuery } from "../../../entities/user/model/useMyLoyaltyPointsStatusQuery.js";
import { LOYALTY_POINTS_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { rublesToLoyaltyPoints } from "../../../shared/config/loyaltyPointsConstants.js";
import {
  INTEGER_INPUT_FIELD_PROPS,
  formatRubPriceInput,
  parseRubPriceInput,
} from "../../../shared/lib/numericInput.js";
import { pluralizeRuBall } from "../../../shared/lib/pluralizeRuBall.js";
import {
  LOYALTY_POINTS_PURCHASE_MAX_RUB,
  LOYALTY_POINTS_PURCHASE_MIN_RUB,
  LOYALTY_POINTS_RETURN_PATH,
} from "../model/loyaltyPointsPurchaseUiConstants.js";

import "./LoyaltyPointsPage.css";

/** Иконки пунктов «на что тратить» — по порядку LOYALTY_POINTS_PAGE_UI.USES. */
const USE_ICON_KEYS = ["award", "trending-up", "play-circle", "gift"];

function AwardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="8" r="6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.21 13.89L7 22l5-3 5 3-1.21-8.11" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 6l-9.5 9.5-5-5L1 18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 6h6v6" />
    </svg>
  );
}

function PlayCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 8l6 4-6 4V8z" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13M19 12v9H5v-9" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8a2.5 2.5 0 010-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 010 5"
      />
    </svg>
  );
}

/** @param {string} key */
function UseIcon({ keyName }) {
  switch (keyName) {
    case "trending-up":
      return <TrendingUpIcon />;
    case "play-circle":
      return <PlayCircleIcon />;
    case "gift":
      return <GiftIcon />;
    case "award":
    default:
      return <AwardIcon />;
  }
}

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
  const [paymentError, setPaymentError] = useState("");
  // Платёж, за которым следим после возврата с формы оплаты.
  const [watchedPaymentId, setWatchedPaymentId] = useState("");

  const paymentConfigQuery = usePaymentConfigQuery();
  const createPaymentMutation = useCreateLoyaltyPointsPaymentMutation();
  const isCardPaymentEnabled = paymentConfigQuery.data?.cardPaymentEnabled === true;

  // Вернулись с оплаты — подхватываем платёж и ждём подтверждения банка.
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("paid")) return;
    const pendingId = readPendingPaymentId();
    if (pendingId) {
      setWatchedPaymentId(pendingId);
    }
  }, []);

  const watchedPaymentQuery = useMyPaymentQuery({ paymentId: watchedPaymentId || null });
  const watchedPayment = watchedPaymentQuery.data;

  // Платёж дошёл до конца — больше следить не за чем.
  useEffect(() => {
    if (watchedPayment && watchedPayment.status !== "created") {
      forgetPendingPaymentId();
    }
  }, [watchedPayment]);
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

  const handlePurchaseSubmit = async () => {
    setComingSoonMessage("");
    setPaymentError("");
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

    // Пока платёжный сервис не подключён, ведём себя как раньше — заглушкой,
    // а не сломанной кнопкой.
    if (!isCardPaymentEnabled) {
      setComingSoonMessage(
        LOYALTY_POINTS_PAGE_UI.COMING_SOON_AMOUNT(
          purchaseAmountRub,
          purchasePointsPreview,
        ),
      );
      return;
    }

    try {
      const payment = await createPaymentMutation.mutateAsync({
        amountRub: purchaseAmountRub,
        // Адрес возврата фиксируется при создании платежа, а id появляется
        // только в ответе — поэтому id кладём в sessionStorage, а в ссылку
        // возврата ставим просто флаг.
        returnUrl: `${LOYALTY_POINTS_RETURN_PATH}?paid=1`,
      });
      rememberPendingPaymentId(payment.paymentId);
      if (!payment.confirmationUrl) {
        setPaymentError(LOYALTY_POINTS_PAGE_UI.PAY_ERROR);
        return;
      }
      window.location.assign(payment.confirmationUrl);
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : LOYALTY_POINTS_PAGE_UI.PAY_ERROR,
      );
    }
  };

  const handleAdminFreeCreditSubmit = async () => {
    setAdminSuccessMessage("");
    if (adminAmountPoints == null) {
      setAdminValidationError(
        LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_AMOUNT_MIN(LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN),
      );
      return;
    }
    if (adminAmountPoints < LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN) {
      setAdminValidationError(
        LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_AMOUNT_MIN(LOYALTY_POINTS_ADMIN_FREE_CREDIT_MIN),
      );
      return;
    }
    if (adminAmountPoints > LOYALTY_POINTS_ADMIN_FREE_CREDIT_MAX) {
      setAdminValidationError(
        LOYALTY_POINTS_PAGE_UI.ADMIN_FREE_AMOUNT_MAX(LOYALTY_POINTS_ADMIN_FREE_CREDIT_MAX),
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
        error instanceof Error ? error.message : LOYALTY_POINTS_PAGE_UI.FETCH_FALLBACK,
      );
    }
  };

  if (!isAuthorized) {
    return (
      <section className="loyalty-points-page loyalty-points-page_centered">
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
      <section className="loyalty-points-page">
        <p className="loyalty-points-page__state">{LOYALTY_POINTS_PAGE_UI.LOADING}</p>
      </section>
    );
  }

  if (phase === "error") {
    return (
      <section className="loyalty-points-page">
        <p
          className="loyalty-points-page__state loyalty-points-page__state_error"
          role="alert"
        >
          {errorMessage}
        </p>
      </section>
    );
  }

  const canSubmitPurchase =
    purchaseAmountRub != null &&
    purchaseAmountRub >= LOYALTY_POINTS_PURCHASE_MIN_RUB &&
    purchaseAmountRub <= LOYALTY_POINTS_PURCHASE_MAX_RUB &&
    !createPaymentMutation.isPending;

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
      <div
        className="loyalty-points-page__hero"
        aria-label={LOYALTY_POINTS_PAGE_UI.BALANCE_POINTS(loyaltyPointsBalance)}
      >
        <div className="loyalty-points-page__hero-text">
          <p className="loyalty-points-page__hero-caption">
            {LOYALTY_POINTS_PAGE_UI.BALANCE_CAPTION}
          </p>
          <p className="loyalty-points-page__hero-row">
            <span className="loyalty-points-page__hero-value">{loyaltyPointsBalance}</span>
            <span className="loyalty-points-page__hero-unit">
              {pluralizeRuBall(loyaltyPointsBalance)}
            </span>
          </p>
          <p className="loyalty-points-page__hero-info">{LOYALTY_POINTS_PAGE_UI.INFO}</p>
        </div>
        <div className="loyalty-points-page__hero-icon" aria-hidden="true">
          <AwardIcon />
        </div>
      </div>

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
        {paymentError ? (
          <p className="loyalty-points-page__purchase-error" role="alert">
            {paymentError}
          </p>
        ) : null}
        {watchedPayment?.status === "created" ? (
          <p className="loyalty-points-page__soon" role="status">
            {LOYALTY_POINTS_PAGE_UI.PAY_PENDING}
          </p>
        ) : null}
        {watchedPayment?.status === "succeeded" ? (
          <p className="loyalty-points-page__soon" role="status">
            {LOYALTY_POINTS_PAGE_UI.PAY_SUCCESS(watchedPayment.creditedPoints)}
          </p>
        ) : null}
        {watchedPayment?.status === "canceled" ? (
          <p className="loyalty-points-page__purchase-error" role="alert">
            {LOYALTY_POINTS_PAGE_UI.PAY_CANCELED}
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

      <article className="loyalty-points-page__uses-card">
        <h3 className="loyalty-points-page__uses-title">{LOYALTY_POINTS_PAGE_UI.USES_TITLE}</h3>
        <ul className="loyalty-points-page__uses">
          {LOYALTY_POINTS_PAGE_UI.USES.map((item, index) => (
            <li key={item} className="loyalty-points-page__use-row">
              <span className="loyalty-points-page__use-icon" aria-hidden="true">
                <UseIcon keyName={USE_ICON_KEYS[index] ?? "award"} />
              </span>
              <span className="loyalty-points-page__use-text">{item}</span>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
