import { successRes } from "../../services/http/index.js";
import { geolocateAddresses } from "../../services/address/dadataAddress.js";

/** POST /address/geolocate — DaData reverse geocode (до дома, РФ). */
export const addressGeolocateController = async (req, res) => {
  const data = await geolocateAddresses({
    lat: req.body.lat,
    lon: req.body.lon,
  });
  return successRes(res, data);
};
