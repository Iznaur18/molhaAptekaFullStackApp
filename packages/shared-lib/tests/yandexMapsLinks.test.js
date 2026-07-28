import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildYandexMapsAppUrl,
  buildYandexMapsWebUrl,
  buildYandexNavigatorAppUrl,
  resolveYandexMapsOpenCandidates,
} from "../dist/yandexMapsLinks.js";

describe("yandexMapsLinks", () => {
  it("builds web url from coords", () => {
    assert.equal(
      buildYandexMapsWebUrl({ lat: 55.75, lon: 37.62 }),
      "https://yandex.ru/maps/?pt=37.62,55.75&z=17&l=map",
    );
  });

  it("builds web url from address when no coords", () => {
    assert.equal(
      buildYandexMapsWebUrl({ address: "Москва, Тверская 1" }),
      `https://yandex.ru/maps/?text=${encodeURIComponent("Москва, Тверская 1")}`,
    );
  });

  it("builds app deep links only with coords", () => {
    assert.equal(
      buildYandexMapsAppUrl({ lat: 55.75, lon: 37.62 }),
      "yandexmaps://maps.yandex.ru/?pt=37.62,55.75&z=17",
    );
    assert.equal(
      buildYandexNavigatorAppUrl({ lat: 55.75, lon: 37.62 }),
      "yandexnavi://build_route_on_map?lat_to=55.75&lon_to=37.62",
    );
    assert.equal(buildYandexMapsAppUrl({ address: "Москва" }), null);
  });

  it("orders candidates navi → maps app → web", () => {
    const list = resolveYandexMapsOpenCandidates({
      lat: 55.75,
      lon: 37.62,
      address: "x",
    });
    assert.ok(list[0].includes("yandexnavi://"));
    assert.ok(list[1].includes("yandexmaps://"));
    assert.ok(list[2].includes("https://yandex.ru/maps/"));
  });
});
