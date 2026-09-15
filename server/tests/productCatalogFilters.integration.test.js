import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, test } from "node:test";

import { catalogProductFacetsDataSchema } from "@molha/api-contract";

import { ProductModel } from "../models/index.js";
import { invalidateCatalogProductsCache } from "../services/product/catalogProductsResponseCache.js";
import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
  approveProductViaApi,
  createProductViaApi,
  ensureProductCategoryTreeSeeded,
  parseSuccessData,
  registerUserAndGetCookie,
  setUserRole,
  verifyUserEmail,
} from "./helpers/integrationTestHelpers.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "integration-test-jwt-secret-min-32-chars";
process.env.NODE_ENV = "test";

/** @type {import('node:http').Server | null} */
let server = null;
/** @type {(path: string, init?: RequestInit) => Promise<Response>} */
let request = async () => new Response();

before(async () => {
  await connectMongoTestReplSet();
  const testServer = await startHttpTestServer();
  server = testServer.server;
  request = testServer.request;
});

beforeEach(() => {
  // Каталог кэширует ответы на 20 с — между тестами данные разные.
  invalidateCatalogProductsCache();
});

afterEach(async () => {
  await clearMongoCollections();
});

after(async () => {
  if (server) {
    await stopHttpTestServer(server);
  }
  await disconnectMongoTestReplSet();
});

const NO_DELIVERY = {
  productDeliveryCarrier: "",
  productDeliveryEnabled: false,
  productCourierDeliveryEnabled: false,
  productPickupEnabled: false,
};

/**
 * Четыре одобренных товара:
 * cheap  — 50 ₽ (было 100), везёт продавец, рейтинг 4.5, возврат;
 * mid    — 150 ₽, курьеры Gitorg по старому флагу (поле перевозчика пустое);
 * pricey — 300 ₽, только самовывоз;
 * lobo   — 90 ₽ (было 100), служба доставки ЛОБО.
 */
const seedFilterCatalog = async () => {
  await ensureProductCategoryTreeSeeded();

  const { cookie: sellerCookie } = await registerUserAndGetCookie(
    request,
    "filters-seller",
  );
  await verifyUserEmail("int-filters-seller@example.com");

  const created = [];
  for (const productName of [
    "Cheap Seller Delivery",
    "Mid Legacy Courier",
    "Pricey Pickup",
    "Lobo Small Discount",
  ]) {
    created.push(await createProductViaApi(request, sellerCookie, { productName }));
  }

  const { cookie: modCookie, user: modUser } = await registerUserAndGetCookie(
    request,
    "filters-mod",
  );
  await setUserRole(modUser._id, "moderator");
  for (const product of created) {
    await approveProductViaApi(request, modCookie, String(product._id));
  }

  const [cheap, mid, pricey, lobo] = created.map((product) => String(product._id));

  await ProductModel.updateOne(
    { _id: cheap },
    {
      $set: {
        ...NO_DELIVERY,
        productPrice: 50,
        productOldPrice: 100,
        productDeliveryCarrier: "seller",
        productDeliveryEnabled: true,
        averageRating: 4.5,
        reviewCount: 2,
        productReturnEnabled: true,
      },
    },
  );
  await ProductModel.updateOne(
    { _id: mid },
    {
      $set: { ...NO_DELIVERY, productPrice: 150, productCourierDeliveryEnabled: true },
    },
  );
  await ProductModel.updateOne(
    { _id: pricey },
    { $set: { ...NO_DELIVERY, productPrice: 300, productPickupEnabled: true } },
  );
  await ProductModel.updateOne(
    { _id: lobo },
    {
      $set: {
        ...NO_DELIVERY,
        productPrice: 90,
        productOldPrice: 100,
        productDeliveryCarrier: "lobo",
      },
    },
  );

  return { cheap, mid, pricey, lobo };
};

/**
 * @param {string} query
 */
const fetchCatalog = async (query) => {
  const response = await request(`/product?limit=100&${query}`);
  assert.equal(response.status, 200, await response.clone().text());
  return parseSuccessData(response);
};

/**
 * @param {string} query
 */
const fetchFacets = async (query) => {
  const response = await request(`/product/facets?${query}`);
  assert.equal(response.status, 200, await response.clone().text());
  const data = await parseSuccessData(response);
  assert.equal(
    catalogProductFacetsDataSchema.safeParse(data).success,
    true,
    JSON.stringify(data),
  );
  return data;
};

/** @param {{ products: { _id: unknown }[] }} data */
const idsOf = (data) => data.products.map((product) => String(product._id));

test("priceMin / priceMax оставляют только товары в диапазоне", async () => {
  const ids = await seedFilterCatalog();

  const data = await fetchCatalog("priceMin=60&priceMax=200");

  assert.deepEqual(new Set(idsOf(data)), new Set([ids.mid, ids.lobo]));
  assert.equal(data.pagination.total, 2);
});

test("sort=price_asc и price_desc упорядочивают по цене", async () => {
  const ids = await seedFilterCatalog();

  assert.deepEqual(idsOf(await fetchCatalog("sort=price_asc")), [
    ids.cheap,
    ids.lobo,
    ids.mid,
    ids.pricey,
  ]);
  assert.deepEqual(idsOf(await fetchCatalog("sort=price_desc")), [
    ids.pricey,
    ids.mid,
    ids.lobo,
    ids.cheap,
  ]);
});

test("sort=discount — сначала большая скидка, товары без скидки в конце", async () => {
  const ids = await seedFilterCatalog();

  const ordered = idsOf(await fetchCatalog("sort=discount"));

  assert.deepEqual(ordered.slice(0, 2), [ids.cheap, ids.lobo]);
  assert.deepEqual(new Set(ordered.slice(2)), new Set([ids.mid, ids.pricey]));
});

test("delivery — «или» внутри группы, старый флаг курьеров учитывается", async () => {
  const ids = await seedFilterCatalog();

  assert.deepEqual(
    new Set(idsOf(await fetchCatalog("delivery=seller,courier"))),
    new Set([ids.cheap, ids.mid]),
  );
  assert.deepEqual(idsOf(await fetchCatalog("delivery=carrier")), [ids.lobo]);
});

test("pickupOnly, ratingMin, withReviews, returnOnly", async () => {
  const ids = await seedFilterCatalog();

  assert.deepEqual(idsOf(await fetchCatalog("pickupOnly=true")), [ids.pricey]);
  assert.deepEqual(idsOf(await fetchCatalog("ratingMin=4")), [ids.cheap]);
  assert.deepEqual(idsOf(await fetchCatalog("withReviews=true")), [ids.cheap]);
  assert.deepEqual(idsOf(await fetchCatalog("returnOnly=true")), [ids.cheap]);
});

test("неверные фильтры — 400, старые sort=premium и sort=confirmed работают", async () => {
  await seedFilterCatalog();

  assert.equal((await request("/product?priceMin=500&priceMax=100")).status, 400);
  assert.equal((await request("/product?delivery=teleport")).status, 400);
  assert.equal((await request("/product/facets?ratingMin=2")).status, 400);
  assert.equal((await request("/product?sort=premium")).status, 200);
  assert.equal((await request("/product?sort=confirmed")).status, 200);
});

test("фасеты: total как у выдачи, цена без ценового фильтра, счётчики вариантов", async () => {
  await seedFilterCatalog();

  const list = await fetchCatalog("priceMax=100");
  const facets = await fetchFacets("priceMax=100");

  assert.equal(facets.total, list.pagination.total);
  assert.equal(facets.total, 2);
  assert.equal(facets.price.min, 50);
  assert.equal(facets.price.max, 300);
  assert.deepEqual(facets.options.delivery, { seller: 1, courier: 0, carrier: 1 });
  assert.equal(facets.options.withReviews, 1);
  assert.equal(facets.options.ratingMin4, 1);
  assert.equal(facets.options.returnOnly, 1);
  assert.equal(facets.options.pickupOnly, 0);
  assert.equal(facets.options.followingOnly, null);
  assert.equal(facets.options.near, null);
});

test("фасеты: способ получения добавляется к выбранному через «или»", async () => {
  await seedFilterCatalog();

  const list = await fetchCatalog("priceMax=200&delivery=seller");
  const facets = await fetchFacets("priceMax=200&delivery=seller");

  assert.equal(facets.total, list.pagination.total);
  assert.equal(facets.total, 1);
  assert.equal(facets.options.delivery.seller, 1);
  assert.equal(facets.options.delivery.courier, 2);
  assert.equal(facets.options.delivery.carrier, 2);
});

test("фасеты с поиском совпадают с выдачей", async () => {
  await seedFilterCatalog();

  const list = await fetchCatalog("search=Pickup");
  const facets = await fetchFacets("search=Pickup");

  assert.equal(list.pagination.total, 1);
  assert.equal(facets.total, 1);
});
