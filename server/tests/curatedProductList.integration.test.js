import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import CuratedProductListModel from "../models/CuratedProductListModel.js";
import { ProductModel, UserModel } from "../models/index.js";
import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
  approveProductViaApi,
  createProductViaApi,
  ensureProductCategoryTreeSeeded,
  parseErrorMessage,
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
import { resolveUserAddressCityNormalized } from "../utils/ruCityNormalized.js";

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

afterEach(async () => {
  await clearMongoCollections();
});

after(async () => {
  if (server) {
    await stopHttpTestServer(server);
  }
  await disconnectMongoTestReplSet();
});

const seedCuratedFixture = async () => {
  await ensureProductCategoryTreeSeeded();

  const { cookie: adminCookie, user: adminUser } = await registerUserAndGetCookie(
    request,
    "curated-admin",
  );
  await verifyUserEmail("int-curated-admin@example.com");
  await setUserRole(adminUser._id, "admin");

  const { cookie: sellerCookie } = await registerUserAndGetCookie(request, "curated-seller");
  await verifyUserEmail("int-curated-seller@example.com");

  const moscowProduct = await createProductViaApi(request, sellerCookie, {
    productName: "Curated Moscow",
    productSaleCity: "г Москва",
  });
  const kazanProduct = await createProductViaApi(request, sellerCookie, {
    productName: "Curated Kazan",
    productSaleCity: "Казань",
  });

  const { cookie: modCookie, user: modUser } = await registerUserAndGetCookie(
    request,
    "curated-mod",
  );
  await setUserRole(modUser._id, "moderator");
  await approveProductViaApi(request, modCookie, String(moscowProduct._id));
  await approveProductViaApi(request, modCookie, String(kazanProduct._id));

  const { cookie: buyerCookie, user: buyer } = await registerUserAndGetCookie(
    request,
    "curated-buyer",
  );
  await verifyUserEmail("int-curated-buyer@example.com");
  await UserModel.findByIdAndUpdate(buyer._id, {
    userAddressCity: "Москва",
    userAddressCityNormalized: resolveUserAddressCityNormalized("Москва"),
  });

  return {
    adminCookie,
    buyerCookie,
    productIds: {
      moscow: String(moscowProduct._id),
      kazan: String(kazanProduct._id),
    },
  };
};

const createCuratedList = async (adminCookie, title) => {
  const data = await parseSuccessData(
    await request("/product/admin/curated-lists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({ title }),
    }),
  );
  return data.list;
};

test("curated lists: admin CRUD, duplicate reject, reorder requires full set", async () => {
  const { adminCookie, productIds } = await seedCuratedFixture();
  const list = await createCuratedList(adminCookie, "Хиты");

  const addResponse = await request(`/product/admin/curated-lists/${list._id}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({ productId: productIds.moscow }),
  });
  assert.equal(addResponse.status, 200);

  const duplicateResponse = await request(`/product/admin/curated-lists/${list._id}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({ productId: productIds.moscow }),
  });
  assert.equal(duplicateResponse.status, 409);

  const listTwo = await createCuratedList(adminCookie, "Новинки");
  const partialReorder = await request("/product/admin/curated-lists/reorder", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({ orderedListIds: [listTwo._id] }),
  });
  assert.equal(partialReorder.status, 400);
  assert.match(await parseErrorMessage(partialReorder), /полный порядок/i);

  const fullReorder = await request("/product/admin/curated-lists/reorder", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({ orderedListIds: [listTwo._id, list._id] }),
  });
  assert.equal(fullReorder.status, 200);
});

test("curated lists home: city filter for buyer and allCities bypass", async () => {
  const { adminCookie, buyerCookie, productIds } = await seedCuratedFixture();
  const list = await createCuratedList(adminCookie, "Подборка");

  await parseSuccessData(
    await request(`/product/admin/curated-lists/${list._id}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({ productId: productIds.moscow }),
    }),
  );
  await parseSuccessData(
    await request(`/product/admin/curated-lists/${list._id}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({ productId: productIds.kazan }),
    }),
  );

  const moscowOnlyData = await parseSuccessData(
    await request("/product/curated-lists/home", {
      headers: { Cookie: buyerCookie },
    }),
  );
  assert.equal(moscowOnlyData.lists.length, 1);
  assert.deepEqual(
    moscowOnlyData.lists[0].products.map((product) => String(product._id)),
    [productIds.moscow],
  );

  const allCitiesData = await parseSuccessData(
    await request("/product/curated-lists/home?allCities=true", {
      headers: { Cookie: buyerCookie },
    }),
  );
  assert.equal(allCitiesData.lists[0].products.length, 2);
});

test("curated lists home: autopurge removes unavailable product ids", async () => {
  const { adminCookie, productIds } = await seedCuratedFixture();
  const list = await createCuratedList(adminCookie, "Автопурж");

  await parseSuccessData(
    await request(`/product/admin/curated-lists/${list._id}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({ productId: productIds.moscow }),
    }),
  );

  await ProductModel.findByIdAndUpdate(productIds.kazan, { productIsAvailable: false });
  await CuratedProductListModel.updateOne(
    { _id: list._id },
    { $set: { productIds: [productIds.moscow, productIds.kazan] } },
  );

  const homeData = await parseSuccessData(await request("/product/curated-lists/home"));
  assert.equal(homeData.lists.length, 1);
  assert.deepEqual(
    homeData.lists[0].products.map((product) => String(product._id)),
    [productIds.moscow],
  );

  const adminData = await parseSuccessData(
    await request("/product/admin/curated-lists", {
      headers: { Cookie: adminCookie },
    }),
  );
  assert.deepEqual(adminData.lists[0].productIds, [productIds.moscow]);
});
