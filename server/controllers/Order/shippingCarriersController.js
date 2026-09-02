import {
  listShippingCarrierSettings,
  setShippingCarrierEnabled,
} from "../../services/shipping/shippingCarrierSettings.js";
import { successRes } from "../../services/http/index.js";

/**
 * `GET /order/shipping-carriers` — какие службы можно выбрать сейчас.
 *
 * Читают и продавец в форме товара, и покупатель на чекауте: список задаёт
 * админ, и держать его копию в клиентских константах уже нельзя.
 */
export const getShippingCarriersController = async (_req, res) => {
  const carriers = await listShippingCarrierSettings();
  return successRes(res, {
    carriers: carriers.map(({ carrierId, label, available, regions }) => ({
      carrierId,
      label,
      available,
      regions,
    })),
  });
};

/** `GET /staff/shipping-carriers` — полная картина для админа. */
export const getStaffShippingCarriersController = async (_req, res) => {
  return successRes(res, { carriers: await listShippingCarrierSettings() });
};

/** `PATCH /staff/shipping-carriers/:carrierId` */
export const patchStaffShippingCarrierController = async (req, res) => {
  const carriers = await setShippingCarrierEnabled({
    carrierId: String(req.params.carrierId),
    enabled: req.body.enabled === true,
    adminId: String(req.userId),
  });
  return successRes(res, { carriers });
};
