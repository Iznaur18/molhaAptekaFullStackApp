import { AppError } from "../../errors/AppError.js";
import { UserModel } from "../../models/index.js";
import {
  emitSellerQrScannedEvent,
  getSellerQrScanStats,
} from "../../services/analytics-events/index.js";
import { successRes } from "../../services/http/index.js";

/** POST /analytics/track-seller-qr — переход на витрину по QR-коду (auth optional). */
export async function trackSellerQrScanController(req, res) {
  const { sellerId, visitorId } = req.body;

  // Несуществующего продавца не считаем: иначе в события можно писать мусор.
  const sellerExists = await UserModel.exists({ _id: sellerId });
  if (!sellerExists) {
    throw new AppError(404, "Продавец не найден");
  }

  emitSellerQrScannedEvent({
    sellerId,
    visitorId,
    actorUserId: req.userId ? String(req.userId) : null,
  });
  return successRes(res, { ok: true });
}

/** GET /analytics/seller-qr/me — сколько раз открывали мою витрину по QR-коду. */
export async function getMySellerQrStatsController(req, res) {
  const stats = await getSellerQrScanStats({ sellerId: String(req.userId) });
  return successRes(res, stats);
}
