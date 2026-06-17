import { RAFFLE_STATUS_PENDING_STAFF } from "../../constants/raffleConstants.js";
import { AppError } from "../../errors/AppError.js";
import { RaffleModel } from "../../models/index.js";
import { normalizeStoredUploadUrl } from "../upload/buildPublicUploadUrl.js";
import {
  assertSellerCanCreateRaffle,
  toPublicRafflePayload,
} from "./raffleHelpers.js";
import { normalizeRafflePrizeImageFocus } from "../user/profileImageFocus.js";
import { normalizePrizeMediaType } from "./rafflePrizeMedia.js";

/**
 * @param {{
 *   sellerId: string;
 *   body: Record<string, unknown>;
 * }} input
 */
export async function createRaffle({ sellerId, body }) {
  const access = await assertSellerCanCreateRaffle(sellerId);
  if (!access.ok) {
    throw new AppError(403, access.message);
  }

  const prizeMediaType = normalizePrizeMediaType(body.prizeMediaType);

  const raffle = await RaffleModel.create({
    sellerId,
    title: String(body.title).trim(),
    description: String(body.description ?? "").trim(),
    prizeMediaType,
    prizeImageUrl: normalizeStoredUploadUrl(String(body.prizeImageUrl ?? "").trim()),
    prizeVideoUrl: normalizeStoredUploadUrl(String(body.prizeVideoUrl ?? "").trim()),
    prizeImageFocus: normalizeRafflePrizeImageFocus(body.prizeImageFocus),
    targetSales: Number(body.targetSales),
    instagramUrl: String(body.instagramUrl).trim(),
    status: RAFFLE_STATUS_PENDING_STAFF,
  });

  return {
    message: "Розыгрыш отправлен на модерацию",
    raffle: toPublicRafflePayload(raffle.toObject()),
  };
}
