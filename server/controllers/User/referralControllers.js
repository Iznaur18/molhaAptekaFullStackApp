import { errorRes, successRes } from "../../services/http/index.js";
import {
  convertPartnerBalanceToLoyalty,
  getMyReferralProgram,
} from "../../services/referral/index.js";
import { REFERRAL_INSUFFICIENT_BALANCE_MESSAGE } from "../../constants/referralConstants.js";

export const getMyReferralProgramController = async (req, res) => {
  const userId = String(req.userId);

  try {
    const data = await getMyReferralProgram(userId);
    return successRes(res, data);
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return errorRes(res, 404, "Пользователь не найден");
    }
    throw error;
  }
};

export const convertPartnerBalanceController = async (req, res) => {
  const userId = String(req.userId);
  const amount = req.body.amount;
  const idempotencyKey = req.body.idempotencyKey;

  try {
    const result = await convertPartnerBalanceToLoyalty({
      userId,
      amount,
      idempotencyKey,
    });
    return successRes(res, {
      message: "Партнёрский баланс конвертирован в баллы",
      ...result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return errorRes(res, 404, "Пользователь не найден");
    }
    if (
      error instanceof Error &&
      (error.name === "InsufficientPartnerBalanceError" ||
        error.message === REFERRAL_INSUFFICIENT_BALANCE_MESSAGE)
    ) {
      return errorRes(res, 400, REFERRAL_INSUFFICIENT_BALANCE_MESSAGE);
    }
    if (
      error instanceof Error &&
      error.message === "Сумма конвертации должна быть больше 0"
    ) {
      return errorRes(res, 400, error.message);
    }
    if (
      error instanceof Error &&
      error.message === "Укажите idempotencyKey для денежной операции"
    ) {
      return errorRes(res, 400, error.message);
    }
    throw error;
  }
};
