import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";

const { connectMongoTestReplSet, disconnectMongoTestReplSet, clearMongoCollections } =
  await import("./helpers/mongoTestDb.js");
const { UserModel } = await import("../models/index.js");
const {
  buildCoarseAddressQueries,
  cleanAddressForOsm,
  extractHouseNumber,
  houseNumbersMatch,
} = await import("../services/shipping/geo/addressQueries.js");
const { dadataQcGeoPrecision } = await import("../utils/dadata/dadataGeocode.js");
const { resolveDeliveryDestination, resolveDeliveryOrigin } =
  await import("../services/order/resolveDeliveryPoints.js");
const { resolveRoadDistanceKm } =
  await import("../services/shipping/geo/roadRouter.js");
const { streetNameMatchesQuery } =
  await import("../services/shipping/geo/osmGeocoder.js");

const REAL_FETCH = globalThis.fetch;

/** Грозный, ул. Мира (как её отдаёт DaData — координатами улицы). */
const STREET_POINT = { lat: 43.3229, lon: 45.6906 };

/**
 * @param {(url: URL) => unknown} handler
 */
const stubGeoFetch = (handler) => {
  process.env.GEO_EXTERNAL_TEST = "1";
  process.env.GEO_NOMINATIM_INTERVAL_MS = "0";
  globalThis.fetch = async (input) => {
    const body = handler(new URL(String(input)));
    if (body instanceof Error) {
      throw body;
    }
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
};

/** @param {URL} url */
const isNominatim = (url) => url.host.includes("nominatim");
/** @param {URL} url */
const isPhoton = (url) => url.host.includes("photon");

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

beforeEach(async () => {
  await clearMongoCollections();
});

afterEach(() => {
  globalThis.fetch = REAL_FETCH;
  delete process.env.GEO_EXTERNAL_TEST;
  delete process.env.GEO_NOMINATIM_INTERVAL_MS;
});

describe("строка адреса для OpenStreetMap", () => {
  it("снимает сокращения ФИАС, район и квартиру", () => {
    assert.equal(
      cleanAddressForOsm("г Грозный, р-н Ахматовский, ул Мира, д 19, кв 5"),
      "Грозный, улица Мира, 19",
    );
    assert.equal(
      cleanAddressForOsm(
        "Чеченская Респ, Грозненский р-н, с Толстой-Юрт, ул Шерипова, д 4",
      ),
      "Чеченская Республика, Грозненский район, Толстой-Юрт, улица Шерипова, 4",
    );
  });

  it("достаёт номер дома и сравнивает его без пробелов и регистра", () => {
    assert.equal(extractHouseNumber("г Грозный, ул Мира, д 19А"), "19А");
    assert.equal(houseNumbersMatch("19а", "19А"), true);
    assert.equal(houseNumbersMatch("7 к 1", "7к1"), true);
    assert.equal(houseNumbersMatch("19", "71/19"), false);
  });

  it("строит запросы от точного к грубому", () => {
    assert.deepEqual(buildCoarseAddressQueries("Грозный, улица Мира, 19"), [
      "Грозный, улица Мира",
      "Грозный",
    ]);
  });

  it("точность DaData по qc_geo", () => {
    assert.equal(dadataQcGeoPrecision("0"), "house");
    assert.equal(dadataQcGeoPrecision(2), "street");
    assert.equal(dadataQcGeoPrecision("4"), "settlement");
    assert.equal(dadataQcGeoPrecision("5"), null);
    assert.equal(dadataQcGeoPrecision(undefined), null);
  });
});

describe("куда везти", () => {
  const HOUSE_ADDRESS = {
    displayAddress: "г Грозный, ул Мира, д 19",
    fiasId: "fias",
    geo: { lat: 43.33, lon: 45.69 },
    geoPrecision: "house",
  };

  it("клиентская точка рядом с домом точнее — берём её", async () => {
    const client = { lat: 43.3335, lon: 45.6905 };
    const destination = await resolveDeliveryDestination({
      verifiedAddress: HOUSE_ADDRESS,
      clientGeo: client,
    });
    assert.deepEqual(destination.point, client);
  });

  it("клиентская точка далеко от адреса — не верим ей", async () => {
    const destination = await resolveDeliveryDestination({
      verifiedAddress: HOUSE_ADDRESS,
      clientGeo: { lat: 43.3, lon: 45.75 },
    });
    assert.deepEqual(destination.point, HOUSE_ADDRESS.geo);
  });

  it("DaData не дала координат — находим дом в OpenStreetMap", async () => {
    stubGeoFetch((url) => {
      if (isNominatim(url)) {
        return [{ lat: "43.3301", lon: "45.6899", place_rank: 30 }];
      }
      return { features: [] };
    });
    const destination = await resolveDeliveryDestination({
      verifiedAddress: {
        displayAddress: "г Грозный, ул Мира, д 19",
        fiasId: "",
        geo: null,
      },
    });
    assert.deepEqual(destination.point, { lat: 43.3301, lon: 45.6899 });
    assert.equal(destination.precision, "house");
  });

  it("чужой дом из Photon засчитывается только как улица", async () => {
    stubGeoFetch((url) => {
      if (isPhoton(url)) {
        return {
          features: [
            {
              properties: {
                type: "house",
                housenumber: "71/19",
                street: "улица Мира",
                countrycode: "RU",
              },
              geometry: { coordinates: [45.6865, 43.3192] },
            },
          ],
        };
      }
      return [];
    });
    const destination = await resolveDeliveryDestination({
      verifiedAddress: {
        displayAddress: "г Грозный, ул Мира, д 19",
        fiasId: "",
        geo: null,
      },
    });
    assert.equal(destination.precision, "street");
  });

  it("не нашёлся ни дом, ни улица — считаем до населённого пункта", async () => {
    stubGeoFetch((url) => {
      if (isNominatim(url) && url.searchParams.get("q") === "Грозный") {
        return [{ lat: "43.3178", lon: "45.6949", place_rank: 16 }];
      }
      return isPhoton(url) ? { features: [] } : [];
    });
    const destination = await resolveDeliveryDestination({
      verifiedAddress: {
        displayAddress: "г Грозный, ул Несуществующая, д 1",
        geo: null,
      },
    });
    assert.equal(destination.precision, "settlement");
    assert.deepEqual(destination.point, { lat: 43.3178, lon: 45.6949 });
  });

  it("похожая, но чужая улица из Photon не принимается — берём город", async () => {
    // Вживую: «ул Несуществующая» Photon «нашёл» в пяти километрах.
    stubGeoFetch((url) => {
      if (isPhoton(url) && url.searchParams.get("q")?.includes("Несуществующая")) {
        return {
          features: [
            {
              properties: {
                type: "street",
                name: "улица Сайханова",
                countrycode: "RU",
              },
              geometry: { coordinates: [45.6986, 43.2702] },
            },
          ],
        };
      }
      if (isNominatim(url) && url.searchParams.get("q") === "Грозный") {
        return [{ lat: "43.3178", lon: "45.6949", place_rank: 16 }];
      }
      return isPhoton(url) ? { features: [] } : [];
    });
    const destination = await resolveDeliveryDestination({
      verifiedAddress: {
        displayAddress: "г Грозный, ул Несуществующая, д 1",
        geo: null,
      },
    });
    assert.equal(destination.precision, "settlement");
    assert.deepEqual(destination.point, { lat: 43.3178, lon: 45.6949 });
  });

  it("название улицы сверяется по значимым словам", () => {
    assert.equal(streetNameMatchesQuery("Грозный, улица Мира, 19", "улица Мира"), true);
    assert.equal(
      streetNameMatchesQuery("Грозный, улица Несуществующая, 1", "улица Сайханова"),
      false,
    );
    assert.equal(streetNameMatchesQuery("Грозный, улица Мира, 19", ""), false);
  });

  it("адрес не нашёлся нигде — остаётся точка покупателя", async () => {
    stubGeoFetch((url) => (isPhoton(url) ? { features: [] } : []));
    const client = { lat: 43.31, lon: 45.7 };
    const destination = await resolveDeliveryDestination({
      verifiedAddress: { displayAddress: "абракадабра", geo: null },
      clientGeo: client,
    });
    assert.deepEqual(destination.point, client);
  });

  it("адреса нет ни на карте, ни у покупателя — отказ, а не бесплатная доставка", async () => {
    stubGeoFetch((url) => (isPhoton(url) ? { features: [] } : []));
    await assert.rejects(
      resolveDeliveryDestination({
        verifiedAddress: { displayAddress: "абракадабра", geo: null },
      }),
      (error) => error.statusCode === 400 || error.status === 400,
    );
  });
});

describe("откуда везёт продавец", () => {
  /** @param {Record<string, unknown>} [defaults] */
  const createSeller = (defaults = {}) =>
    UserModel.create({
      email: `origin-${Math.random().toString(36).slice(2)}@example.com`,
      passwordHash: "x".repeat(20),
      userName: `origin${Math.random().toString(36).slice(2, 9)}`,
      ...defaults,
    });

  it("точка с товара — первая, и выбор не зависит от порядка строк", async () => {
    const seller = await createSeller();
    const rows = [
      { id: "b", productPickupLat: 43.5, productPickupLon: 45.5 },
      { id: "a", productPickupLat: 43.3, productPickupLon: 45.7 },
    ];
    const forward = await resolveDeliveryOrigin({
      sellerId: String(seller._id),
      productRows: rows,
    });
    const backward = await resolveDeliveryOrigin({
      sellerId: String(seller._id),
      productRows: [...rows].reverse(),
    });
    assert.deepEqual(forward.point, { lat: 43.3, lon: 45.7 });
    assert.deepEqual(backward.point, forward.point);
  });

  it("у товара нет координат — берём точку из профиля продавца", async () => {
    const seller = await createSeller({
      sellerFulfillmentDefaults: {
        pickupLocations: [
          {
            id: "profile-1",
            address: "г Грозный, ул Мира, 1",
            lat: 43.31,
            lon: 45.71,
            isDefault: true,
          },
        ],
        deliveryCarrier: "seller",
      },
    });
    const origin = await resolveDeliveryOrigin({
      sellerId: String(seller._id),
      productRows: [{ id: "a", productPickupLat: null, productPickupLon: null }],
    });
    assert.deepEqual(origin.point, { lat: 43.31, lon: 45.71 });
  });

  it("координат нет нигде — ищем адрес продажи на карте", async () => {
    stubGeoFetch((url) => {
      if (isNominatim(url)) {
        return [{ lat: STREET_POINT.lat, lon: STREET_POINT.lon, place_rank: 26 }];
      }
      return { features: [] };
    });
    const seller = await createSeller();
    const origin = await resolveDeliveryOrigin({
      sellerId: String(seller._id),
      productRows: [{ id: "a", productPickupAddress: "г Грозный, ул Мира, д 1" }],
    });
    assert.deepEqual(origin.point, STREET_POINT);
  });

  it("адрес продавца неизвестен — отказ", async () => {
    const seller = await createSeller();
    await assert.rejects(
      resolveDeliveryOrigin({
        sellerId: String(seller._id),
        productRows: [{ id: "a" }],
      }),
      (error) => error.statusCode === 409 || error.status === 409,
    );
  });
});

describe("маршрут по дорогам", () => {
  const FROM = { lat: 43.3, lon: 45.7 };
  const TO = { lat: 43.4, lon: 45.7 };

  it("к маршруту OSRM добавляется путь от точки до дороги", async () => {
    stubGeoFetch(() => ({
      code: "Ok",
      routes: [{ distance: 15_000 }],
      waypoints: [{ distance: 120 }, { distance: 80 }],
    }));
    const route = await resolveRoadDistanceKm(FROM, TO);
    assert.equal(route.distanceKm, 15.2);
    assert.equal(route.source, "road");
  });

  it("первый маршрутизатор лёг — отвечает следующий", async () => {
    stubGeoFetch((url) => {
      if (url.host === "routing.openstreetmap.de") {
        return new Error("timeout");
      }
      return { code: "Ok", routes: [{ distance: 14_000 }], waypoints: [] };
    });
    const route = await resolveRoadDistanceKm(FROM, TO);
    assert.equal(route.distanceKm, 14);
    assert.match(route.provider, /router\.project-osrm\.org/);
  });

  it("OSRM оба легли — выручает Valhalla", async () => {
    stubGeoFetch((url) => {
      if (url.host.includes("valhalla")) {
        return { trip: { summary: { length: 13.4 } } };
      }
      return { code: "NoRoute" };
    });
    const route = await resolveRoadDistanceKm(FROM, TO);
    assert.equal(route.distanceKm, 13.4);
    assert.equal(route.source, "road");
  });

  it("дорога не может быть короче прямой", async () => {
    stubGeoFetch(() => ({ code: "Ok", routes: [{ distance: 2_000 }], waypoints: [] }));
    const route = await resolveRoadDistanceKm(FROM, TO);
    assert.ok(route.distanceKm > 11, `получили ${route.distanceKm}`);
  });

  it("одна и та же точка — ноль без запросов", async () => {
    stubGeoFetch(() => {
      throw new Error("не должно вызываться");
    });
    const route = await resolveRoadDistanceKm(FROM, { ...FROM });
    assert.equal(route.distanceKm, 0);
  });

  it("внешние сервисы выключены — оценка по прямой, но не null", async () => {
    const route = await resolveRoadDistanceKm(FROM, TO);
    assert.equal(route.source, "estimate");
    assert.ok(
      route.distanceKm > 14 && route.distanceKm < 15,
      `получили ${route.distanceKm}`,
    );
  });
});
