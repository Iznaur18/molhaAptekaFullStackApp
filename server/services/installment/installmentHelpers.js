import {
  INSTALLMENT_CONTRACT_STATUS_ACTIVE,
  INSTALLMENT_CONTRACT_STATUS_CANCELLED,
  INSTALLMENT_CONTRACT_STATUS_COMPLETED,
  INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
  INSTALLMENT_MODERATION_APPROVED,
  INSTALLMENT_MODERATION_PENDING,
  INSTALLMENT_MODERATION_REJECTED,
  INSTALLMENT_MONTHS_MAX,
  INSTALLMENT_MONTHS_MIN,
  INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB,
  INSTALLMENT_PAYMENT_INTERVAL_MS,
  INSTALLMENT_PAYMENT_STATUS_DUE,
  INSTALLMENT_PAYMENT_STATUS_OVERDUE,
  INSTALLMENT_PAYMENT_STATUS_PAID,
  INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
  INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
  INSTALLMENT_PAYMENT_STATUS_WAIVED,
  INSTALLMENT_PLANS_MAX,
  INSTALLMENT_PLAN_TITLE_MAX_LENGTH,
  INSTALLMENT_REMINDER_MS,
  INSTALLMENT_SALES_LIST_FILTER_IN_PROGRESS,
  IN_APP_NOTIFICATION_KIND_INSTALLMENT_EARLY_PAYOFF,
  IN_APP_NOTIFICATION_KIND_INSTALLMENT_NEW_FOR_SELLER,
  IN_APP_NOTIFICATION_KIND_INSTALLMENT_OVERDUE,
  IN_APP_NOTIFICATION_KIND_INSTALLMENT_PAYMENT_REMINDER,
  IN_APP_NOTIFICATION_MESSAGE_INSTALLMENT_EARLY_PAYOFF,
  IN_APP_NOTIFICATION_MESSAGE_INSTALLMENT_NEW_FOR_SELLER,
  IN_APP_NOTIFICATION_MESSAGE_INSTALLMENT_OVERDUE,
  IN_APP_NOTIFICATION_MESSAGE_INSTALLMENT_PAYMENT_REMINDER,
} from "../../constants/installmentConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import mongoose from "mongoose";

import { INSTALLMENT_COUNTERPARTY_PUBLIC_SELECT } from "../../constants/installmentConstants.js";
import {
  InstallmentContractModel,
  OrderModel,
  ProductInstallmentProgramModel,
  ProductModel,
  UserModel,
} from "../../models/index.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";
import { isInstallmentOrderAcceptedBySeller } from "./installmentOrderAcceptGate.js";

const ACTIVE_CONTRACT_STATUSES = [
  INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
  INSTALLMENT_CONTRACT_STATUS_ACTIVE,
];

/**
 * @param {unknown} raw
 */
export const normalizeInstallmentPlanInput = (raw) => {
  const title = String(raw?.title ?? "").trim();
  const monthsCount = Math.floor(Number(raw?.monthsCount));
  const monthlyAmountRub = Math.floor(Number(raw?.monthlyAmountRub));
  const firstPaymentRequiredNow = raw?.firstPaymentRequiredNow !== false;

  if (!title || title.length > INSTALLMENT_PLAN_TITLE_MAX_LENGTH) {
    throw new Error("Укажите название плана");
  }
  if (
    !Number.isFinite(monthsCount) ||
    monthsCount < INSTALLMENT_MONTHS_MIN ||
    monthsCount > INSTALLMENT_MONTHS_MAX
  ) {
    throw new Error(
      `Срок рассрочки: от ${INSTALLMENT_MONTHS_MIN} до ${INSTALLMENT_MONTHS_MAX} мес.`,
    );
  }
  if (
    !Number.isFinite(monthlyAmountRub) ||
    monthlyAmountRub < INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB
  ) {
    throw new Error(`Минимальный платёж: ${INSTALLMENT_MONTHLY_PAYMENT_MIN_RUB} ₽`);
  }

  return {
    title,
    monthsCount,
    monthlyAmountRub,
    firstPaymentRequiredNow,
  };
};

/**
 * @param {unknown[]} rawPlans
 */
export const normalizeInstallmentPlansInput = (rawPlans) => {
  if (!Array.isArray(rawPlans) || rawPlans.length === 0) {
    throw new Error("Добавьте хотя бы один план рассрочки");
  }
  if (rawPlans.length > INSTALLMENT_PLANS_MAX) {
    throw new Error(`Не более ${INSTALLMENT_PLANS_MAX} планов`);
  }
  return rawPlans.map(normalizeInstallmentPlanInput);
};

/**
 * @param {string} productId
 */
export const syncProductInstallmentEnabledFlag = async (productId) => {
  const program = await ProductInstallmentProgramModel.findOne({
    productId,
    isEnabled: true,
    moderationStatus: INSTALLMENT_MODERATION_APPROVED,
    "plans.0": { $exists: true },
  })
    .select("_id")
    .lean();

  const product = await ProductModel.findById(productId)
    .select("productIsAvailable productModerationStatus productInstallmentEnabled")
    .lean();

  const enabled =
    Boolean(program) &&
    product?.productModerationStatus === PRODUCT_MODERATION_APPROVED &&
    product?.productIsAvailable !== false;

  await ProductModel.updateOne(
    { _id: productId },
    { $set: { productInstallmentEnabled: enabled } },
  );
  return enabled;
};

/**
 * @param {string} productId
 */
export const getApprovedInstallmentProgramForProduct = async (productId) => {
  return ProductInstallmentProgramModel.findOne({
    productId,
    isEnabled: true,
    moderationStatus: INSTALLMENT_MODERATION_APPROVED,
  }).lean();
};

/**
 * @param {string} productId
 */
export const countActiveInstallmentContractsForProduct = async (productId) => {
  return InstallmentContractModel.countDocuments({
    productId,
    status: { $in: ACTIVE_CONTRACT_STATUSES },
  });
};

/**
 * @param {Date} fromDate
 */
export const addInstallmentPaymentInterval = (fromDate) =>
  new Date(fromDate.getTime() + INSTALLMENT_PAYMENT_INTERVAL_MS);

/**
 * @param {{
 *   plan: { monthsCount: number; monthlyAmountRub: number; firstPaymentRequiredNow: boolean; title: string };
 *   quantity: number;
 *   startAt?: Date;
 * }} params
 */
export const buildInstallmentPaymentSchedule = ({
  plan,
  quantity,
  startAt = new Date(),
}) => {
  const monthlyPaymentRub = plan.monthlyAmountRub * quantity;
  const totalAmountRub = monthlyPaymentRub * plan.monthsCount;
  /** @type {Array<{ paymentIndex: number; amountRub: number; dueAt: Date; status: string }>} */
  const payments = [];

  let dueAt = new Date(startAt);
  for (let index = 1; index <= plan.monthsCount; index += 1) {
    if (index === 1) {
      if (!plan.firstPaymentRequiredNow) {
        dueAt = addInstallmentPaymentInterval(startAt);
      }
    } else {
      dueAt = addInstallmentPaymentInterval(dueAt);
    }

    const isFirst = index === 1;
    const skipFirstNow = isFirst && !plan.firstPaymentRequiredNow;
    payments.push({
      paymentIndex: index,
      amountRub: monthlyPaymentRub,
      dueAt: new Date(dueAt),
      status: skipFirstNow
        ? INSTALLMENT_PAYMENT_STATUS_SCHEDULED
        : isFirst
          ? INSTALLMENT_PAYMENT_STATUS_DUE
          : INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
    });
  }

  const finalDueAt = payments[payments.length - 1]?.dueAt ?? startAt;
  const nextPayment = payments.find(
    (payment) =>
      payment.status === INSTALLMENT_PAYMENT_STATUS_DUE ||
      payment.status === INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
  );

  return {
    monthlyPaymentRub,
    totalAmountRub,
    payments,
    finalDueAt,
    nextPaymentDueAt: nextPayment?.dueAt ?? null,
  };
};

/**
 * @param {import('mongoose').Document | Record<string, unknown>} contract
 */
export const getNextUnpaidInstallmentPayment = (contract) => {
  const unpaid = (contract.payments ?? [])
    .filter(
      (payment) =>
        payment.status !== INSTALLMENT_PAYMENT_STATUS_PAID &&
        payment.status !== INSTALLMENT_PAYMENT_STATUS_WAIVED,
    )
    .sort((left, right) => left.paymentIndex - right.paymentIndex);
  return unpaid[0] ?? null;
};

/**
 * @param {import('mongoose').Document | Record<string, unknown>} contract
 */
export const isEarlyPayoffPendingConfirmation = (contract) => {
  const unpaid = (contract.payments ?? []).filter(
    (payment) =>
      payment.status !== INSTALLMENT_PAYMENT_STATUS_PAID &&
      payment.status !== INSTALLMENT_PAYMENT_STATUS_WAIVED,
  );
  const pending = unpaid.filter(
    (payment) => payment.status === INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
  );
  return pending.length > 0 && pending.length === unpaid.length;
};

/**
 * @param {{ dueAt?: Date | string | null; buyerMarkedPaidAt?: Date | null; confirmedByUserId?: unknown; status: string }} payment
 * @param {Date} now
 */
const revertPaymentFromPendingConfirmation = (payment, now) => {
  payment.buyerMarkedPaidAt = null;
  payment.confirmedByUserId = null;
  const isPastDue = Boolean(payment.dueAt) && new Date(payment.dueAt) < now;
  payment.status = isPastDue
    ? INSTALLMENT_PAYMENT_STATUS_OVERDUE
    : INSTALLMENT_PAYMENT_STATUS_SCHEDULED;
};

/**
 * @param {import('mongoose').Document} contract
 */
export const restoreInstallmentScheduleAfterPendingMarksReverted = (contract) => {
  const unpaid = (contract.payments ?? [])
    .filter(
      (payment) =>
        payment.status !== INSTALLMENT_PAYMENT_STATUS_PAID &&
        payment.status !== INSTALLMENT_PAYMENT_STATUS_WAIVED,
    )
    .sort((left, right) => left.paymentIndex - right.paymentIndex);

  const hasDueOrOverdue = unpaid.some(
    (payment) =>
      payment.status === INSTALLMENT_PAYMENT_STATUS_DUE ||
      payment.status === INSTALLMENT_PAYMENT_STATUS_OVERDUE,
  );
  if (!hasDueOrOverdue && unpaid[0]) {
    unpaid[0].status = INSTALLMENT_PAYMENT_STATUS_DUE;
  }

  const nextDue = unpaid.find(
    (payment) =>
      payment.status === INSTALLMENT_PAYMENT_STATUS_DUE ||
      payment.status === INSTALLMENT_PAYMENT_STATUS_OVERDUE ||
      payment.status === INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
  );
  contract.nextPaymentDueAt = nextDue?.dueAt ?? null;
  recomputeContractOverdueFlags(contract);
  resolveContractStatusAfterPayment(contract);
};

/**
 * @param {import('mongoose').Document} contract
 */
export const revertInstallmentPaymentsAfterEarlyPayoffCancel = (contract) => {
  const now = new Date();
  for (const payment of contract.payments ?? []) {
    if (payment.status !== INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION) {
      continue;
    }
    revertPaymentFromPendingConfirmation(payment, now);
  }
  restoreInstallmentScheduleAfterPendingMarksReverted(contract);
};

/**
 * @param {import('mongoose').Document} contract
 * @param {number} paymentIndex
 */
export const rejectInstallmentPaymentPendingConfirmation = (contract, paymentIndex) => {
  const payment = contract.payments.find(
    (row) => row.paymentIndex === Number(paymentIndex),
  );
  if (!payment) {
    throw new Error("Платёж не найден");
  }
  if (payment.status !== INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION) {
    throw new Error("Платёж не ожидает подтверждения");
  }
  revertPaymentFromPendingConfirmation(payment, new Date());
  restoreInstallmentScheduleAfterPendingMarksReverted(contract);
};

export const canBuyerMarkInstallmentPayment = (contract, payment) => {
  if (
    payment.status === INSTALLMENT_PAYMENT_STATUS_DUE ||
    payment.status === INSTALLMENT_PAYMENT_STATUS_OVERDUE
  ) {
    return true;
  }
  if (payment.status !== INSTALLMENT_PAYMENT_STATUS_SCHEDULED) {
    return false;
  }
  const nextPayment = getNextUnpaidInstallmentPayment(contract);
  return nextPayment != null && nextPayment.paymentIndex === payment.paymentIndex;
};

/**
 * Cron раньше переводил `pending_confirmation` в `overdue` в БД — восстанавливаем.
 * @param {import('mongoose').Document} contract
 */
export const repairInstallmentPaymentStatusDrift = async (contract) => {
  let dirty = false;
  for (const payment of contract.payments ?? []) {
    if (
      payment.status === INSTALLMENT_PAYMENT_STATUS_OVERDUE &&
      payment.buyerMarkedPaidAt &&
      !payment.paidAt
    ) {
      payment.status = INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION;
      dirty = true;
    }
  }
  if (!dirty) {
    return false;
  }
  contract.markModified("payments");
  await contract.save();
  return true;
};

/**
 * @param {import('mongoose').Document | Record<string, unknown>} contract
 */
export const recomputeContractOverdueFlags = (contract) => {
  const now = new Date();
  let hasOverduePayment = false;
  for (const payment of contract.payments ?? []) {
    if (payment.status === INSTALLMENT_PAYMENT_STATUS_PAID) {
      continue;
    }

    const isPastDue = Boolean(payment.dueAt) && new Date(payment.dueAt) < now;

    if (payment.status === INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION) {
      if (isPastDue) {
        hasOverduePayment = true;
      }
      continue;
    }

    if (payment.status === INSTALLMENT_PAYMENT_STATUS_DUE && isPastDue) {
      payment.status = INSTALLMENT_PAYMENT_STATUS_OVERDUE;
      hasOverduePayment = true;
    } else if (payment.status === INSTALLMENT_PAYMENT_STATUS_OVERDUE) {
      hasOverduePayment = true;
    }
  }
  contract.hasOverduePayment = hasOverduePayment;
};

/**
 * @param {import('mongoose').Document} contract
 */
export const resolveContractStatusAfterPayment = (contract) => {
  const allPaid = (contract.payments ?? []).every(
    (payment) => payment.status === INSTALLMENT_PAYMENT_STATUS_PAID,
  );
  if (allPaid) {
    contract.status = INSTALLMENT_CONTRACT_STATUS_COMPLETED;
    contract.completedAt = new Date();
    contract.nextPaymentDueAt = null;
    contract.hasOverduePayment = false;
    return;
  }

  const nextPayment = contract.payments.find(
    (payment) =>
      payment.status === INSTALLMENT_PAYMENT_STATUS_DUE ||
      payment.status === INSTALLMENT_PAYMENT_STATUS_OVERDUE ||
      payment.status === INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION ||
      payment.status === INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
  );

  if (nextPayment) {
    contract.nextPaymentDueAt = nextPayment.dueAt;
    if (
      contract.status === INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT &&
      nextPayment.paymentIndex > 1
    ) {
      contract.status = INSTALLMENT_CONTRACT_STATUS_ACTIVE;
    } else if (
      contract.status === INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT &&
      nextPayment.status === INSTALLMENT_PAYMENT_STATUS_SCHEDULED
    ) {
      contract.status = INSTALLMENT_CONTRACT_STATUS_ACTIVE;
    } else if (contract.status !== INSTALLMENT_CONTRACT_STATUS_CANCELLED) {
      contract.status = INSTALLMENT_CONTRACT_STATUS_ACTIVE;
    }
  }

  recomputeContractOverdueFlags(contract);
};

/**
 * @param {import('mongoose').Document} contract
 * @param {number} paymentIndex
 * @param {Date} paidAt
 */
export const applyConfirmedInstallmentPayment = (contract, paymentIndex, paidAt) => {
  const payment = contract.payments.find((row) => row.paymentIndex === paymentIndex);
  if (!payment) {
    throw new Error("Платёж не найден");
  }

  payment.status = INSTALLMENT_PAYMENT_STATUS_PAID;
  payment.paidAt = paidAt;
  contract.paidAmountRub =
    (Number(contract.paidAmountRub) || 0) + (Number(payment.amountRub) || 0);

  const nextScheduled = contract.payments.find(
    (row) =>
      row.paymentIndex > paymentIndex &&
      row.status === INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
  );
  if (nextScheduled) {
    nextScheduled.dueAt = addInstallmentPaymentInterval(paidAt);
    nextScheduled.status = INSTALLMENT_PAYMENT_STATUS_SCHEDULED;
  }

  const nextDue = contract.payments.find(
    (row) => row.status === INSTALLMENT_PAYMENT_STATUS_SCHEDULED,
  );
  if (
    nextDue &&
    !contract.payments.some((row) => row.status === INSTALLMENT_PAYMENT_STATUS_DUE)
  ) {
    nextDue.status = INSTALLMENT_PAYMENT_STATUS_DUE;
  }

  resolveContractStatusAfterPayment(contract);
};

/**
 * @param {Record<string, unknown> | null | undefined} user
 */
export const toInstallmentCounterpartyPayload = (user) => {
  if (!user || !user._id) {
    return null;
  }
  return {
    _id: String(user._id),
    userName: String(user.userName ?? "").trim(),
    email: String(user.email ?? "").trim(),
    userPhoneNumber: String(user.userPhoneNumber ?? "").trim(),
  };
};

/**
 * @param {Array<string | import('mongoose').Types.ObjectId>} userIds
 */
export const loadInstallmentCounterpartyMap = async (userIds) => {
  const uniqueIds = [
    ...new Set(
      userIds
        .map((id) => String(id ?? ""))
        .filter((id) => mongoose.isValidObjectId(id)),
    ),
  ];
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const rows = await UserModel.find({ _id: { $in: uniqueIds } })
    .select(INSTALLMENT_COUNTERPARTY_PUBLIC_SELECT)
    .lean();

  return new Map(
    rows.map((row) => [String(row._id), toInstallmentCounterpartyPayload(row)]),
  );
};

/**
 * @param {Array<string | import('mongoose').Types.ObjectId>} productIds
 * @param {{ statuses?: string[] }} [options]
 * @returns {Promise<Map<string, Array<NonNullable<ReturnType<typeof toInstallmentCounterpartyPayload>>>>>}
 */
export const loadInstallmentBuyersByProductIds = async (
  productIds,
  { statuses = ACTIVE_CONTRACT_STATUSES } = {},
) => {
  const uniqueProductIds = [
    ...new Set(
      productIds
        .map((id) => String(id ?? ""))
        .filter((id) => mongoose.isValidObjectId(id)),
    ),
  ];
  if (uniqueProductIds.length === 0) {
    return new Map();
  }

  const contracts = await InstallmentContractModel.find({
    productId: { $in: uniqueProductIds },
    status: { $in: statuses },
  })
    .select("productId buyerUserId")
    .lean();

  const userMap = await loadInstallmentCounterpartyMap(
    contracts.map((contract) => contract.buyerUserId),
  );

  /** @type {Map<string, Array<NonNullable<ReturnType<typeof toInstallmentCounterpartyPayload>>>>} */
  const buyersByProductId = new Map();
  for (const contract of contracts) {
    const productId = String(contract.productId);
    const buyer = userMap.get(String(contract.buyerUserId));
    if (!buyer) {
      continue;
    }

    const existingBuyers = buyersByProductId.get(productId) ?? [];
    if (existingBuyers.some((row) => row._id === buyer._id)) {
      continue;
    }

    existingBuyers.push(buyer);
    buyersByProductId.set(productId, existingBuyers);
  }

  return buyersByProductId;
};

/**
 * @param {Record<string, unknown>} payload
 * @param {Map<string, ReturnType<typeof toInstallmentCounterpartyPayload>>} userMap
 */
export const attachCounterpartiesToInstallmentContractPayload = (payload, userMap) => ({
  ...payload,
  seller: userMap.get(payload.sellerUserId) ?? null,
  buyer: userMap.get(payload.buyerUserId) ?? null,
});

/**
 * @param {{ productImageUrls?: unknown; productImageUrl?: unknown }} product
 * @returns {string | null}
 */
const resolveInstallmentProductCoverImageUrl = (product) => {
  const urls = Array.isArray(product.productImageUrls) ? product.productImageUrls : [];
  for (const url of urls) {
    const trimmed = String(url ?? "").trim();
    if (trimmed) {
      return trimmed;
    }
  }
  const legacy = String(product.productImageUrl ?? "").trim();
  return legacy || null;
};

/**
 * @param {unknown[]} productIds
 * @returns {Promise<Map<string, string | null>>}
 */
export const loadInstallmentProductImageMap = async (productIds) => {
  const uniqueProductIds = [
    ...new Set(
      productIds
        .map((id) => String(id ?? ""))
        .filter((id) => mongoose.isValidObjectId(id)),
    ),
  ];
  if (uniqueProductIds.length === 0) {
    return new Map();
  }

  const products = await ProductModel.find({ _id: { $in: uniqueProductIds } })
    .select("productImageUrls productImageUrl")
    .lean();

  /** @type {Map<string, string | null>} */
  const imageByProductId = new Map();
  for (const product of products) {
    imageByProductId.set(
      String(product._id),
      resolveInstallmentProductCoverImageUrl(product),
    );
  }
  return imageByProductId;
};

/**
 * @param {Record<string, unknown>} payload
 * @param {Map<string, string | null>} imageMap
 */
export const attachProductImageToInstallmentContractPayload = (payload, imageMap) => ({
  ...payload,
  productImageUrl: imageMap.get(String(payload.productId)) ?? null,
});

/**
 * @param {import('mongoose').Document | Record<string, unknown>} contract
 */
export const buildInstallmentContractPayload = async (contract) => {
  const plain =
    typeof contract.toObject === "function" ? contract.toObject() : contract;
  recomputeContractOverdueFlags(plain);
  const base = toInstallmentContractPayload(plain);
  const [userMap, imageMap] = await Promise.all([
    loadInstallmentCounterpartyMap([base.sellerUserId, base.buyerUserId]),
    loadInstallmentProductImageMap([base.productId]),
  ]);
  return attachProductImageToInstallmentContractPayload(
    attachCounterpartiesToInstallmentContractPayload(base, userMap),
    imageMap,
  );
};

/**
 * @param {Array<import('mongoose').Document | Record<string, unknown>>} contracts
 */
export const buildInstallmentContractPayloads = async (contracts) => {
  const plains = contracts.map((contract) =>
    typeof contract.toObject === "function" ? contract.toObject() : contract,
  );
  for (const plain of plains) {
    recomputeContractOverdueFlags(plain);
  }
  const bases = plains.map((row) => toInstallmentContractPayload(row));
  const [userMap, imageMap] = await Promise.all([
    loadInstallmentCounterpartyMap(
      bases.flatMap((row) => [row.sellerUserId, row.buyerUserId]),
    ),
    loadInstallmentProductImageMap(bases.map((row) => row.productId)),
  ]);
  return bases.map((row) =>
    attachProductImageToInstallmentContractPayload(
      attachCounterpartiesToInstallmentContractPayload(row, userMap),
      imageMap,
    ),
  );
};

/**
 * @param {Record<string, unknown>} contract
 */
export const toInstallmentContractPayload = (contract) => ({
  _id: String(contract._id),
  productId: String(contract.productId),
  programId: String(contract.programId),
  planId: String(contract.planId),
  buyerUserId: String(contract.buyerUserId),
  sellerUserId: String(contract.sellerUserId),
  orderId: contract.orderId ? String(contract.orderId) : null,
  quantity: contract.quantity,
  planTitle: contract.planTitle,
  monthsCount: contract.monthsCount,
  monthlyPaymentRub: contract.monthlyPaymentRub,
  totalAmountRub: contract.totalAmountRub,
  paidAmountRub: contract.paidAmountRub ?? 0,
  productNameAtContract: contract.productNameAtContract,
  productUnitPriceAtContract: contract.productUnitPriceAtContract,
  status: contract.status,
  payments: (contract.payments ?? []).map((payment) => ({
    _id: payment._id ? String(payment._id) : null,
    paymentIndex: payment.paymentIndex,
    amountRub: payment.amountRub,
    dueAt: payment.dueAt,
    status: payment.status,
    paidAt: payment.paidAt ?? null,
    buyerMarkedPaidAt: payment.buyerMarkedPaidAt ?? null,
    confirmedByUserId: payment.confirmedByUserId
      ? String(payment.confirmedByUserId)
      : null,
  })),
  finalDueAt: contract.finalDueAt,
  nextPaymentDueAt: contract.nextPaymentDueAt ?? null,
  hasOverduePayment: contract.hasOverduePayment === true,
  completedAt: contract.completedAt ?? null,
  cancelledAt: contract.cancelledAt ?? null,
  createdAt: contract.createdAt,
  updatedAt: contract.updatedAt,
});

/**
 * @param {Record<string, unknown>} contract
 */
export const toInstallmentContractPlanSummary = (contract) => ({
  planTitle: contract.planTitle,
  monthsCount: contract.monthsCount,
  monthlyPaymentRub: contract.monthlyPaymentRub,
  totalAmountRub: contract.totalAmountRub,
});

/**
 * @param {unknown[]} contractIds
 * @returns {Promise<Record<string, ReturnType<typeof toInstallmentContractPlanSummary>>>}
 */
export const loadInstallmentPlanSummariesByIds = async (contractIds) => {
  const ids = [
    ...new Set(
      contractIds
        .map((id) => String(id ?? ""))
        .filter((id) => mongoose.isValidObjectId(id)),
    ),
  ];

  if (ids.length === 0) {
    return {};
  }

  const rows = await InstallmentContractModel.find({
    _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
  })
    .select("planTitle monthsCount monthlyPaymentRub totalAmountRub")
    .lean();

  return Object.fromEntries(
    rows.map((row) => [String(row._id), toInstallmentContractPlanSummary(row)]),
  );
};

/**
 * @param {Record<string, unknown>} program
 */
export const toInstallmentProgramPayload = (program) => ({
  _id: String(program._id),
  productId: String(program.productId),
  sellerId: String(program.sellerId),
  isEnabled: program.isEnabled === true,
  moderationStatus: program.moderationStatus,
  moderationComment: program.moderationComment ?? "",
  reviewedBy: program.reviewedBy ? String(program.reviewedBy) : null,
  reviewedAt: program.reviewedAt ?? null,
  wasEverApproved: program.wasEverApproved === true,
  plans: (program.plans ?? []).map((plan) => ({
    _id: String(plan._id),
    title: plan.title,
    monthsCount: plan.monthsCount,
    monthlyAmountRub: plan.monthlyAmountRub,
    firstPaymentRequiredNow: plan.firstPaymentRequiredNow !== false,
  })),
  createdAt: program.createdAt,
  updatedAt: program.updatedAt,
});

/**
 * @param {string} sellerUserId
 * @param {string} productId
 * @param {string} [productName]
 */
export const notifySellerNewInstallmentContract = async (
  sellerUserId,
  productId,
  productName,
) => {
  await createUserInAppNotification({
    userId: sellerUserId,
    kind: IN_APP_NOTIFICATION_KIND_INSTALLMENT_NEW_FOR_SELLER,
    message: productName
      ? `${IN_APP_NOTIFICATION_MESSAGE_INSTALLMENT_NEW_FOR_SELLER}: ${productName}`
      : IN_APP_NOTIFICATION_MESSAGE_INSTALLMENT_NEW_FOR_SELLER,
    productId,
  });
};

/**
 * @param {string} buyerUserId
 * @param {string} productId
 */
export const notifyBuyerInstallmentReminder = async (buyerUserId, productId) => {
  await createUserInAppNotification({
    userId: buyerUserId,
    kind: IN_APP_NOTIFICATION_KIND_INSTALLMENT_PAYMENT_REMINDER,
    message: IN_APP_NOTIFICATION_MESSAGE_INSTALLMENT_PAYMENT_REMINDER,
    productId,
  });
};

/**
 * @param {string} userId
 * @param {string} productId
 */
export const notifyInstallmentOverdue = async (userId, productId) => {
  await createUserInAppNotification({
    userId,
    kind: IN_APP_NOTIFICATION_KIND_INSTALLMENT_OVERDUE,
    message: IN_APP_NOTIFICATION_MESSAGE_INSTALLMENT_OVERDUE,
    productId,
  });
};

/**
 * @param {string} sellerUserId
 * @param {string} productId
 */
export const notifySellerEarlyPayoff = async (sellerUserId, productId) => {
  await createUserInAppNotification({
    userId: sellerUserId,
    kind: IN_APP_NOTIFICATION_KIND_INSTALLMENT_EARLY_PAYOFF,
    message: IN_APP_NOTIFICATION_MESSAGE_INSTALLMENT_EARLY_PAYOFF,
    productId,
  });
};

export const processInstallmentCronTasks = async () => {
  const now = new Date();
  const reminderThreshold = new Date(now.getTime() + INSTALLMENT_REMINDER_MS);

  const contracts = await InstallmentContractModel.find({
    status: {
      $in: [
        INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
        INSTALLMENT_CONTRACT_STATUS_ACTIVE,
      ],
    },
  }).lean();

  for (const contract of contracts) {
    let changed = false;
    for (const payment of contract.payments ?? []) {
      if (
        payment.status === INSTALLMENT_PAYMENT_STATUS_DUE &&
        payment.dueAt <= reminderThreshold &&
        payment.dueAt > now &&
        !payment.reminderSentAt
      ) {
        await notifyBuyerInstallmentReminder(
          String(contract.buyerUserId),
          String(contract.productId),
        );
        await InstallmentContractModel.updateOne(
          {
            _id: contract._id,
            "payments._id": payment._id,
          },
          { $set: { "payments.$.reminderSentAt": now } },
        );
      }

      const isPastDue = payment.dueAt < now;

      if (payment.status === INSTALLMENT_PAYMENT_STATUS_DUE && isPastDue) {
        await InstallmentContractModel.updateOne(
          {
            _id: contract._id,
            "payments._id": payment._id,
          },
          {
            $set: {
              "payments.$.status": INSTALLMENT_PAYMENT_STATUS_OVERDUE,
              hasOverduePayment: true,
            },
          },
        );
        if (!payment.overdueNotifiedAt) {
          await notifyInstallmentOverdue(
            String(contract.buyerUserId),
            String(contract.productId),
          );
          await notifyInstallmentOverdue(
            String(contract.sellerUserId),
            String(contract.productId),
          );
          await InstallmentContractModel.updateOne(
            {
              _id: contract._id,
              "payments._id": payment._id,
            },
            { $set: { "payments.$.overdueNotifiedAt": now } },
          );
        }
        changed = true;
      } else if (
        payment.status === INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION &&
        isPastDue
      ) {
        await InstallmentContractModel.updateOne(
          { _id: contract._id },
          { $set: { hasOverduePayment: true } },
        );
        changed = true;
      }
    }
    if (changed) {
      await syncProductInstallmentEnabledFlag(String(contract.productId));
    }
  }
};

/**
 * @param {import('mongoose').Types.ObjectId | string} buyerUserId
 */
export const countInstallmentBuyerActionItems = async (buyerUserId) => {
  const contracts = await InstallmentContractModel.find({
    buyerUserId,
    status: { $in: ACTIVE_CONTRACT_STATUSES },
  });

  const orderIds = [
    ...new Set(
      contracts
        .map((row) => (row.orderId ? String(row.orderId) : ""))
        .filter(Boolean),
    ),
  ];
  const orders =
    orderIds.length > 0
      ? await OrderModel.find({ _id: { $in: orderIds } })
          .select("status items.status")
          .lean()
      : [];
  const orderById = new Map(orders.map((order) => [String(order._id), order]));

  let count = 0;
  for (const contract of contracts) {
    const order = contract.orderId
      ? orderById.get(String(contract.orderId))
      : null;
    if (!isInstallmentOrderAcceptedBySeller(order)) {
      continue;
    }
    await repairInstallmentPaymentStatusDrift(contract);
    recomputeContractOverdueFlags(contract);
    for (const payment of contract.payments ?? []) {
      if (canBuyerMarkInstallmentPayment(contract, payment)) {
        count += 1;
      }
    }
  }
  return count;
};

/**
 * @param {import('mongoose').Types.ObjectId | string} sellerUserId
 */
export const countInstallmentSellerActionItems = async (sellerUserId) => {
  const contracts = await InstallmentContractModel.find({
    sellerUserId,
    status: { $in: ACTIVE_CONTRACT_STATUSES },
  });

  const orderIds = [
    ...new Set(
      contracts
        .map((row) => (row.orderId ? String(row.orderId) : ""))
        .filter(Boolean),
    ),
  ];
  const orders =
    orderIds.length > 0
      ? await OrderModel.find({ _id: { $in: orderIds } })
          .select("status items.status")
          .lean()
      : [];
  const orderById = new Map(orders.map((order) => [String(order._id), order]));

  let count = 0;
  for (const contract of contracts) {
    const order = contract.orderId
      ? orderById.get(String(contract.orderId))
      : null;
    if (!isInstallmentOrderAcceptedBySeller(order)) {
      continue;
    }
    await repairInstallmentPaymentStatusDrift(contract);
    recomputeContractOverdueFlags(contract);
    if (isEarlyPayoffPendingConfirmation(contract)) {
      count += 1;
      continue;
    }
    const pendingConfirmations = (contract.payments ?? []).filter(
      (payment) => payment.status === INSTALLMENT_PAYMENT_STATUS_PENDING_CONFIRMATION,
    ).length;
    if (pendingConfirmations > 0) {
      count += pendingConfirmations;
      continue;
    }
    count += 1;
  }
  return count;
};

/**
 * @param {string | undefined} statusFilter
 */
export const resolveInstallmentContractStatusQuery = (statusFilter) => {
  if (!statusFilter) {
    return {};
  }
  if (statusFilter === INSTALLMENT_SALES_LIST_FILTER_IN_PROGRESS) {
    return {
      status: {
        $in: [
          INSTALLMENT_CONTRACT_STATUS_PENDING_FIRST_PAYMENT,
          INSTALLMENT_CONTRACT_STATUS_ACTIVE,
        ],
      },
    };
  }
  return { status: statusFilter };
};
