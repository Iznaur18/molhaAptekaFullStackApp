import { describe, expect, it } from "vitest";

import { buildUserVehicleProfileRows } from "./buildUserVehicleProfileRows.js";

describe("buildUserVehicleProfileRows", () => {
  it("returns vehicle rows when courierProfile has car data", () => {
    const rows = buildUserVehicleProfileRows({
      courierProfile: {
        vehicleMake: "Lada Granta",
        vehicleColor: "белый",
        vehiclePlate: "х123ум797",
      },
    });

    expect(rows).toEqual([
      { id: "userVehicleMake", label: "Марка и модель", value: "Lada Granta" },
      { id: "userVehicleColor", label: "Цвет авто", value: "белый" },
      { id: "userVehiclePlate", label: "Госномер", value: "х123ум797" },
    ]);
  });

  it("returns empty list when car is not specified", () => {
    expect(buildUserVehicleProfileRows({ courierProfile: {} })).toEqual([]);
    expect(buildUserVehicleProfileRows({})).toEqual([]);
  });
});
