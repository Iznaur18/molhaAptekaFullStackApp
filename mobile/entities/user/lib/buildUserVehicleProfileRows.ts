import { getCourierVehiclePublicFields } from "@molha/api-contract";

import { USER_PROFILE_COPY } from "@/shared/config";

import type { ProfileRow } from "./groupProfileRows";

type UserWithCourierProfile = {
  courierProfile?: Record<string, unknown> | null;
};

export const buildUserVehicleProfileRows = (user: UserWithCourierProfile): ProfileRow[] => {
  const vehicle = getCourierVehiclePublicFields(user?.courierProfile);
  if (!vehicle) {
    return [];
  }

  const L = USER_PROFILE_COPY.LABELS;
  const rows: ProfileRow[] = [];

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
};
