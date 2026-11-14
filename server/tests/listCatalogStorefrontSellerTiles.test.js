import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { PRODUCT_MODERATION_APPROVED } from "../constants/productModerationConstants.js";
import { ProductModel, UserModel } from "../models/index.js";
import {
  buildStorefrontSellerTileId,
  listCatalogStorefrontSellerTiles,
} from "../services/seller-personal-category/listCatalogStorefrontSellerTiles.js";
import {
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

before(connectMongoTestReplSet);
after(disconnectMongoTestReplSet);

test("listCatalogStorefrontSellerTiles: seller with visible product", async () => {
  const seller = await UserModel.create({
    email: `storefront-tile-${Date.now()}@example.com`,
    password: "hash",
    userName: "Витрина Тест",
    isActiveUser: true,
    isBlockedUser: false,
  });

  await ProductModel.create({
    productName: "Товар витрины",
    productSeller: seller._id,
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: true,
    productStockQuantity: 2,
    productCategory: "other",
    productPrice: 100,
  });

  const tiles = await listCatalogStorefrontSellerTiles();
  const match = tiles.find((tile) => tile.sellerId === String(seller._id));

  assert.ok(match);
  assert.equal(match._id, buildStorefrontSellerTileId(String(seller._id)));
  assert.equal(match.labelRu, "Витрина Тест");
});

test("listCatalogStorefrontSellerTiles: excludeSellerIds skips paid slot", async () => {
  const seller = await UserModel.create({
    email: `storefront-exclude-${Date.now()}@example.com`,
    password: "hash",
    userName: "Платный слот",
    isActiveUser: true,
    isBlockedUser: false,
  });

  await ProductModel.create({
    productName: "Товар платного",
    productSeller: seller._id,
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: true,
    productStockQuantity: 1,
    productCategory: "other",
    productPrice: 50,
  });

  const tiles = await listCatalogStorefrontSellerTiles({
    excludeSellerIds: [String(seller._id)],
  });

  assert.ok(!tiles.some((tile) => tile.sellerId === String(seller._id)));
});
