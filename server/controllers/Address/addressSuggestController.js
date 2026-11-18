import { successRes } from "../../services/http/index.js";
import { suggestAddresses } from "../../services/address/dadataAddress.js";

/** POST /address/suggest — подсказки DaData (до дома, РФ). */
export const addressSuggestController = async (req, res) => {
  const data = await suggestAddresses({ query: req.body.query });
  return successRes(res, data);
};
