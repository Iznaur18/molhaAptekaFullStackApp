import { DADATA_SUGGEST_COUNT } from "../../constants/dadataConstants.js";
import { errorRes, successRes } from "../../services/http/index.js";
import {
  geolocateRuAddresses,
  isDadataSuggestConfigured,
} from "../../utils/dadata/dadataClient.js";

/** POST /address/geolocate — DaData reverse geocode (до дома, РФ). */
export const addressGeolocateController = async (req, res) => {
  const lat = Number(req.body.lat);
  const lon = Number(req.body.lon);

  if (!isDadataSuggestConfigured()) {
    return successRes(res, { suggestions: [], configured: false });
  }

  try {
    const suggestions = await geolocateRuAddresses(lat, lon, {
      count: DADATA_SUGGEST_COUNT,
      radiusMeters: 300,
    });
    return successRes(res, {
      configured: true,
      suggestions: suggestions.map((item) => ({
        value: item.value,
        unrestrictedValue: item.unrestricted_value,
        data: item.data,
      })),
    });
  } catch {
    return errorRes(res, 503, "Определение адреса по карте временно недоступно");
  }
};
