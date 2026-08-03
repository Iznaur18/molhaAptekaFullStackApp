import {
  answerProductQuestion,
  askProductQuestion,
  deleteMyProductQuestion,
  getProductQuestionSummary,
  hideProductQuestion,
  listProductQuestions,
} from "../../services/product/productQuestion.js";
import { successRes } from "../../services/http/index.js";

/** `GET /product/:productId/questions` */
export const listProductQuestionsController = async (req, res) => {
  const result = await listProductQuestions({
    productId: req.params.productId,
    viewerUserId: req.userId ? String(req.userId) : null,
    query: req.query,
  });

  return successRes(res, result);
};

/** `GET /product/:productId/questions/summary` */
export const getProductQuestionSummaryController = async (req, res) => {
  const result = await getProductQuestionSummary({
    productId: req.params.productId,
    viewerUserId: req.userId ? String(req.userId) : null,
  });

  return successRes(res, result);
};

/** `POST /product/:productId/questions` */
export const askProductQuestionController = async (req, res) => {
  const result = await askProductQuestion({
    authorUserId: String(req.userId),
    productId: req.params.productId,
    body: req.body,
  });

  return successRes(res, result);
};

/** `PUT /product/:productId/questions/:questionId/answer` */
export const answerProductQuestionController = async (req, res) => {
  const result = await answerProductQuestion({
    sellerUserId: String(req.userId),
    productId: req.params.productId,
    questionId: req.params.questionId,
    body: req.body,
  });

  return successRes(res, result);
};

/** `PATCH /product/:productId/questions/:questionId/hide` */
export const hideProductQuestionController = async (req, res) => {
  const result = await hideProductQuestion({
    userId: String(req.userId),
    productId: req.params.productId,
    questionId: req.params.questionId,
  });

  return successRes(res, result);
};

/** `DELETE /product/:productId/questions/:questionId` */
export const deleteMyProductQuestionController = async (req, res) => {
  const result = await deleteMyProductQuestion({
    userId: String(req.userId),
    productId: req.params.productId,
    questionId: req.params.questionId,
  });

  return successRes(res, result);
};
