import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  API_CLIENT_UI,
  PRODUCT_PRICE_OFFER_UI,
} from "../../../shared/config/appUiCopy.js";
import { resolvePriceOfferStatusLabel } from "../lib/resolvePriceOfferStatusLabel.js";

const getMock = vi.fn();

vi.mock("../../../shared/api/index.js", () => ({
  apiClient: {
    get: (...args) => getMock(...args),
  },
}));

const { fetchSellerPriceOfferArchive } =
  await import("./fetchSellerPriceOfferArchive.js");

describe("fetchSellerPriceOfferArchive", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("читает ставки из data.data.offers, как отдаёт сервер", async () => {
    const offers = [{ _id: "o1", offerPrice: 100, status: "rejected" }];
    getMock.mockResolvedValue({ data: { success: true, data: { offers } } });

    await expect(fetchSellerPriceOfferArchive("p1")).resolves.toEqual(offers);
    expect(getMock).toHaveBeenCalledWith("/product/p1/price-offers/archive");
  });

  it("на кривой ответ — понятная ошибка", async () => {
    getMock.mockResolvedValue({ data: { offers: [] } });

    await expect(fetchSellerPriceOfferArchive("p1")).rejects.toThrow(
      API_CLIENT_UI.INVALID_SERVER_RESPONSE,
    );
  });
});

describe("resolvePriceOfferStatusLabel", () => {
  it("показывает статус словами, а не кодом", () => {
    expect(resolvePriceOfferStatusLabel("rejected")).toBe(
      PRODUCT_PRICE_OFFER_UI.STATUS_REJECTED,
    );
    expect(resolvePriceOfferStatusLabel("ordered")).toBe(
      PRODUCT_PRICE_OFFER_UI.STATUS_ORDERED,
    );
    expect(resolvePriceOfferStatusLabel("accepted")).toBe(
      PRODUCT_PRICE_OFFER_UI.ACCEPTED_BADGE,
    );
    expect(resolvePriceOfferStatusLabel(undefined)).toBe("");
  });
});
