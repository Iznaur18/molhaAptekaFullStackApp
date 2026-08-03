import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import mongoose from "mongoose";

import { PRODUCT_MODERATION_APPROVED } from "../constants/productModerationConstants.js";
import {
  PRODUCT_QUESTION_MESSAGES,
  PRODUCT_QUESTION_STATUS_HIDDEN,
  PRODUCT_QUESTIONS_MAX_PER_PRODUCT,
} from "../constants/productQuestionConstants.js";
import { ProductModel, ProductQuestionModel } from "../models/index.js";
import {
  answerProductQuestion,
  askProductQuestion,
  deleteMyProductQuestion,
  hideProductQuestion,
  listProductQuestions,
} from "../services/product/productQuestion.js";
import {
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

/**
 * @param {Partial<Record<string, unknown>>} [overrides]
 */
const createQaProduct = (overrides = {}) =>
  ProductModel.create({
    productName: "Q&A тестовый товар",
    productPrice: 100,
    productSeller: new mongoose.Types.ObjectId(),
    productCategory: "electronics",
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: true,
    productStockQuantity: 5,
    productQaEnabled: true,
    ...overrides,
  });

test("ask creates pending question and increments productQuestionCount", async () => {
  const product = await createQaProduct();
  const buyerId = new mongoose.Types.ObjectId();

  const result = await askProductQuestion({
    authorUserId: String(buyerId),
    productId: String(product._id),
    body: { text: "Какой срок годности?" },
  });

  assert.equal(result.question.status, "pending");
  assert.equal(result.remaining, PRODUCT_QUESTIONS_MAX_PER_PRODUCT - 1);

  const fresh = await ProductModel.findById(product._id).lean();
  assert.equal(fresh.productQuestionCount, 1);
});

test("ask works on legacy product missing productQuestionCount field", async () => {
  const product = await createQaProduct();
  // Эмулируем старый товар: поля productQuestionCount нет в документе.
  await ProductModel.collection.updateOne(
    { _id: product._id },
    { $unset: { productQuestionCount: "" } },
  );

  const result = await askProductQuestion({
    authorUserId: String(new mongoose.Types.ObjectId()),
    productId: String(product._id),
    body: { text: "Вопрос к старому товару" },
  });

  assert.equal(result.question.status, "pending");
  const fresh = await ProductModel.findById(product._id).lean();
  assert.equal(fresh.productQuestionCount, 1);
});

test("seller cannot ask a question on own product", async () => {
  const sellerId = new mongoose.Types.ObjectId();
  const product = await createQaProduct({ productSeller: sellerId });

  await assert.rejects(
    askProductQuestion({
      authorUserId: String(sellerId),
      productId: String(product._id),
      body: { text: "Свой вопрос" },
    }),
    (err) => err.message === PRODUCT_QUESTION_MESSAGES.OWN_PRODUCT,
  );
});

test("ask is blocked when Q&A toggle is off", async () => {
  const product = await createQaProduct({ productQaEnabled: false });

  await assert.rejects(
    askProductQuestion({
      authorUserId: String(new mongoose.Types.ObjectId()),
      productId: String(product._id),
      body: { text: "Вопрос" },
    }),
    (err) => err.message === PRODUCT_QUESTION_MESSAGES.QA_DISABLED,
  );
});

test("pending question is visible to author and seller, hidden from other buyers", async () => {
  const sellerId = new mongoose.Types.ObjectId();
  const authorId = new mongoose.Types.ObjectId();
  const otherBuyerId = new mongoose.Types.ObjectId();
  const product = await createQaProduct({ productSeller: sellerId });

  await askProductQuestion({
    authorUserId: String(authorId),
    productId: String(product._id),
    body: { text: "Виден только автору?" },
  });

  const asAuthor = await listProductQuestions({
    productId: String(product._id),
    viewerUserId: String(authorId),
    query: {},
  });
  assert.equal(asAuthor.questions.length, 1);

  const asSeller = await listProductQuestions({
    productId: String(product._id),
    viewerUserId: String(sellerId),
    query: {},
  });
  assert.equal(asSeller.questions.length, 1);

  const asOtherBuyer = await listProductQuestions({
    productId: String(product._id),
    viewerUserId: String(otherBuyerId),
    query: {},
  });
  assert.equal(asOtherBuyer.questions.length, 0);

  const asGuest = await listProductQuestions({
    productId: String(product._id),
    viewerUserId: null,
    query: {},
  });
  assert.equal(asGuest.questions.length, 0);
});

test("answer publishes the question to everyone", async () => {
  const sellerId = new mongoose.Types.ObjectId();
  const product = await createQaProduct({ productSeller: sellerId });

  const asked = await askProductQuestion({
    authorUserId: String(new mongoose.Types.ObjectId()),
    productId: String(product._id),
    body: { text: "Есть доставка?" },
  });

  const answered = await answerProductQuestion({
    sellerUserId: String(sellerId),
    productId: String(product._id),
    questionId: asked.question._id,
    body: { text: "Да, по всей России" },
  });
  assert.equal(answered.question.status, "answered");
  assert.equal(answered.question.answer.text, "Да, по всей России");

  const asGuest = await listProductQuestions({
    productId: String(product._id),
    viewerUserId: null,
    query: {},
  });
  assert.equal(asGuest.questions.length, 1);
  assert.equal(asGuest.questions[0].status, "answered");
});

test("only the seller can answer", async () => {
  const sellerId = new mongoose.Types.ObjectId();
  const product = await createQaProduct({ productSeller: sellerId });
  const asked = await askProductQuestion({
    authorUserId: String(new mongoose.Types.ObjectId()),
    productId: String(product._id),
    body: { text: "Кто ответит?" },
  });

  await assert.rejects(
    answerProductQuestion({
      sellerUserId: String(new mongoose.Types.ObjectId()),
      productId: String(product._id),
      questionId: asked.question._id,
      body: { text: "Не продавец" },
    }),
    (err) => err.message === PRODUCT_QUESTION_MESSAGES.ONLY_SELLER_CAN_ANSWER,
  );
});

test("cannot answer a hidden question", async () => {
  const sellerId = new mongoose.Types.ObjectId();
  const product = await createQaProduct({ productSeller: sellerId });
  const asked = await askProductQuestion({
    authorUserId: String(new mongoose.Types.ObjectId()),
    productId: String(product._id),
    body: { text: "Скрытый вопрос" },
  });

  await hideProductQuestion({
    userId: String(sellerId),
    productId: String(product._id),
    questionId: asked.question._id,
  });

  await assert.rejects(
    answerProductQuestion({
      sellerUserId: String(sellerId),
      productId: String(product._id),
      questionId: asked.question._id,
      body: { text: "Поздно" },
    }),
    (err) => err.message === PRODUCT_QUESTION_MESSAGES.CANNOT_ANSWER_HIDDEN,
  );
});

test("hiding a question frees its slot", async () => {
  const sellerId = new mongoose.Types.ObjectId();
  const product = await createQaProduct({ productSeller: sellerId });
  const asked = await askProductQuestion({
    authorUserId: String(new mongoose.Types.ObjectId()),
    productId: String(product._id),
    body: { text: "Спам-вопрос" },
  });

  let fresh = await ProductModel.findById(product._id).lean();
  assert.equal(fresh.productQuestionCount, 1);

  await hideProductQuestion({
    userId: String(sellerId),
    productId: String(product._id),
    questionId: asked.question._id,
  });

  fresh = await ProductModel.findById(product._id).lean();
  assert.equal(fresh.productQuestionCount, 0);

  const stored = await ProductQuestionModel.findById(asked.question._id).lean();
  assert.equal(stored.status, PRODUCT_QUESTION_STATUS_HIDDEN);
});

test("limit is enforced at 50 questions", async () => {
  const product = await createQaProduct();
  await ProductModel.updateOne(
    { _id: product._id },
    { $set: { productQuestionCount: PRODUCT_QUESTIONS_MAX_PER_PRODUCT } },
  );

  await assert.rejects(
    askProductQuestion({
      authorUserId: String(new mongoose.Types.ObjectId()),
      productId: String(product._id),
      body: { text: "51-й вопрос" },
    }),
    (err) => err.message === PRODUCT_QUESTION_MESSAGES.LIMIT_REACHED,
  );
});

test("concurrent asks never exceed the limit", async () => {
  const product = await createQaProduct();
  const attempts = PRODUCT_QUESTIONS_MAX_PER_PRODUCT + 8;

  const results = await Promise.allSettled(
    Array.from({ length: attempts }, (_, i) =>
      askProductQuestion({
        authorUserId: String(new mongoose.Types.ObjectId()),
        productId: String(product._id),
        body: { text: `Гонка №${i}` },
      }),
    ),
  );

  const fulfilled = results.filter((r) => r.status === "fulfilled").length;
  assert.equal(fulfilled, PRODUCT_QUESTIONS_MAX_PER_PRODUCT);

  const fresh = await ProductModel.findById(product._id).lean();
  assert.equal(fresh.productQuestionCount, PRODUCT_QUESTIONS_MAX_PER_PRODUCT);

  const stored = await ProductQuestionModel.countDocuments({ productId: product._id });
  assert.equal(stored, PRODUCT_QUESTIONS_MAX_PER_PRODUCT);
});

test("author can delete own question and frees the slot; others cannot", async () => {
  const authorId = new mongoose.Types.ObjectId();
  const product = await createQaProduct();
  const asked = await askProductQuestion({
    authorUserId: String(authorId),
    productId: String(product._id),
    body: { text: "Удалю сам" },
  });

  await assert.rejects(
    deleteMyProductQuestion({
      userId: String(new mongoose.Types.ObjectId()),
      productId: String(product._id),
      questionId: asked.question._id,
    }),
    (err) => err.message === PRODUCT_QUESTION_MESSAGES.ONLY_AUTHOR_CAN_DELETE,
  );

  await deleteMyProductQuestion({
    userId: String(authorId),
    productId: String(product._id),
    questionId: asked.question._id,
  });

  const fresh = await ProductModel.findById(product._id).lean();
  assert.equal(fresh.productQuestionCount, 0);
  const stored = await ProductQuestionModel.findById(asked.question._id).lean();
  assert.equal(stored, null);
});
