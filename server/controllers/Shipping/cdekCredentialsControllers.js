import { successRes } from "../../services/http/index.js";
import {
  readCdekConnectionState,
  removeSellerCdekCredentials,
  saveSellerCdekCredentials,
} from "../../services/shipping/cdek/cdekSellerCredentials.js";
import { UserModel } from "../../models/index.js";

/*
 * Адреса живут под префиксом /user, а не под новым /shipping: каждый новый
 * префикс нужно отдельно прописывать в nginx на проде, иначе GET отдаёт HTML,
 * а PUT — 405 (docs: префиксы API в nginx).
 */

/** GET /user/me/cdek-credentials — состояние подключения продавца. */
export const getCdekCredentialsController = async (req, res) => {
  const seller = await UserModel.findById(req.userId).select("cdekIntegration").lean();
  return successRes(res, {
    cdek: readCdekConnectionState(seller?.cdekIntegration),
  });
};

/** PUT /user/me/cdek-credentials — сохранить ключи (с проверкой у СДЭК). */
export const putCdekCredentialsController = async (req, res) => {
  const cdek = await saveSellerCdekCredentials({
    sellerId: req.userId,
    account: req.body.account,
    secure: req.body.secure,
    environment: req.body.environment,
  });
  return successRes(res, { message: "СДЭК подключён", cdek });
};

/** DELETE /user/me/cdek-credentials — отключить СДЭК у продавца. */
export const deleteCdekCredentialsController = async (req, res) => {
  const cdek = await removeSellerCdekCredentials(req.userId);
  return successRes(res, { message: "СДЭК отключён", cdek });
};
