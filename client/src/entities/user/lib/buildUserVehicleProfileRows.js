import { getCourierVehiclePublicFields } from "@molha/api-contract";

import { USER_PROFILE_COPY } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ courierProfile?: Record<string, unknown> | null }} user
 * @returns {{ id: string; label: string; value: string }[]}
 */
export function buildUserVehicleProfileRows(user) {
  const vehicle = getCourierVehiclePublicFields(user?.courierProfile);
  if (!vehicle) {
    return [];
  }

  const L = USER_PROFILE_COPY.LABELS;
  /** @type {{ id: string; label: string; value: string }[]} */
  const rows = [];

  if (vehicle.vehicleMake) {
    rows.push({
      id: "userVehicleMake",
      label: L.userVehicleMake,
      value: vehicle.vehicleMake,
    });
  }

  if (vehicle.vehicleColor) {
    rows.push({
      id: "userVehicleColor",
      label: L.userVehicleColor,
      value: vehicle.vehicleColor,
    });
  }

  if (vehicle.vehiclePlate) {
    rows.push({
      id: "userVehiclePlate",
      label: L.userVehiclePlate,
      value: vehicle.vehiclePlate,
    });
  }

  return rows;
}
