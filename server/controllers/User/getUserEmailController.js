import { successRes } from "../../services/http/index.js";
import { revealUserEmail } from "../../services/user/revealUserContact.js";

/**
 * `GET /user/:userIdClient/email` — почта по кнопке «Показать почту».
 */
export const getUserEmailController = async (req, res) => {
  const data = await revealUserEmail({
    targetUserId: String(req.params.userIdClient),
  });
  return successRes(res, data);
};
