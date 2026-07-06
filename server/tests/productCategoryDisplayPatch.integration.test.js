import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";

import ProductCategoryDisplayModel from "../models/ProductCategoryDisplayModel.js";
import ProductCategoryModel from "../models/ProductCategoryModel.js";
import { ensureProductCategoryDisplayForSlug } from "../services/product/ensureProductCategoryDisplayForSlug.js";
import { upsertProductCategoryDisplay } from "../services/product/productCategoryDisplayPatch.js";
import { startHttpTestServer, stopHttpTestServer } from "./helpers/httpTestApp.js";
import {
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

afterEach(async () => {
  await clearMongoCollections();
});

after(async () => {
  if (server) {
    await stopHttpTestServer(server);
  }
  await disconnectMongoTestReplSet();
});

test("category display patch coalesces slug migration row with categoryId upsert", async () => {
  await ensureProductCategoryTreeSeeded();

  const foodRoot = await ProductCategoryModel.findOne({
    $or: [{ legacyProductCategory: "food" }, { slug: "food" }],
  }).lean();
  assert.ok(foodRoot?._id, "food root category must exist in seed");

  await ensureProductCategoryDisplayForSlug("food");

  const categoryId = String(foodRoot._id);
  const imageUrl = "/uploads/test-food-tile.jpg";

  const saved = await upsertProductCategoryDisplay({
    categoryId,
    update: { imageUrl },
  });

  assert.equal(saved?.imageUrl, imageUrl);

  const rows = await ProductCategoryDisplayModel.find().lean();
  assert.equal(rows.length, 1, JSON.stringify(rows));
  assert.equal(rows[0]?.categorySlug, "food");
  assert.equal(rows[0]?.imageUrl, imageUrl);
});

test("category display patch coalesces duplicate categoryId and categorySlug rows", async () => {
  await ensureProductCategoryTreeSeeded();

  const foodRoot = await ProductCategoryModel.findOne({
    $or: [{ legacyProductCategory: "food" }, { slug: "food" }],
  }).lean();
  assert.ok(foodRoot?._id);

  const categoryId = String(foodRoot._id);
  await ProductCategoryDisplayModel.collection.insertMany([
    {
      categorySlug: "food",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      categoryId: foodRoot._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const saved = await upsertProductCategoryDisplay({
    categoryId,
    update: { imageUrl: "/uploads/duplicate-merge.jpg" },
  });

  assert.equal(saved?.imageUrl, "/uploads/duplicate-merge.jpg");

  const rows = await ProductCategoryDisplayModel.find().lean();
  assert.equal(rows.length, 1, JSON.stringify(rows));
});

test("PATCH /product/category-node-displays/:categoryId updates legacy slug display", async () => {
  await ensureProductCategoryTreeSeeded();

  const foodRoot = await ProductCategoryModel.findOne({
    $or: [{ legacyProductCategory: "food" }, { slug: "food" }],
  }).lean();
  assert.ok(foodRoot?._id);

  await ensureProductCategoryDisplayForSlug("food");

  const { cookie, user } = await registerUserAndGetCookie(request, "admin-food-display");
  await verifyUserEmail("int-admin-food-display@example.com");
  await setUserRole(user._id, "admin");

  const imageUrl = "/uploads/api-food-tile.jpg";
  const response = await request(`/product/category-node-displays/${foodRoot._id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({ imageUrl }),
  });

  assert.equal(response.status, 200);
  const data = await parseSuccessData(response);
  assert.equal(data.display.imageUrl, imageUrl);

  const rows = await ProductCategoryDisplayModel.find().lean();
  assert.equal(rows.length, 1, JSON.stringify(rows));
});

test("category image override works for MULTIPLE category nodes (no null-key E11000)", async () => {
  await ensureProductCategoryTreeSeeded();

  const mkRoot = async (slug, label) =>
    ProductCategoryModel.create({
      slug,
      labelRu: label,
      parentId: null,
      depth: 0,
      isLeaf: false,
      legacyProductCategory: null,
      pathSlugs: [slug],
      pathLabelRu: [label],
    });
  const rootA = await mkRoot("multi-node-a", "Категория A");
  const rootB = await mkRoot("multi-node-b", "Категория B");

  const { cookie, user } = await registerUserAndGetCookie(request, "admin-multi-node");
  await verifyUserEmail("int-admin-multi-node@example.com");
  await setUserRole(user._id, "admin");

  const patchNode = (categoryId, imageUrl) =>
    request(`/product/category-node-displays/${categoryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ imageUrl }),
    });

  const first = await patchNode(String(rootA._id), "/uploads/multi-a.jpg");
  assert.equal(first.status, 200);

  // Раньше падало с 409 (E11000): обе записи имеют categorySlug: null, а
  // { unique, sparse } индексирует null. Теперь индекс partial — второй проходит.
  const second = await patchNode(String(rootB._id), "/uploads/multi-b.jpg");
  assert.equal(second.status, 200, await second.clone().text());
  const secondData = await parseSuccessData(second);
  assert.equal(secondData.display.imageUrl, "/uploads/multi-b.jpg");
});
