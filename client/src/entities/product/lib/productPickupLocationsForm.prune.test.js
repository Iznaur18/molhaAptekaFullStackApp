import { describe, expect, it } from "vitest";

import {
  pruneProductPickupLocationsToSelection,
} from "./productPickupLocationsForm.js";

describe("pruneProductPickupLocationsToSelection", () => {
  const profileAddresses = [
    {
      id: "moscow-id",
      line: "г Москва, ул Рабочая, д 89А стр 1",
      flat: "",
    },
    {
      id: "grozny-id",
      line: "г Грозный, р-н Ахматовский, ул имени Эсет Кишиевой, д 28А к 2",
      flat: "",
    },
  ];

  it("keeps only selected profile location and drops stale orphan", () => {
    const locations = [
      {
        id: "orphan-moscow",
        label: "",
        address: "г Москва, ул 18-я Московско-орешковская, д 18 стр 1",
        lat: 55.62,
        lon: 37.78,
        isDefault: true,
      },
      {
        id: "grozny-id",
        label: "",
        address: "г Грозный, р-н Ахматовский, ул имени Эсет Кишиевой, д 28А к 2",
        lat: 43.31,
        lon: 45.71,
        isDefault: false,
      },
    ];

    const pruned = pruneProductPickupLocationsToSelection(
      locations,
      profileAddresses,
      new Set(["grozny-id"]),
    );

    expect(pruned).toHaveLength(1);
    expect(pruned[0].id).toBe("grozny-id");
  });

  it("keeps confirmed custom location", () => {
    const locations = [
      {
        id: "custom-1",
        label: "",
        address: "г Казань, ул Баумана, д 1",
        lat: 55.79,
        lon: 49.12,
        isDefault: true,
      },
    ];

    const pruned = pruneProductPickupLocationsToSelection(
      locations,
      profileAddresses,
      new Set(),
      new Set(["custom-1"]),
    );

    expect(pruned).toHaveLength(1);
    expect(pruned[0].address).toContain("Казань");
  });
});
