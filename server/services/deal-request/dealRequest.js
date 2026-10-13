import {
  CATEGORY_DEAL_TYPE_SERVICE,
  CATEGORY_DEAL_TYPE_VIEWING,
  DEAL_REQUEST_ACTION_ACCEPT,
  DEAL_REQUEST_ACTION_CANCEL,
  DEAL_REQUEST_ACTION_CONFIRM,
  DEAL_REQUEST_ACTION_DECLINE,
  DEAL_REQUEST_AUTO_CONFIRM_MS,
  DEAL_REQUEST_MAX_OPEN_PER_BUYER,
  DEAL_REQUEST_OPEN_STATUSES,
  DEAL_REQUEST_RESPONSE_TTL_MS,
  DEAL_REQUEST_ROLE_BUYER,
  DEAL_REQUEST_ROLE_SELLER,
  DEAL_REQUEST_STATUS_ACCEPTED,
  DEAL_REQUEST_STATUS_CANCELLED,
  DEAL_REQUEST_STATUS_COMPLETED,
  DEAL_REQUEST_STATUS_DECLINED,
  DEAL_REQUEST_STATUS_DONE,
  DEAL_REQUEST_STATUS_PENDING,
  isDealRequestContactOpen,
  isProductServicePriceFixed,
  isSellerPhoneOpenBeforeRequest,
  normalizeCategoryDealType,
  resolveDealRequestActions,
  resolveDealRequestStatusForOutcome,
} from "@molha/api-contract";

import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { USER_BLOCK_CART_ORDER_MESSAGE } from "../../constants/userBlockConstants.js";
import { AppError } from "../../errors/AppError.js";
import { DealRequestModel, ProductModel, UserModel } from "../../models/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { getSellerIdsBlockingBuyer } from "../user/userBlockHelpers.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";

export const DEAL_REQUEST_NOTIFICATION_KIND = "deal_request";

const REQUEST_NOT_FOUND_MESSAGE = "Заявка не найдена";
const REQUEST_STALE_MESSAGE = "Заявка уже изменилась — обновите список";
const PRODUCT_UNAVAILABLE_MESSAGE = "Объявление недоступно";
const PRODUCT_NOT_DEAL_MESSAGE =
  "По этому объявлению заявка не нужна — его можно заказать через корзину";
const OWN_PRODUCT_MESSAGE = "Нельзя оставить заявку на своё объявление";
const DUPLICATE_REQUEST_MESSAGE = "Вы уже оставили заявку на это объявление";
const TOO_MANY_OPEN_MESSAGE =
  "Слишком много заявок без ответа. Дождитесь ответа продавцов или отмените лишние";
const SERVICE_PRICE_REQUIRED_MESSAGE = "Назовите итоговую цену услуги";
const SELLER_PHONE_LOCKED_MESSAGE =
  "Телефон откроется, когда исполнитель примет заявку";
const CLOSED_BY_DEAL_REASON = "Объявление закрыто: сделка состоялась";

const NOUN_BY_KIND = {
  [CATEGORY_DEAL_TYPE_VIEWING]: "осмотр",
  [CATEGORY_DEAL_TYPE_SERVICE]: "услугу",
};

/** @param {Date | null | undefined} value */
const toIso = (value) => (value instanceof Date ? value.toISOString() : null);

/** @param {unknown} raw */
const toPhoneOrNull = (raw) => {
  const phone = String(raw ?? "").trim();
  return phone || null;
};

/**
 * Уведомление — побочный эффект: его сбой не должен откатывать уже
 * сохранённое решение по заявке, но и пропасть молча не должен.
 *
 * @param {{ userId: unknown; actorUserId: unknown; message: string }} params
 */
const notify = async ({ userId, actorUserId, message }) => {
  try {
    await createUserInAppNotification({
      userId: String(userId),
      kind: DEAL_REQUEST_NOTIFICATION_KIND,
      message,
      actorUserId: actorUserId ? String(actorUserId) : null,
    });
  } catch (error) {
    logServerEvent("error", {
      event: "deal_request_notify_failed",
      userId: String(userId),
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * @param {Record<string, any>[]} rows
 * @param {string} role
 */
const toDealRequestPayloads = async (rows, role) => {
  const counterpartyField = role === DEAL_REQUEST_ROLE_SELLER ? "buyerId" : "sellerId";
  const counterpartyIds = [
    ...new Set(rows.map((row) => String(row[counterpartyField]))),
  ];
  const users = await UserModel.find({ _id: { $in: counterpartyIds } })
    .select("userName userPhoneNumber")
    .lean();
  const userById = new Map(users.map((user) => [String(user._id), user]));

  return rows.map((row) => {
    const counterpartyId = String(row[counterpartyField]);
    const counterparty = userById.get(counterpartyId);
    // Покупателю осмотра телефон продавца виден и без заявки — прятать его
    // в самой заявке было бы бессмысленно.
    const phoneOpen =
      isDealRequestContactOpen(row.status) ||
      (role === DEAL_REQUEST_ROLE_BUYER && isSellerPhoneOpenBeforeRequest(row.kind));

    return {
      id: String(row._id),
      kind: row.kind,
      status: row.status,
      role,
      product: {
        id: String(row.productId),
        name: String(row.productNameAtRequest ?? ""),
        imageUrl: row.productImageUrlAtRequest || null,
        priceRub:
          typeof row.productPriceRubAtRequest === "number"
            ? row.productPriceRubAtRequest
            : null,
      },
      counterparty: {
        id: counterpartyId,
        name: String(counterparty?.userName ?? ""),
        phone: phoneOpen ? toPhoneOrNull(counterparty?.userPhoneNumber) : null,
      },
      preferredAt: toIso(row.preferredAt) ?? "",
      agreedAt: toIso(row.agreedAt),
      quotedPriceRub:
        typeof row.quotedPriceRub === "number" ? row.quotedPriceRub : null,
      comment: String(row.comment ?? ""),
      address: String(row.address ?? ""),
      declineReason: String(row.declineReason ?? ""),
      expiresAt:
        row.status === DEAL_REQUEST_STATUS_PENDING ? toIso(row.expiresAt) : null,
      createdAt: toIso(row.createdAt) ?? "",
      actions: resolveDealRequestActions({ status: row.status, kind: row.kind, role }),
    };
  });
};

/**
 * @param {Record<string, any>} row
 * @param {string} role
 */
const toDealRequestPayload = async (row, role) =>
  (await toDealRequestPayloads([row], role))[0];

/**
 * Атомарный переход: статус проверяется в самом запросе к базе, поэтому два
 * одновременных решения по одной заявке не могут пройти оба.
 *
 * @param {{
 *   requestId: string;
 *   userId: string;
 *   role: string;
 *   action: string;
 *   $set: Record<string, unknown>;
 * }} params
 */
const transitionDealRequest = async ({ requestId, userId, role, action, $set }) => {
  const ownerField = role === DEAL_REQUEST_ROLE_SELLER ? "sellerId" : "buyerId";
  const current = await DealRequestModel.findOne({
    _id: requestId,
    [ownerField]: userId,
  })
    .select("status kind")
    .lean();
  if (!current) {
    throw new AppError(404, REQUEST_NOT_FOUND_MESSAGE);
  }
  const allowed = resolveDealRequestActions({
    status: current.status,
    kind: current.kind,
    role,
  });
  if (!allowed.includes(action)) {
    throw new AppError(409, REQUEST_STALE_MESSAGE);
  }

  const nextStatus = String($set.status);
  const updated = await DealRequestModel.findOneAndUpdate(
    { _id: requestId, [ownerField]: userId, status: current.status },
    { $set: { ...$set, isOpen: DEAL_REQUEST_OPEN_STATUSES.includes(nextStatus) } },
    { returnDocument: "after", lean: true },
  );
  if (!updated) {
    throw new AppError(409, REQUEST_STALE_MESSAGE);
  }
  return updated;
};

/**
 * @param {{
 *   userId: string;
 *   productId: string;
 *   preferredAt: Date;
 *   comment?: string;
 *   address?: string;
 * }} params
 */
export const createDealRequest = async ({
  userId,
  productId,
  preferredAt,
  comment = "",
  address = "",
}) => {
  const product = await ProductModel.findOne({
    _id: productId,
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: { $ne: false },
  })
    .select(
      "productName productPrice productImageUrls productSeller productDealType productServicePriceMode",
    )
    .lean();
  if (!product) {
    throw new AppError(404, PRODUCT_UNAVAILABLE_MESSAGE);
  }

  const kind = normalizeCategoryDealType(product.productDealType);
  if (!NOUN_BY_KIND[kind]) {
    throw new AppError(400, PRODUCT_NOT_DEAL_MESSAGE);
  }
  const sellerId = String(product.productSeller);
  if (sellerId === String(userId)) {
    throw new AppError(400, OWN_PRODUCT_MESSAGE);
  }
  const blocking = await getSellerIdsBlockingBuyer(userId, [sellerId]);
  if (blocking.has(sellerId)) {
    throw new AppError(403, USER_BLOCK_CART_ORDER_MESSAGE);
  }

  const openCount = await DealRequestModel.countDocuments({
    buyerId: userId,
    isOpen: true,
  });
  if (openCount >= DEAL_REQUEST_MAX_OPEN_PER_BUYER) {
    throw new AppError(429, TOO_MANY_OPEN_MESSAGE);
  }

  let created;
  try {
    created = await DealRequestModel.create({
      productId,
      sellerId,
      buyerId: userId,
      kind,
      preferredAt,
      comment,
      // Осмотр проходит у продавца — адрес покупателя там не нужен.
      address: kind === CATEGORY_DEAL_TYPE_SERVICE ? address : "",
      expiresAt: new Date(Date.now() + DEAL_REQUEST_RESPONSE_TTL_MS),
      productNameAtRequest: String(product.productName ?? ""),
      productImageUrlAtRequest: String(product.productImageUrls?.[0] ?? ""),
      // «От 1 500 ₽» и «договорная» — не цена сделки: её назовёт исполнитель,
      // принимая заявку. Число из объявления в заявке только сбивало бы с толку.
      productPriceRubAtRequest:
        typeof product.productPrice === "number" &&
        (kind !== CATEGORY_DEAL_TYPE_SERVICE || isProductServicePriceFixed(product))
          ? product.productPrice
          : null,
    });
  } catch (error) {
    // Уникальный индекс ловит гонку двух одновременных отправок формы.
    if (error?.code === 11000) {
      throw new AppError(409, DUPLICATE_REQUEST_MESSAGE);
    }
    throw error;
  }

  await notify({
    userId: sellerId,
    actorUserId: userId,
    message: `Новая заявка на ${NOUN_BY_KIND[kind]}: «${created.productNameAtRequest}»`,
  });

  return {
    request: await toDealRequestPayload(created.toObject(), DEAL_REQUEST_ROLE_BUYER),
  };
};

/**
 * Параметры приводятся здесь, а не берутся готовыми из валидации: в Express 5
 * `req.query` — геттер, и приведённые схемой значения до контроллера не
 * доходят. Страница приезжает строкой "1", а без роли — `undefined`.
 *
 * @param {{ userId: string; role?: unknown; page?: unknown; limit?: unknown }} params
 */
export const listMyDealRequests = async ({
  userId,
  role: rawRole,
  page: rawPage,
  limit: rawLimit,
}) => {
  const role =
    rawRole === DEAL_REQUEST_ROLE_SELLER
      ? DEAL_REQUEST_ROLE_SELLER
      : DEAL_REQUEST_ROLE_BUYER;
  const page = Math.max(1, Math.floor(Number(rawPage) || 1));
  const limit = Math.min(100, Math.max(1, Math.floor(Number(rawLimit) || 10)));
  const ownerField = role === DEAL_REQUEST_ROLE_SELLER ? "sellerId" : "buyerId";
  const filter = { [ownerField]: userId };

  const [rows, total, sellerPending, buyerToConfirm] = await Promise.all([
    DealRequestModel.find(filter)
      // Живые заявки сверху: по ним от пользователя ждут действия.
      .sort({ isOpen: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    DealRequestModel.countDocuments(filter),
    DealRequestModel.countDocuments({
      sellerId: userId,
      status: DEAL_REQUEST_STATUS_PENDING,
    }),
    DealRequestModel.countDocuments({
      buyerId: userId,
      status: DEAL_REQUEST_STATUS_DONE,
    }),
  ]);

  return {
    requests: await toDealRequestPayloads(rows, role),
    page,
    limit,
    total,
    pendingActionCount: sellerPending + buyerToConfirm,
  };
};

/**
 * @param {{
 *   userId: string;
 *   requestId: string;
 *   agreedAt?: Date;
 *   quotedPriceRub?: number;
 * }} params
 */
export const acceptDealRequest = async ({
  userId,
  requestId,
  agreedAt,
  quotedPriceRub,
}) => {
  const current = await DealRequestModel.findOne({ _id: requestId, sellerId: userId })
    .select("kind preferredAt")
    .lean();
  if (!current) {
    throw new AppError(404, REQUEST_NOT_FOUND_MESSAGE);
  }
  const isService = current.kind === CATEGORY_DEAL_TYPE_SERVICE;
  // Клиент услуги соглашается на конкретную сумму, а не на «договоримся».
  if (isService && quotedPriceRub == null) {
    throw new AppError(400, SERVICE_PRICE_REQUIRED_MESSAGE);
  }

  const updated = await transitionDealRequest({
    requestId,
    userId,
    role: DEAL_REQUEST_ROLE_SELLER,
    action: DEAL_REQUEST_ACTION_ACCEPT,
    $set: {
      status: DEAL_REQUEST_STATUS_ACCEPTED,
      agreedAt: agreedAt ?? current.preferredAt,
      quotedPriceRub: isService ? quotedPriceRub : null,
      expiresAt: null,
    },
  });

  await notify({
    userId: updated.buyerId,
    actorUserId: userId,
    message: isService
      ? `Исполнитель принял заявку «${updated.productNameAtRequest}» и назвал цену: ${updated.quotedPriceRub} ₽`
      : `Продавец подтвердил осмотр «${updated.productNameAtRequest}»`,
  });

  return { request: await toDealRequestPayload(updated, DEAL_REQUEST_ROLE_SELLER) };
};

/**
 * @param {{ userId: string; requestId: string; reason?: string }} params
 */
export const declineDealRequest = async ({ userId, requestId, reason = "" }) => {
  const updated = await transitionDealRequest({
    requestId,
    userId,
    role: DEAL_REQUEST_ROLE_SELLER,
    action: DEAL_REQUEST_ACTION_DECLINE,
    $set: {
      status: DEAL_REQUEST_STATUS_DECLINED,
      declineReason: reason,
      expiresAt: null,
    },
  });

  await notify({
    userId: updated.buyerId,
    actorUserId: userId,
    message: `Заявка «${updated.productNameAtRequest}» отклонена${reason ? `: ${reason}` : ""}`,
  });

  return { request: await toDealRequestPayload(updated, DEAL_REQUEST_ROLE_SELLER) };
};

/**
 * @param {{ userId: string; requestId: string }} params
 */
export const cancelDealRequest = async ({ userId, requestId }) => {
  const updated = await transitionDealRequest({
    requestId,
    userId,
    role: DEAL_REQUEST_ROLE_BUYER,
    action: DEAL_REQUEST_ACTION_CANCEL,
    $set: { status: DEAL_REQUEST_STATUS_CANCELLED, expiresAt: null },
  });

  await notify({
    userId: updated.sellerId,
    actorUserId: userId,
    message: `Покупатель отменил заявку «${updated.productNameAtRequest}»`,
  });

  return { request: await toDealRequestPayload(updated, DEAL_REQUEST_ROLE_BUYER) };
};

/**
 * Сделка по осмотру состоялась: объявление уходит с витрины, остальные
 * желающие получают отказ. Иначе проданную машину продолжали бы смотреть.
 *
 * @param {Record<string, any>} request
 */
const closeListingAfterDeal = async (request) => {
  await ProductModel.updateOne(
    { _id: request.productId, productSeller: request.sellerId },
    { $set: { productIsAvailable: false } },
  );

  const others = await DealRequestModel.find({
    productId: request.productId,
    isOpen: true,
    _id: { $ne: request._id },
  })
    .select("buyerId productNameAtRequest")
    .lean();
  if (others.length === 0) {
    return;
  }

  await DealRequestModel.updateMany(
    { _id: { $in: others.map((row) => row._id) }, isOpen: true },
    {
      $set: {
        status: DEAL_REQUEST_STATUS_DECLINED,
        isOpen: false,
        declineReason: CLOSED_BY_DEAL_REASON,
        expiresAt: null,
      },
    },
  );
  for (const other of others) {
    await notify({
      userId: other.buyerId,
      actorUserId: request.sellerId,
      message: `Заявка «${other.productNameAtRequest}» закрыта: объявление больше не актуально`,
    });
  }
};

/**
 * @param {{ userId: string; requestId: string; outcome: string }} params
 */
export const setDealRequestOutcome = async ({ userId, requestId, outcome }) => {
  const current = await DealRequestModel.findOne({ _id: requestId, sellerId: userId })
    .select("kind")
    .lean();
  if (!current) {
    throw new AppError(404, REQUEST_NOT_FOUND_MESSAGE);
  }
  const status = resolveDealRequestStatusForOutcome({ kind: current.kind, outcome });

  const updated = await transitionDealRequest({
    requestId,
    userId,
    role: DEAL_REQUEST_ROLE_SELLER,
    action: outcome,
    $set: {
      status,
      autoConfirmAt:
        status === DEAL_REQUEST_STATUS_DONE
          ? new Date(Date.now() + DEAL_REQUEST_AUTO_CONFIRM_MS)
          : null,
    },
  });

  if (status === DEAL_REQUEST_STATUS_DONE) {
    await notify({
      userId: updated.buyerId,
      actorUserId: userId,
      message: `Исполнитель отметил «${updated.productNameAtRequest}» выполненной — подтвердите`,
    });
  }
  if (
    status === DEAL_REQUEST_STATUS_COMPLETED &&
    updated.kind === CATEGORY_DEAL_TYPE_VIEWING
  ) {
    await closeListingAfterDeal(updated);
  }

  return { request: await toDealRequestPayload(updated, DEAL_REQUEST_ROLE_SELLER) };
};

/**
 * @param {{ userId: string; requestId: string }} params
 */
export const confirmDealRequest = async ({ userId, requestId }) => {
  const updated = await transitionDealRequest({
    requestId,
    userId,
    role: DEAL_REQUEST_ROLE_BUYER,
    action: DEAL_REQUEST_ACTION_CONFIRM,
    $set: { status: DEAL_REQUEST_STATUS_COMPLETED, autoConfirmAt: null },
  });

  await notify({
    userId: updated.sellerId,
    actorUserId: userId,
    message: `Клиент подтвердил выполнение «${updated.productNameAtRequest}»`,
  });

  return { request: await toDealRequestPayload(updated, DEAL_REQUEST_ROLE_BUYER) };
};

/**
 * Телефон продавца для кнопки «Показать телефон» в объявлении.
 *
 * @param {{ userId: string; productId: string }} params
 */
export const getDealRequestSellerContact = async ({ userId, productId }) => {
  const product = await ProductModel.findOne({
    _id: productId,
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: { $ne: false },
  })
    .select("productSeller productDealType")
    .lean();
  if (!product) {
    throw new AppError(404, PRODUCT_UNAVAILABLE_MESSAGE);
  }
  const kind = normalizeCategoryDealType(product.productDealType);
  if (!NOUN_BY_KIND[kind]) {
    throw new AppError(400, PRODUCT_NOT_DEAL_MESSAGE);
  }

  const sellerId = String(product.productSeller);
  if (!isSellerPhoneOpenBeforeRequest(kind)) {
    const accepted = await DealRequestModel.exists({
      productId,
      buyerId: userId,
      status: { $in: [DEAL_REQUEST_STATUS_ACCEPTED, DEAL_REQUEST_STATUS_DONE] },
    });
    if (!accepted) {
      throw new AppError(403, SELLER_PHONE_LOCKED_MESSAGE);
    }
  }
  const blocking = await getSellerIdsBlockingBuyer(userId, [sellerId]);
  if (blocking.has(sellerId)) {
    throw new AppError(403, USER_BLOCK_CART_ORDER_MESSAGE);
  }

  const seller = await UserModel.findById(sellerId).select("userPhoneNumber").lean();
  return { phone: toPhoneOrNull(seller?.userPhoneNumber) };
};
