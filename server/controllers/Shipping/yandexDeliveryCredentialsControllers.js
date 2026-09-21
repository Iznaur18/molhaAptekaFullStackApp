import { successRes } from "../../services/http/index.js";
import {
  isYandexDeliveryOfferedBySeller,
  readYandexDeliveryConnectionState,
  removeSellerYandexDeliveryToken,
  saveSellerYandexDeliveryToken,
  setSellerYandexDeliveryEnabled,
} from "../../services/shipping/yandex/yandexDeliverySellerCredentials.js";
import { UserModel } from "../../models/index.js";

/*
 * Как и у СДЭК, адреса живут под /user и /order: новый префикс пришлось бы
 * отдельно прописывать в nginx на проде.
 */

/** GET /user/me/yandex-delivery-credentials — состояние подключения. */
export const getYandexDeliveryCredentialsController = async (req, res) => {
  const seller = await UserModel.findById(req.userId)
    .select("yandexDeliveryIntegration")
    .lean();
  return successRes(res, {
    yandexDelivery: readYandexDeliveryConnectionState(
      seller?.yandexDeliveryIntegration,
    ),
  });
};

/** PUT /user/me/yandex-delivery-credentials — сохранить токен (с проверкой). */
export const putYandexDeliveryCredentialsController = async (req, res) => {
  const yandexDelivery = await saveSellerYandexDeliveryToken({
    sellerId: req.userId,
    token: req.body.token,
    environment: req.body.environment,
  });
  return successRes(res, { message: "Яндекс Доставка подключена", yandexDelivery });
};

/** DELETE /user/me/yandex-delivery-credentials — отключить. */
export const deleteYandexDeliveryCredentialsController = async (req, res) => {
  const yandexDelivery = await removeSellerYandexDeliveryToken(req.userId);
  return successRes(res, { message: "Яндекс Доставка отключена", yandexDelivery });
};

/** PATCH /user/me/yandex-delivery-credentials — тумблер. */
export const patchYandexDeliveryCredentialsController = async (req, res) => {
  const yandexDelivery = await setSellerYandexDeliveryEnabled({
    sellerId: req.userId,
    enabled: req.body.enabled === true,
  });
  return successRes(res, {
    message: yandexDelivery.enabled
      ? "Яндекс Доставка включена для покупателей"
      : "Яндекс Доставка выключена для покупателей",
    yandexDelivery,
  });
};

/** GET /order/yandex-delivery-availability — предлагает ли продавец Яндекс Доставку. */
export const getYandexDeliveryAvailabilityController = async (req, res) => {
  const seller = await UserModel.findById(String(req.query.sellerId))
    .select("yandexDeliveryIntegration")
    .lean();
  return successRes(res, {
    available: isYandexDeliveryOfferedBySeller(seller?.yandexDeliveryIntegration),
  });
};
