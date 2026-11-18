import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, test } from "node:test";

import { isSellerScheduleClosedNow } from "@molha/api-contract";

import { UserModel } from "../models/index.js";
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

/**
 * @param {string} [regionCode]
 */
const buildClosedNowHours = (regionCode = "RU-MOW") => {
  for (let day = 0; day < 7; day += 1) {
    const schedule = {
      enabled: true,
      weekdays: [day],
      openTime: "09:00",
      closeTime: "18:00",
    };
    if (isSellerScheduleClosedNow(schedule, regionCode)) {
      return {
        userBusinessHoursEnabled: true,
        userBusinessHours: {
          weekdays: [day],
          openTime: "09:00",
          closeTime: "18:00",
        },
        userRegionCode: regionCode,
      };
    }
  }
  throw new Error("Не удалось подобрать закрытый график");
};

before(async () => {
  await connectMongoTestReplSet();
  const testServer = await startHttpTestServer();
  server = testServer.server;
  request = testServer.request;
});

beforeEach(() => {
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

test("GET /product скрывает товары закрытого продавца; свои остаются", async () => {
  await ensureProductCategoryTreeSeeded();

  const { cookie: closedSellerCookie, user: closedSeller } =
    await registerUserAndGetCookie(request, "closed-cat");
  await verifyUserEmail("int-closed-cat@example.com");
  await UserModel.updateOne({ _id: closedSeller._id }, { $set: buildClosedNowHours() });

  const { cookie: openSellerCookie } = await registerUserAndGetCookie(request, "open-cat");
  await verifyUserEmail("int-open-cat@example.com");

  const { cookie: modCookie, user: modUser } = await registerUserAndGetCookie(
    request,
    "mod-closed-cat",
  );
  await setUserRole(modUser._id, "moderator");

  const closedProduct = await createProductViaApi(request, closedSellerCookie, {
    productName: "Closed Seller Product",
  });
  const openProduct = await createProductViaApi(request, openSellerCookie, {
    productName: "Open Seller Product",
  });
  await approveProductViaApi(request, modCookie, String(closedProduct._id));
  await approveProductViaApi(request, modCookie, String(openProduct._id));

  const anonData = await parseSuccessData(await request("/product?regionCode=RU-MOW"));
  const anonIds = anonData.products.map((product) => String(product._id));
  assert.equal(anonIds.includes(String(openProduct._id)), true);
  assert.equal(anonIds.includes(String(closedProduct._id)), false);

  const selfData = await parseSuccessData(
    await request("/product?regionCode=RU-MOW", {
      headers: { Cookie: closedSellerCookie },
    }),
  );
  const selfIds = selfData.products.map((product) => String(product._id));
  assert.equal(selfIds.includes(String(closedProduct._id)), true);
  assert.equal(selfIds.includes(String(openProduct._id)), true);

  const byId = await parseSuccessData(
    await request(`/product/${closedProduct._id}/catalog`),
  );
  assert.equal(String(byId.product._id), String(closedProduct._id));
  assert.equal(byId.product.isSellerClosedNow, true);
});
