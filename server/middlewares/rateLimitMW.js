import rateLimit from "express-rate-limit";

import { PRODUCT_REPORT_RATE_LIMIT_PER_HOUR } from "../constants/productReportConstants.js";
import { USER_STORY_RATE_LIMIT_PER_HOUR } from "../constants/userStoryConstants.js";
import { USER_DATA_CONFIRMATION_RATE_LIMIT_PER_HOUR } from "../constants/userDataConfirmationConstants.js";
import { EMAIL_VERIFICATION_RESEND_RATE_LIMIT_PER_HOUR } from "../constants/emailVerificationConstants.js";
import { PRICE_OFFER_RATE_LIMIT_PER_HOUR } from "../constants/productPriceOfferConstants.js";
import { PRODUCT_REVIEW_RATE_LIMIT_PER_HOUR } from "../constants/productReviewConstants.js";
import { PRODUCT_QUESTION_RATE_LIMIT_PER_HOUR } from "../constants/productQuestionConstants.js";
import { PRODUCT_COMPARE_RATE_LIMIT_PER_15_MIN } from "../constants/productCompareConstants.js";
import {
  ADDRESS_SUGGEST_RATE_LIMIT_PER_HOUR,
  ADVERTISING_SUBMIT_RATE_LIMIT_PER_HOUR,
  CATALOG_LIST_RATE_LIMIT_PER_15_MIN,
  INSTALLMENT_ACTION_RATE_LIMIT_PER_HOUR,
  MONEY_MUTATION_RATE_LIMIT_PER_HOUR,
  PRODUCT_CREATE_RATE_LIMIT_PER_HOUR,
  PRODUCT_BULK_IMPORT_RATE_LIMIT_PER_HOUR,
  USER_SEARCH_RATE_LIMIT_PER_15_MIN,
} from "../constants/securityRateLimitConstants.js";
import {
  ORDER_CREATE_RATE_LIMIT_PER_HOUR,
  ORDER_ITEM_ACTION_RATE_LIMIT_PER_15_MIN,
} from "../constants/orderRateLimitConstants.js";
import {
  GENERAL_RATE_LIMIT_MAX,
  GENERAL_RATE_LIMIT_WINDOW_MS,
  USER_PHONE_REVEAL_RATE_LIMIT_PER_HOUR,
} from "../constants/rateLimitConstants.js";
import {
  logSecurityEvent,
  securityRequestFields,
} from "../services/auth/logSecurityEvent.js";

/** @type {Record<string, import('express').RequestHandler>} */
const handlers = {};

/** @param {import('express').Request} req */
function rateLimitKeyByUserOrIp(req) {
  return String(req.userId ?? req.ip ?? "unknown");
}

/** @param {import('express').Request} req */
function rateLimitKeyByAuthIdentityOrIp(req) {
  const ip = String(req.ip ?? req.socket?.remoteAddress ?? "unknown");
  const email = String(req.body?.email ?? "")
    .trim()
    .toLowerCase();
  if (email) {
    return `auth:${ip}:${email}`;
  }
  return `auth:${ip}`;
}

/** @param {import('express').Request} req */
function shouldSkipGeneralRateLimit(req) {
  const path = req.path ?? "";
  return path === "/health" || path.startsWith("/uploads");
}

/** @param {import('express').Request} req */
function generalRateLimitKey(req) {
  return String(req.ip ?? req.socket?.remoteAddress ?? "unknown");
}

const RATE_LIMIT_DEFAULTS = {
  standardHeaders: true,
  legacyHeaders: false,
};

/**
 * @param {import('express-rate-limit').Options & { limiterName?: string }} options
 * @param {import('express-rate-limit').Store | undefined} store
 */
function buildLimiter(options, store) {
  const limiterName = options.limiterName ?? "unnamed";
  const { limiterName: _ignored, ...rest } = options;

  const withHandler = {
    ...rest,
    handler: (req, res, _next, opts) => {
      logSecurityEvent("warn", "rate_limit_hit", {
        ...securityRequestFields(req),
        limiter: limiterName,
      });
      const statusCode = opts.statusCode ?? 429;
      const message = opts.message;
      if (message != null && typeof message === "object") {
        res.status(statusCode).json(message);
        return;
      }
      res.status(statusCode).send(message);
    },
  };

  return rateLimit(store ? { ...withHandler, store } : withHandler);
}

/**
 * @param {import('express-rate-limit').Store} [store]
 */
export function initRateLimitMiddlewares(store) {
  handlers.general = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      limiterName: "general",
      windowMs: GENERAL_RATE_LIMIT_WINDOW_MS,
      max: GENERAL_RATE_LIMIT_MAX,
      skip: shouldSkipGeneralRateLimit,
      keyGenerator: generalRateLimitKey,
      validate: { ip: false, trustProxy: false, xForwardedForHeader: false },
      message: {
        success: false,
        message: "Слишком много запросов с этого IP, попробуйте позже",
      },
    },
    store,
  );

  handlers.auth = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      limiterName: "auth",
      windowMs: 15 * 60 * 1000,
      max: 55,
      message: {
        success: false,
        message: "Слишком много попыток входа. Попробуйте через 15 минут",
      },
      skipSuccessfulRequests: true,
      keyGenerator: rateLimitKeyByAuthIdentityOrIp,
      validate: { ip: false, trustProxy: false, xForwardedForHeader: false },
    },
    store,
  );

  handlers.registerAuth = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      limiterName: "register_auth",
      windowMs: 15 * 60 * 1000,
      max: 20,
      message: {
        success: false,
        message: "Слишком много попыток регистрации. Попробуйте через 15 минут",
      },
      keyGenerator: (req) => {
        const email = String(req.body?.email ?? "")
          .trim()
          .toLowerCase();
        const ip = String(req.ip ?? req.socket?.remoteAddress ?? "unknown");
        return email ? `reg:${ip}:${email}` : `reg:${ip}`;
      },
    },
    store,
  );

  handlers.refreshAuth = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      limiterName: "refresh_auth",
      windowMs: 15 * 60 * 1000,
      max: 120,
      message: {
        success: false,
        message: "Слишком много запросов обновления сессии. Попробуйте позже",
      },
    },
    store,
  );

  handlers.updateProfile = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 60 * 60 * 1000,
      max: 120,
      message: {
        success: false,
        message: "Слишком много обновлений профиля. Попробуйте позже",
      },
    },
    store,
  );

  handlers.vote = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 60 * 60 * 1000,
      max: 110,
      message: {
        success: false,
        message: "Слишком много голосований. Попробуйте позже",
      },
    },
    store,
  );

  handlers.upload = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 60 * 60 * 1000,
      max: 110,
      message: {
        success: false,
        message: "Слишком много загрузок файлов. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.orderCreate = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 60 * 60 * 1000,
      max: ORDER_CREATE_RATE_LIMIT_PER_HOUR,
      message: {
        success: false,
        message: "Слишком много заказов. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.orderItemAction = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 15 * 60 * 1000,
      max: ORDER_ITEM_ACTION_RATE_LIMIT_PER_15_MIN,
      message: {
        success: false,
        message: "Слишком много действий по заказу. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.cartReplace = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 15 * 60 * 1000,
      max: 400,
      message: {
        success: false,
        message: "Слишком много обновлений корзины. Попробуйте позже",
      },
    },
    store,
  );

  handlers.favoritesReplace = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 15 * 60 * 1000,
      max: 400,
      keyGenerator: rateLimitKeyByUserOrIp,
      message: {
        success: false,
        message: "Слишком много обновлений списка желаний. Попробуйте позже",
      },
    },
    store,
  );

  handlers.productReport = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 60 * 60 * 1000,
      max: PRODUCT_REPORT_RATE_LIMIT_PER_HOUR,
      message: {
        success: false,
        message: "Слишком много жалоб. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.userStoryReport = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 60 * 60 * 1000,
      max: USER_STORY_RATE_LIMIT_PER_HOUR,
      message: {
        success: false,
        message: "Слишком много жалоб. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.userStoryCreate = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 60 * 60 * 1000,
      max: 30,
      message: {
        success: false,
        message: "Слишком много публикаций сторис. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.productPriceOffer = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 60 * 60 * 1000,
      max: PRICE_OFFER_RATE_LIMIT_PER_HOUR,
      message: {
        success: false,
        message: "Слишком много предложений цены. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.userDataConfirmation = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 60 * 60 * 1000,
      max: USER_DATA_CONFIRMATION_RATE_LIMIT_PER_HOUR,
      message: {
        success: false,
        message: "Слишком много заявок. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.emailVerificationResend = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 60 * 60 * 1000,
      max: EMAIL_VERIFICATION_RESEND_RATE_LIMIT_PER_HOUR,
      message: {
        success: false,
        message: "Слишком много запросов на отправку письма. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.productReview = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 60 * 60 * 1000,
      max: PRODUCT_REVIEW_RATE_LIMIT_PER_HOUR,
      message: {
        success: false,
        message: "Слишком много отзывов. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.productQuestion = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 60 * 60 * 1000,
      max: PRODUCT_QUESTION_RATE_LIMIT_PER_HOUR,
      message: {
        success: false,
        message: "Слишком много вопросов. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.productCompare = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 15 * 60 * 1000,
      max: PRODUCT_COMPARE_RATE_LIMIT_PER_15_MIN,
      message: {
        success: false,
        message: "Слишком много запросов сравнения. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.addressSuggest = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 60 * 60 * 1000,
      max: ADDRESS_SUGGEST_RATE_LIMIT_PER_HOUR,
      message: {
        success: false,
        message: "Слишком много запросов подсказок адреса. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.userSearch = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 15 * 60 * 1000,
      max: USER_SEARCH_RATE_LIMIT_PER_15_MIN,
      message: {
        success: false,
        message: "Слишком много поисковых запросов. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.userPhoneReveal = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      windowMs: 60 * 60 * 1000,
      max: USER_PHONE_REVEAL_RATE_LIMIT_PER_HOUR,
      message: {
        success: false,
        message: "Слишком много запросов номера. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.advertisingSubmit = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      limiterName: "advertising_submit",
      windowMs: 60 * 60 * 1000,
      max: ADVERTISING_SUBMIT_RATE_LIMIT_PER_HOUR,
      message: {
        success: false,
        message: "Слишком много заявок на рекламу. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.moneyMutation = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      limiterName: "money_mutation",
      windowMs: 60 * 60 * 1000,
      max: MONEY_MUTATION_RATE_LIMIT_PER_HOUR,
      message: {
        success: false,
        message: "Слишком много операций с баллами. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.productCreate = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      limiterName: "product_create",
      windowMs: 60 * 60 * 1000,
      max: PRODUCT_CREATE_RATE_LIMIT_PER_HOUR,
      message: {
        success: false,
        message: "Слишком много созданий товаров. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.productBulkImport = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      limiterName: "product_bulk_import",
      windowMs: 60 * 60 * 1000,
      max: PRODUCT_BULK_IMPORT_RATE_LIMIT_PER_HOUR,
      message: {
        success: false,
        message: "Слишком много импортов из Excel. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.installmentAction = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      limiterName: "installment_action",
      windowMs: 60 * 60 * 1000,
      max: INSTALLMENT_ACTION_RATE_LIMIT_PER_HOUR,
      message: {
        success: false,
        message: "Слишком много действий по рассрочке. Попробуйте позже",
      },
      keyGenerator: rateLimitKeyByUserOrIp,
    },
    store,
  );

  handlers.catalogList = buildLimiter(
    {
      ...RATE_LIMIT_DEFAULTS,
      limiterName: "catalog_list",
      windowMs: 15 * 60 * 1000,
      max: CATALOG_LIST_RATE_LIMIT_PER_15_MIN,
      message: {
        success: false,
        message: "Слишком много запросов каталога. Попробуйте позже",
      },
      keyGenerator: generalRateLimitKey,
      validate: { ip: false, trustProxy: false, xForwardedForHeader: false },
    },
    store,
  );
}

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const generalRateLimiter = (req, res, next) => handlers.general(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const authRateLimiter = (req, res, next) => handlers.auth(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const registerAuthRateLimiter = (req, res, next) =>
  handlers.registerAuth(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const refreshAuthRateLimiter = (req, res, next) =>
  handlers.refreshAuth(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const updateProfileRateLimiter = (req, res, next) =>
  handlers.updateProfile(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const voteRateLimiter = (req, res, next) => handlers.vote(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const uploadRateLimiter = (req, res, next) => handlers.upload(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const orderCreateRateLimiter = (req, res, next) =>
  handlers.orderCreate(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const orderItemActionRateLimiter = (req, res, next) =>
  handlers.orderItemAction(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const cartReplaceRateLimiter = (req, res, next) =>
  handlers.cartReplace(req, res, next);

export const favoritesReplaceRateLimiter = (req, res, next) =>
  handlers.favoritesReplace(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const productReportRateLimiter = (req, res, next) =>
  handlers.productReport(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const userStoryReportRateLimiter = (req, res, next) =>
  handlers.userStoryReport(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const userStoryCreateRateLimiter = (req, res, next) =>
  handlers.userStoryCreate(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const productPriceOfferRateLimiter = (req, res, next) =>
  handlers.productPriceOffer(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const userDataConfirmationRateLimiter = (req, res, next) =>
  handlers.userDataConfirmation(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const emailVerificationResendRateLimiter = (req, res, next) =>
  handlers.emailVerificationResend(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const productReviewRateLimiter = (req, res, next) =>
  handlers.productReview(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const productQuestionRateLimiter = (req, res, next) =>
  handlers.productQuestion(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const productCompareRateLimiter = (req, res, next) =>
  handlers.productCompare(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const addressSuggestRateLimiter = (req, res, next) =>
  handlers.addressSuggest(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const userSearchRateLimiter = (req, res, next) =>
  handlers.userSearch(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const userPhoneRevealRateLimiter = (req, res, next) =>
  handlers.userPhoneReveal(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const advertisingSubmitRateLimiter = (req, res, next) =>
  handlers.advertisingSubmit(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const moneyMutationRateLimiter = (req, res, next) =>
  handlers.moneyMutation(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const productCreateRateLimiter = (req, res, next) =>
  handlers.productCreate(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const productBulkImportRateLimiter = (req, res, next) =>
  handlers.productBulkImport(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const installmentActionRateLimiter = (req, res, next) =>
  handlers.installmentAction(req, res, next);

/** @param {import('express').Request} req @param {import('express').Response} res @param {import('express').NextFunction} next */
export const catalogListRateLimiter = (req, res, next) =>
  handlers.catalogList(req, res, next);

initRateLimitMiddlewares();
