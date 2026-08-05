import { AppError } from "../../errors/AppError.js";
import { isSellerOneCEnabled } from "./onecSettings.js";

/**
 * У продавца с включённой 1С товары приходят только из sync.
 * @param {string} sellerId
 */
export async function assertSellerManualProductCreateAllowed(sellerId) {
  const enabled = await isSellerOneCEnabled(sellerId);
  if (enabled) {
    throw new AppError(
      400,
      "У вас включена интеграция с 1С: товары создаются только из обмена. Выключите 1С или дождитесь sync.",
    );
  }
}
