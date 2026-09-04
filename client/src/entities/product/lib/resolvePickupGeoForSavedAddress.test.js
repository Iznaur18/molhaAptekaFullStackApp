import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createPickupLocationFromSaved,
  resolvePickupGeoForSavedAddress,
  validateProductPickupLocationsForm,
} from "./productPickupLocationsForm.js";

const fetchAddressSuggestions = vi.hoisted(() => vi.fn());

vi.mock("../../address/api/fetchAddressSuggestions.js", () => ({
  fetchAddressSuggestions,
}));

/**
 * Ответ подсказок DaData на прод-ключе, 2026-09-04. Дом в адресе есть и разобран,
 * но в ФИАС его нет: `house_fias_id` пустой, координаты — уровня улицы.
 */
const GROZNY_HOUSE_WITHOUT_FIAS = {
  value: "г Грозный, р-н Ахматовский, ул Субры Кишиевой, д 56",
  data: {
    city: "Грозный",
    settlement: "Ахматовский",
    street: "Субры Кишиевой",
    house: "56",
    house_fias_id: null,
    stead_fias_id: null,
    street_fias_id: "688f13ae-595e-4a8d-82b3-30dd0a6da377",
    region_kladr_id: "2000000000000",
    geo_lat: "43.324728",
    geo_lon: "45.711483",
  },
};

describe("resolvePickupGeoForSavedAddress", () => {
  beforeEach(() => {
    fetchAddressSuggestions.mockReset();
  });

  it("берёт сохранённые координаты, не дёргая подсказки", async () => {
    const geo = await resolvePickupGeoForSavedAddress({
      line: "г Москва, ул Рабочая, д 89А стр 1",
      geo: { lat: 55.7, lon: 37.6 },
    });

    expect(geo).toEqual({ lat: 55.7, lon: 37.6 });
    expect(fetchAddressSuggestions).not.toHaveBeenCalled();
  });

  it("догеокодирует адрес, дома которого нет в ФИАС", async () => {
    fetchAddressSuggestions.mockResolvedValue([GROZNY_HOUSE_WITHOUT_FIAS]);

    const geo = await resolvePickupGeoForSavedAddress({
      line: "г Грозный, р-н Ахматовский, ул Субры Кишиевой, д 56",
      geo: null,
    });

    expect(geo).toEqual({ lat: 43.324728, lon: 45.711483 });
  });

  it("после догеокодирования шаг 5 пропускает адрес из книги", async () => {
    fetchAddressSuggestions.mockResolvedValue([GROZNY_HOUSE_WITHOUT_FIAS]);

    const saved = {
      id: "037bb089-9632-4c53-ba80-cac4c587c500",
      label: "Супермаркет",
      line: "г Грозный, р-н Ахматовский, ул Субры Кишиевой, д 56",
      flat: "",
      geo: null,
      isDefault: true,
    };

    const geo = await resolvePickupGeoForSavedAddress(saved);
    const locations = [
      { ...createPickupLocationFromSaved(saved), ...geo, isDefault: true },
    ];

    expect(validateProductPickupLocationsForm(locations)).toBeNull();
  });

  it("не берёт координаты улицы: это не адрес точки", async () => {
    fetchAddressSuggestions.mockResolvedValue([
      {
        value: "г Грозный, ул Субры Кишиевой",
        data: {
          street_fias_id: "688f13ae-595e-4a8d-82b3-30dd0a6da377",
          geo_lat: "43.32",
          geo_lon: "45.71",
        },
      },
    ]);

    const geo = await resolvePickupGeoForSavedAddress({
      line: "г Грозный, ул Субры Кишиевой",
      geo: null,
    });

    expect(geo).toBeNull();
  });

  it("сбой подсказок оставляет адрес без координат, а не рушит форму", async () => {
    fetchAddressSuggestions.mockRejectedValue(new Error("503"));

    const geo = await resolvePickupGeoForSavedAddress({
      line: "г Грозный, р-н Ахматовский, ул Субры Кишиевой, д 56",
      geo: null,
    });

    expect(geo).toBeNull();
  });
});
