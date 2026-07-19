import { errorRes } from "../services/http/index.js";
import { canAccessPrivateUpload } from "../services/upload/canAccessPrivateUpload.js";

/**
 * После `checkAuthMW`. Staff/moderator или продавец с правом на этот private file.
 */
export const checkPrivateUploadAccessMW = async (req, res, next) => {
  try {
    const filename = String(req.params.filename ?? "").trim();
    const allowed = await canAccessPrivateUpload(String(req.userId), filename);
    if (!allowed) {
      return errorRes(res, 403, "Нет доступа к файлу");
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
