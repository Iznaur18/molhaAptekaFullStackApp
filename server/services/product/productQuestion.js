import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import {
  PRODUCT_QUESTION_ACTIVE_STATUSES,
  PRODUCT_QUESTION_LIMIT_DEFAULT,
  PRODUCT_QUESTION_LIMIT_MAX,
  PRODUCT_QUESTION_MESSAGES,
  PRODUCT_QUESTION_PAGE_DEFAULT,
  PRODUCT_QUESTION_STATUS_ANSWERED,
  PRODUCT_QUESTION_STATUS_HIDDEN,
  PRODUCT_QUESTION_STATUS_PENDING,
  PRODUCT_QUESTIONS_MAX_PER_PRODUCT,
} from "../../constants/productQuestionConstants.js";
import { ProductModel, ProductQuestionModel, UserModel } from "../../models/index.js";
import { AppError } from "../../errors/AppError.js";
import { canModerateProductsRole } from "../../utils/productModeration.js";
import { createUserInAppNotification } from "../user/userInAppNotifications.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import {
  canAccessProductQuestions,
  isProductSeller,
  isQuestionDeletable,
  serializeProductQuestion,
} from "./productQuestionHelpers.js";

const AUTHOR_PUBLIC_SELECT = "_id userName";

const QA_NOTIFICATION_KIND = "product_question";

/**
 * @param {Record<string, unknown>} query
 */
const parseQuestionListPagination = (query) => {
  const page = Math.max(
    PRODUCT_QUESTION_PAGE_DEFAULT,
    Number(query.page) || PRODUCT_QUESTION_PAGE_DEFAULT,
  );
  const limit = Math.min(
    PRODUCT_QUESTION_LIMIT_MAX,
    Math.max(1, Number(query.limit) || PRODUCT_QUESTION_LIMIT_DEFAULT),
  );
  return { page, limit, skip: (page - 1) * limit };
};

/**
 * Не даёт покупателю доступ к чужой очереди `pending`.
 * @param {{ productModerationStatus?: string; productSeller?: unknown; productQaEnabled?: boolean } | null} product
 * @param {string | null} viewerUserId
 */
const assertQuestionsAccessible = (product, viewerUserId) => {
  if (canAccessProductQuestions(product, viewerUserId)) {
    return;
  }
  if (product?.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
    throw new AppError(400, PRODUCT_QUESTION_MESSAGES.NOT_APPROVED);
  }
  throw new AppError(400, PRODUCT_QUESTION_MESSAGES.QA_DISABLED);
};

/**
 * @param {{
 *   productId: string;
 *   viewerUserId: string | null;
 *   query: Record<string, unknown>;
 * }} input
 */
export async function listProductQuestions({ productId, viewerUserId, query }) {
  const { page, limit, skip } = parseQuestionListPagination(query);

  const product = await ProductModel.findById(productId)
    .select("productModerationStatus productSeller productQaEnabled")
    .lean();

  if (!product) {
    throw new AppError(404, PRODUCT_QUESTION_MESSAGES.PRODUCT_NOT_FOUND);
  }

  assertQuestionsAccessible(product, viewerUserId);

  const isSeller = isProductSeller(product, viewerUserId);

  /** @type {Record<string, unknown>} */
  let filter;
  if (isSeller) {
    // Продавцу — вся очередь (кроме скрытых); опц. фильтр pending/answered.
    const statusFilter =
      query.status === PRODUCT_QUESTION_STATUS_PENDING ||
      query.status === PRODUCT_QUESTION_STATUS_ANSWERED
        ? query.status
        : { $in: PRODUCT_QUESTION_ACTIVE_STATUSES };
    filter = { productId, status: statusFilter };
  } else {
    // Покупателю/гостю — публичные (отвеченные) + свои ожидающие.
    const or = [{ status: PRODUCT_QUESTION_STATUS_ANSWERED }];
    if (viewerUserId) {
      or.push({ status: PRODUCT_QUESTION_STATUS_PENDING, authorUserId: viewerUserId });
    }
    filter = { productId, $or: or };
  }

  const [questions, total] = await Promise.all([
    ProductQuestionModel.find(filter)
      .sort({ answeredAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("authorUserId", AUTHOR_PUBLIC_SELECT)
      .lean(),
    ProductQuestionModel.countDocuments(filter),
  ]);

  return {
    questions: questions.map((row) =>
      serializeProductQuestion(row, { viewerUserId }),
    ),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
}

/**
 * @param {{ productId: string; viewerUserId: string | null }} input
 */
export async function getProductQuestionSummary({ productId, viewerUserId }) {
  const product = await ProductModel.findById(productId)
    .select(
      "productModerationStatus productSeller productQaEnabled productQuestionCount",
    )
    .lean();

  if (!product) {
    throw new AppError(404, PRODUCT_QUESTION_MESSAGES.PRODUCT_NOT_FOUND);
  }

  assertQuestionsAccessible(product, viewerUserId);

  const isSeller = isProductSeller(product, viewerUserId);
  const activeCount = Number(product.productQuestionCount) || 0;
  const remaining = Math.max(0, PRODUCT_QUESTIONS_MAX_PER_PRODUCT - activeCount);

  const publicCount = await ProductQuestionModel.countDocuments({
    productId,
    status: PRODUCT_QUESTION_STATUS_ANSWERED,
  });

  let pendingCount = 0;
  if (isSeller) {
    pendingCount = await ProductQuestionModel.countDocuments({
      productId,
      status: PRODUCT_QUESTION_STATUS_PENDING,
    });
  } else if (viewerUserId) {
    pendingCount = await ProductQuestionModel.countDocuments({
      productId,
      status: PRODUCT_QUESTION_STATUS_PENDING,
      authorUserId: viewerUserId,
    });
  }

  const canAsk =
    viewerUserId != null &&
    !isSeller &&
    product.productModerationStatus === PRODUCT_MODERATION_APPROVED &&
    product.productQaEnabled === true &&
    remaining > 0;

  return {
    qaEnabled: product.productQaEnabled === true,
    isSeller,
    publicCount,
    pendingCount,
    activeCount,
    remaining,
    limit: PRODUCT_QUESTIONS_MAX_PER_PRODUCT,
    canAsk,
  };
}

/**
 * @param {{
 *   authorUserId: string;
 *   productId: string;
 *   body: Record<string, unknown>;
 * }} input
 */
export async function askProductQuestion({ authorUserId, productId, body }) {
  const text = String(body?.text ?? "").trim();
  if (!text) {
    throw new AppError(400, "Введите вопрос");
  }

  const product = await ProductModel.findById(productId)
    .select("productSeller productModerationStatus productQaEnabled")
    .lean();

  if (!product) {
    throw new AppError(404, PRODUCT_QUESTION_MESSAGES.PRODUCT_NOT_FOUND);
  }
  if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
    throw new AppError(400, PRODUCT_QUESTION_MESSAGES.NOT_APPROVED);
  }
  if (product.productQaEnabled !== true) {
    throw new AppError(400, PRODUCT_QUESTION_MESSAGES.QA_DISABLED);
  }
  if (isProductSeller(product, authorUserId)) {
    throw new AppError(400, PRODUCT_QUESTION_MESSAGES.OWN_PRODUCT);
  }

  // Атомарно занимаем слот: проверка-и-инкремент одной операцией (страж лимита).
  // `$or` с `$exists: false` покрывает старые товары, созданные до появления поля
  // productQuestionCount — у них его нет в документе, и `$lt` его не матчит.
  const claimed = await ProductModel.findOneAndUpdate(
    {
      _id: productId,
      $or: [
        { productQuestionCount: { $lt: PRODUCT_QUESTIONS_MAX_PER_PRODUCT } },
        { productQuestionCount: { $exists: false } },
        { productQuestionCount: null },
      ],
    },
    { $inc: { productQuestionCount: 1 } },
    { new: true },
  );

  if (!claimed) {
    throw new AppError(409, PRODUCT_QUESTION_MESSAGES.LIMIT_REACHED);
  }

  let question;
  try {
    question = await ProductQuestionModel.create({
      productId,
      authorUserId,
      text,
      status: PRODUCT_QUESTION_STATUS_PENDING,
    });
  } catch (error) {
    // Компенсируем занятый слот, если запись не создалась.
    await ProductModel.updateOne(
      { _id: productId },
      { $inc: { productQuestionCount: -1 } },
    );
    throw error;
  }

  // Уведомляем продавца о новом вопросе (best-effort).
  void createUserInAppNotification({
    userId: product.productSeller,
    kind: QA_NOTIFICATION_KIND,
    message: "Новый вопрос о вашем товаре",
    productId,
    actorUserId: authorUserId,
  }).catch((error) => {
    logServerEvent("error", {
      event: "askproductquestion_notify",
      error: error instanceof Error ? error.message : String(error),
    });
  });

  const populated = await ProductQuestionModel.findById(question._id)
    .populate("authorUserId", AUTHOR_PUBLIC_SELECT)
    .lean();

  const remaining = Math.max(
    0,
    PRODUCT_QUESTIONS_MAX_PER_PRODUCT - (Number(claimed.productQuestionCount) || 0),
  );

  return {
    question: serializeProductQuestion(populated, { viewerUserId: authorUserId }),
    remaining,
    message: "Вопрос отправлен продавцу",
  };
}

/**
 * @param {{
 *   sellerUserId: string;
 *   productId: string;
 *   questionId: string;
 *   body: Record<string, unknown>;
 * }} input
 */
export async function answerProductQuestion({
  sellerUserId,
  productId,
  questionId,
  body,
}) {
  const text = String(body?.text ?? "").trim();
  if (!text) {
    throw new AppError(400, "Введите ответ");
  }

  const product = await ProductModel.findById(productId)
    .select("productSeller")
    .lean();

  if (!product) {
    throw new AppError(404, PRODUCT_QUESTION_MESSAGES.PRODUCT_NOT_FOUND);
  }
  if (!isProductSeller(product, sellerUserId)) {
    throw new AppError(403, PRODUCT_QUESTION_MESSAGES.ONLY_SELLER_CAN_ANSWER);
  }

  const question = await ProductQuestionModel.findOne({ _id: questionId, productId });
  if (!question) {
    throw new AppError(404, PRODUCT_QUESTION_MESSAGES.QUESTION_NOT_FOUND);
  }
  if (question.status === PRODUCT_QUESTION_STATUS_HIDDEN) {
    throw new AppError(400, PRODUCT_QUESTION_MESSAGES.CANNOT_ANSWER_HIDDEN);
  }

  const now = new Date();
  question.answer = { text, answeredBy: sellerUserId, answeredAt: now };
  question.answeredAt = now;
  question.status = PRODUCT_QUESTION_STATUS_ANSWERED;
  await question.save();

  // TODO(post-v1): уведомить автора вопроса об ответе продавца.

  const populated = await ProductQuestionModel.findById(question._id)
    .populate("authorUserId", AUTHOR_PUBLIC_SELECT)
    .lean();

  return {
    question: serializeProductQuestion(populated, { viewerUserId: sellerUserId }),
    message: "Ответ опубликован",
  };
}

/**
 * @param {{ userId: string; productId: string; questionId: string }} input
 */
export async function deleteMyProductQuestion({ userId, productId, questionId }) {
  const question = await ProductQuestionModel.findOne({ _id: questionId, productId });
  if (!question) {
    throw new AppError(404, PRODUCT_QUESTION_MESSAGES.QUESTION_NOT_FOUND);
  }
  if (String(question.authorUserId) !== String(userId)) {
    throw new AppError(403, PRODUCT_QUESTION_MESSAGES.ONLY_AUTHOR_CAN_DELETE);
  }
  if (!isQuestionDeletable(question)) {
    throw new AppError(400, PRODUCT_QUESTION_MESSAGES.DELETE_WINDOW_EXPIRED);
  }

  const wasActive = PRODUCT_QUESTION_ACTIVE_STATUSES.includes(question.status);
  await question.deleteOne();

  if (wasActive) {
    await releaseQuestionSlot(productId);
  }

  return { message: "Вопрос удалён" };
}

/**
 * @param {{ userId: string; productId: string; questionId: string }} input
 */
export async function hideProductQuestion({ userId, productId, questionId }) {
  const product = await ProductModel.findById(productId)
    .select("productSeller")
    .lean();
  if (!product) {
    throw new AppError(404, PRODUCT_QUESTION_MESSAGES.PRODUCT_NOT_FOUND);
  }

  let allowed = isProductSeller(product, userId);
  if (!allowed) {
    const user = await UserModel.findById(userId).select("userRole").lean();
    allowed = canModerateProductsRole(user?.userRole);
  }
  if (!allowed) {
    throw new AppError(403, PRODUCT_QUESTION_MESSAGES.NOT_ALLOWED_TO_HIDE);
  }

  const question = await ProductQuestionModel.findOne({ _id: questionId, productId });
  if (!question) {
    throw new AppError(404, PRODUCT_QUESTION_MESSAGES.QUESTION_NOT_FOUND);
  }

  if (question.status === PRODUCT_QUESTION_STATUS_HIDDEN) {
    return { message: "Вопрос уже скрыт" };
  }

  const wasActive = PRODUCT_QUESTION_ACTIVE_STATUSES.includes(question.status);
  question.status = PRODUCT_QUESTION_STATUS_HIDDEN;
  await question.save();

  if (wasActive) {
    await releaseQuestionSlot(productId);
  }

  return { message: "Вопрос скрыт" };
}

/**
 * Освобождает слот, не уводя счётчик в минус.
 * @param {string} productId
 */
async function releaseQuestionSlot(productId) {
  await ProductModel.updateOne(
    { _id: productId, productQuestionCount: { $gt: 0 } },
    { $inc: { productQuestionCount: -1 } },
  );
}
