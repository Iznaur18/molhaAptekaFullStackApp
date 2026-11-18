import { successRes } from "../../services/http/index.js";
import { getMyReferralProgram } from "../../services/referral/index.js";

export const getMyReferralProgramController = async (req, res) => {
  const data = await getMyReferralProgram(String(req.userId));
  return successRes(res, data);
};
