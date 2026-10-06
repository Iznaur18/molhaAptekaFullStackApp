import { describe, expect, it } from "vitest";

import {
  getMissingSellerSocialFields,
  getSellerSocialLinks,
} from "./getSellerSocialLinks.js";

describe("getSellerSocialLinks", () => {
  it("отдаёт только заполненные ссылки, Instagram первым", () => {
    const links = getSellerSocialLinks({
      socialWebsiteUrl: "https://example.com",
      socialTelegramUrl: "",
      socialVkUrl: null,
      socialWhatsappUrl: "https://wa.me/79280000000",
      socialInstagramUrl: " https://instagram.com/shop ",
    });

    expect(links.map((link) => link.id)).toEqual([
      "socialInstagramUrl",
      "socialWhatsappUrl",
      "socialWebsiteUrl",
    ]);
    expect(links[0]).toMatchObject({
      label: "Instagram",
      href: "https://instagram.com/shop",
      display: "instagram.com/shop",
    });
  });

  it("не пускает в ссылку ничего, кроме http(s)", () => {
    expect(
      getSellerSocialLinks({
        socialWebsiteUrl: "javascript:alert(1)",
        socialInstagramUrl: "shop",
      }),
    ).toEqual([]);
  });

  it("незаполненные поля — всё, чего нет среди ссылок", () => {
    const links = getSellerSocialLinks({
      socialInstagramUrl: "https://instagram.com/shop",
      socialWebsiteUrl: "https://example.com",
    });

    expect(getMissingSellerSocialFields(links).map((field) => field.id)).toEqual([
      "socialWhatsappUrl",
      "socialTelegramUrl",
      "socialYoutubeUrl",
      "socialVkUrl",
    ]);
    expect(getMissingSellerSocialFields([])).toHaveLength(6);
  });

  it("без продавца — пусто", () => {
    expect(getSellerSocialLinks(null)).toEqual([]);
  });
});
