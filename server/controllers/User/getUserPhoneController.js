import { successRes } from "../../services/http/index.js";
import { revealUserPhone } from "../../services/user/revealUserContact.js";

/** `GET /user/:userIdClient/phone` — reveal после rate limit. */
export const getUserPhoneController = async (req, res) => {
  const data = await revealUserPhone({
    targetUserId: String(req.params.userIdClient),
  });
  return successRes(res, data);
};
