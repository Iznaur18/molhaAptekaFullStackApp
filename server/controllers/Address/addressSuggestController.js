import { errorRes, successRes } from "../../utils/index.js";
import {
  isDadataConfigured,
  suggestRuAddresses,
} from "../../utils/dadata/dadataClient.js";

/** POST /address/suggest — подсказки DaData (до дома, РФ). */
export const addressSuggestController = async (req, res) => {
  try {
    if (!isDadataConfigured()) {
      return errorRes(
        res,
        503,
        "Подсказки адресов недоступны: задайте DADATA_API_KEY и DADATA_SECRET_KEY",
      );
    }

    const query = String(req.body.query ?? "").trim();
    const suggestions = await suggestRuAddresses(query);

    return successRes(res, {
      suggestions: suggestions.map((item) => ({
        value: item.value,
        unrestrictedValue: item.unrestricted_value,
        data: item.data,
      })),
    });
  } catch (error) {
    console.error("addressSuggest error:", error);
    return errorRes(res, 502, "Не удалось получить подсказки адреса");
  }
};
