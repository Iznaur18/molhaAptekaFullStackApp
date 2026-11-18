import { successRes } from "../../services/http/index.js";
import { getUserPurchasesForViewer } from "../../services/user/getUserPurchasesForViewer.js";

/** `GET /user/:userIdClient/purchases` — последние уникальные покупки (JWT). */
export const getUserPurchasesController = async (req, res) => {
  const data = await getUserPurchasesForViewer({
    viewerUserId: req.userId,
    targetUserId: String(req.params.userIdClient),
    req,
  });
  return successRes(res, data);
};
