import { successRes } from "../../services/http/index.js";
import { refreshAuthSession } from "../../services/auth/refreshAuthSession.js";

export const refreshAuthController = async (req, res) => {
  const data = await refreshAuthSession({ req, res });
  return successRes(res, data);
};
