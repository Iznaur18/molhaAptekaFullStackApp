import { errorRes, successRes } from "../../services/http/index.js";
import {
  isDadataConfigured,
  suggestRuAddresses,
} from "../../utils/dadata/dadataClient.js";

/** POST /address/suggest — подсказки DaData (до дома, РФ). */
export const addressSuggestController = async (req, res) => {
  const query = String(req.body.query ?? "").trim();

  // Без ключей — пустой список (ручной ввод адреса остаётся доступен).
  if (!isDadataConfigured()) {
    return successRes(res, { suggestions: [], configured: false });
  }

  try {
    const suggestions = await suggestRuAddresses(query);
    return successRes(res, {
      configured: true,
      suggestions: suggestions.map((item) => ({
        value: item.value,
        unrestrictedValue: item.unrestricted_value,
        data: item.data,
      })),
    });
  } catch {
    return errorRes(res, 503, "Подсказки адресов временно недоступны");
  }
};
