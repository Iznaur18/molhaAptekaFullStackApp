import { errorRes, successRes } from "../../services/http/index.js";
import { getMyReferralProgram } from "../../services/referral/index.js";

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
