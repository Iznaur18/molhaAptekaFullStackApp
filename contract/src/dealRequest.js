import { z } from "zod";

import { ADDRESS_LINE_MAX_LENGTH } from "./userFields.js";
import {
  CATEGORY_DEAL_TYPE_SERVICE,
  CATEGORY_DEAL_TYPE_VIEWING,
  CATEGORY_DEAL_TYPES_WITHOUT_CART,
} from "./categoryDealType.js";
import { mongoIdSchema } from "./mongoId.js";
import { optionalLimitQuery, optionalPageQuery } from "./queryHelpers.js";

/**
 * Заявка — сделка по объявлению без корзины: осмотр авто или дома, услуга.
 *
 * Отдельно от заказа намеренно. Статусы заказа завязаны на оплату, эскроу и
 * доставку, а здесь нет ни того, ни другого: стороны договариваются о встрече
 * и рассчитываются между собой.
 */
export const DEAL_REQUEST_KINDS = CATEGORY_DEAL_TYPES_WITHOUT_CART;

export const DEAL_REQUEST_STATUS_PENDING = "pending";
export const DEAL_REQUEST_STATUS_ACCEPTED = "accepted";
export const DEAL_REQUEST_STATUS_DECLINED = "declined";
export const DEAL_REQUEST_STATUS_CANCELLED = "cancelled";
export const DEAL_REQUEST_STATUS_EXPIRED = "expired";
/** Исполнитель отметил услугу выполненной и ждёт подтверждения клиента. */
export const DEAL_REQUEST_STATUS_DONE = "done";
export const DEAL_REQUEST_STATUS_COMPLETED = "completed";
export const DEAL_REQUEST_STATUS_NO_DEAL = "no_deal";
export const DEAL_REQUEST_STATUS_NO_SHOW = "no_show";

export const DEAL_REQUEST_STATUSES = [
  DEAL_REQUEST_STATUS_PENDING,
  DEAL_REQUEST_STATUS_ACCEPTED,
  DEAL_REQUEST_STATUS_DECLINED,
  DEAL_REQUEST_STATUS_CANCELLED,
  DEAL_REQUEST_STATUS_EXPIRED,
  DEAL_REQUEST_STATUS_DONE,
  DEAL_REQUEST_STATUS_COMPLETED,
  DEAL_REQUEST_STATUS_NO_DEAL,
  DEAL_REQUEST_STATUS_NO_SHOW,
];

/** Заявка ещё жива: по ней кто-то должен что-то сделать. */
export const DEAL_REQUEST_OPEN_STATUSES = [
  DEAL_REQUEST_STATUS_PENDING,
  DEAL_REQUEST_STATUS_ACCEPTED,
  DEAL_REQUEST_STATUS_DONE,
];

export const DEAL_REQUEST_STATUS_LABELS_RU = Object.freeze({
  [DEAL_REQUEST_STATUS_PENDING]: "Ждёт ответа",
  [DEAL_REQUEST_STATUS_ACCEPTED]: "Договорились",
  [DEAL_REQUEST_STATUS_DECLINED]: "Отклонена",
  [DEAL_REQUEST_STATUS_CANCELLED]: "Отменена",
  [DEAL_REQUEST_STATUS_EXPIRED]: "Продавец не ответил",
  [DEAL_REQUEST_STATUS_DONE]: "Ждёт подтверждения",
  [DEAL_REQUEST_STATUS_COMPLETED]: "Состоялась",
  [DEAL_REQUEST_STATUS_NO_DEAL]: "Не договорились",
  [DEAL_REQUEST_STATUS_NO_SHOW]: "Встреча не состоялась",
});

export const DEAL_REQUEST_ROLE_BUYER = "buyer";
export const DEAL_REQUEST_ROLE_SELLER = "seller";
export const DEAL_REQUEST_ROLES = [DEAL_REQUEST_ROLE_BUYER, DEAL_REQUEST_ROLE_SELLER];

export const DEAL_REQUEST_ACTION_ACCEPT = "accept";
export const DEAL_REQUEST_ACTION_DECLINE = "decline";
export const DEAL_REQUEST_ACTION_CANCEL = "cancel";
export const DEAL_REQUEST_ACTION_CONFIRM = "confirm";
/** Итоги встречи, которые ставит продавец. */
export const DEAL_REQUEST_OUTCOME_COMPLETED = "completed";
export const DEAL_REQUEST_OUTCOME_NO_DEAL = "no_deal";
export const DEAL_REQUEST_OUTCOME_NO_SHOW = "no_show";
export const DEAL_REQUEST_OUTCOMES = [
  DEAL_REQUEST_OUTCOME_COMPLETED,
  DEAL_REQUEST_OUTCOME_NO_DEAL,
  DEAL_REQUEST_OUTCOME_NO_SHOW,
];

export const DEAL_REQUEST_COMMENT_MAX_LENGTH = 500;
export const DEAL_REQUEST_DECLINE_REASON_MAX_LENGTH = 200;
/** Синхрон с `PRODUCT_PRICE_RUB_MAX` в productWrite (без циклического import). */
export const DEAL_REQUEST_QUOTED_PRICE_RUB_MAX = 999_999_999;
/** Сколько продавец может молчать, прежде чем заявка сгорит. */
export const DEAL_REQUEST_RESPONSE_TTL_MS = 24 * 60 * 60 * 1000;
/** Сколько клиент может молчать после «выполнено», прежде чем услуга закроется сама. */
export const DEAL_REQUEST_AUTO_CONFIRM_MS = 3 * 24 * 60 * 60 * 1000;
/** Дальше этого встречу не назначить: объявление за это время устареет. */
export const DEAL_REQUEST_MAX_AHEAD_MS = 60 * 24 * 60 * 60 * 1000;
/** Защита от рассылки заявок по всему каталогу. */
export const DEAL_REQUEST_MAX_OPEN_PER_BUYER = 20;

export const DEAL_REQUEST_TIME_IN_PAST_MESSAGE = "Выберите время в будущем";
export const DEAL_REQUEST_TIME_TOO_FAR_MESSAGE =
  "Встречу можно назначить не дальше чем на 60 дней вперёд";

/**
 * @param {Date} value
 * @param {import("zod").RefinementCtx} ctx
 */
const assertMeetingTimeWindow = (value, ctx) => {
  const now = Date.now();
  if (value.getTime() <= now) {
    ctx.addIssue({ code: "custom", message: DEAL_REQUEST_TIME_IN_PAST_MESSAGE });
  } else if (value.getTime() > now + DEAL_REQUEST_MAX_AHEAD_MS) {
    ctx.addIssue({ code: "custom", message: DEAL_REQUEST_TIME_TOO_FAR_MESSAGE });
  }
};

const meetingTimeSchema = z.coerce
  .date({ message: "Укажите дату и время" })
  .superRefine(assertMeetingTimeWindow);

const trimmedOptionalText = (max) =>
  z
    .string()
    .trim()
    .max(max, `Не длиннее ${max} символов`)
    .optional()
    .transform((value) => value ?? "");

export const dealRequestIdParamsSchema = z.object({ requestId: mongoIdSchema });
export const dealRequestProductIdParamsSchema = z.object({ productId: mongoIdSchema });

export const createDealRequestBodySchema = z.object({
  productId: mongoIdSchema,
  preferredAt: meetingTimeSchema,
  comment: trimmedOptionalText(DEAL_REQUEST_COMMENT_MAX_LENGTH),
  /** Куда приехать исполнителю; для осмотра не нужен — место задаёт продавец. */
  address: trimmedOptionalText(ADDRESS_LINE_MAX_LENGTH),
});

export const acceptDealRequestBodySchema = z
  .object({
    /** Пусто — продавец согласен на время покупателя. */
    agreedAt: meetingTimeSchema.optional(),
    /** Итоговая цена услуги; для осмотра не используется. */
    quotedPriceRub: z.coerce
      .number()
      .int()
      .min(1, "Цена должна быть больше 0")
      .max(DEAL_REQUEST_QUOTED_PRICE_RUB_MAX)
      .optional(),
  })
  .default({});

export const declineDealRequestBodySchema = z
  .object({ reason: trimmedOptionalText(DEAL_REQUEST_DECLINE_REASON_MAX_LENGTH) })
  .default({ reason: "" });

export const dealRequestOutcomeBodySchema = z.object({
  outcome: z.enum(DEAL_REQUEST_OUTCOMES),
});

export const listMyDealRequestsQuerySchema = z.object({
  role: z.enum(DEAL_REQUEST_ROLES).optional().default(DEAL_REQUEST_ROLE_BUYER),
  page: optionalPageQuery,
  limit: optionalLimitQuery,
});

const dealRequestActionSchema = z.enum([
  DEAL_REQUEST_ACTION_ACCEPT,
  DEAL_REQUEST_ACTION_DECLINE,
  DEAL_REQUEST_ACTION_CANCEL,
  DEAL_REQUEST_ACTION_CONFIRM,
  ...DEAL_REQUEST_OUTCOMES,
]);

export const dealRequestSchema = z.object({
  id: z.string(),
  kind: z.enum(DEAL_REQUEST_KINDS),
  status: z.enum(DEAL_REQUEST_STATUSES),
  role: z.enum(DEAL_REQUEST_ROLES),
  product: z.object({
    id: z.string(),
    name: z.string(),
    imageUrl: z.string().nullable(),
    priceRub: z.number().nullable(),
  }),
  counterparty: z.object({
    id: z.string(),
    name: z.string(),
    /** `null`, пока телефон этой стороне не открыт или не указан. */
    phone: z.string().nullable(),
  }),
  preferredAt: z.string(),
  agreedAt: z.string().nullable(),
  quotedPriceRub: z.number().nullable(),
  comment: z.string(),
  address: z.string(),
  declineReason: z.string(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
  actions: z.array(dealRequestActionSchema),
});

export const dealRequestDataSchema = z.object({ request: dealRequestSchema });

export const myDealRequestsDataSchema = z.object({
  requests: z.array(dealRequestSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  /** Сколько заявок ждут действия этого пользователя — для бейджа в меню. */
  pendingActionCount: z.number(),
});

export const dealRequestSellerContactDataSchema = z.object({
  phone: z.string().nullable(),
});

/**
 * Что участник может сделать с заявкой прямо сейчас.
 *
 * Одна таблица для сервера и клиентов: сервер по ней проверяет право на
 * действие, клиент — рисует кнопки. Разойтись им негде.
 *
 * @param {{ status: string; kind: string; role: string }} params
 * @returns {string[]}
 */
export const resolveDealRequestActions = ({ status, kind, role }) => {
  if (role === DEAL_REQUEST_ROLE_SELLER) {
    if (status === DEAL_REQUEST_STATUS_PENDING) {
      return [DEAL_REQUEST_ACTION_ACCEPT, DEAL_REQUEST_ACTION_DECLINE];
    }
    if (status === DEAL_REQUEST_STATUS_ACCEPTED) {
      return [...DEAL_REQUEST_OUTCOMES];
    }
    return [];
  }

  if (role === DEAL_REQUEST_ROLE_BUYER) {
    if (
      status === DEAL_REQUEST_STATUS_PENDING ||
      status === DEAL_REQUEST_STATUS_ACCEPTED
    ) {
      return [DEAL_REQUEST_ACTION_CANCEL];
    }
    if (status === DEAL_REQUEST_STATUS_DONE && kind === CATEGORY_DEAL_TYPE_SERVICE) {
      return [DEAL_REQUEST_ACTION_CONFIRM];
    }
  }
  return [];
};

/**
 * Во что превращается итог «состоялась» от продавца.
 *
 * Осмотр закрывается сразу: машину либо купили, либо нет. Услуге нужно слово
 * клиента — иначе «выполнено» ставил бы сам исполнитель себе же.
 *
 * @param {{ kind: string; outcome: string }} params
 */
export const resolveDealRequestStatusForOutcome = ({ kind, outcome }) => {
  if (outcome === DEAL_REQUEST_OUTCOME_COMPLETED) {
    return kind === CATEGORY_DEAL_TYPE_SERVICE
      ? DEAL_REQUEST_STATUS_DONE
      : DEAL_REQUEST_STATUS_COMPLETED;
  }
  return outcome === DEAL_REQUEST_OUTCOME_NO_SHOW
    ? DEAL_REQUEST_STATUS_NO_SHOW
    : DEAL_REQUEST_STATUS_NO_DEAL;
};

/**
 * Телефон продавца виден сразу только у осмотра: машину выбирают по звонку.
 * Исполнителю услуги без этого названивали бы все, кто открыл объявление.
 *
 * @param {unknown} kind
 */
export const isSellerPhoneOpenBeforeRequest = (kind) =>
  kind === CATEGORY_DEAL_TYPE_VIEWING;

/**
 * Открыт ли участникам заявки телефон друг друга.
 *
 * @param {unknown} status
 */
export const isDealRequestContactOpen = (status) =>
  status === DEAL_REQUEST_STATUS_ACCEPTED ||
  status === DEAL_REQUEST_STATUS_DONE ||
  status === DEAL_REQUEST_STATUS_COMPLETED;
