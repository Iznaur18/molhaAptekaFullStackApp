import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import mongoose from "mongoose";

import { PRODUCT_MODERATION_APPROVED } from "../constants/productModerationConstants.js";
import {
  SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_EXPIRED,
  SELLER_PERSONAL_CATEGORY_STATUS_ACTIVE,
  SELLER_PERSONAL_CATEGORY_STATUS_PENDING,
} from "../constants/sellerPersonalCategoryConstants.js";
import {
  ProductModel,
  SellerPersonalCategoryCampaignModel,
  SellerPersonalCategoryModel,
  UserInAppNotificationModel,
} from "../models/index.js";
import {
  activateSellerPersonalCategoryCampaign,
  assertNoOpenSellerPersonalCategoryCampaign,
  expireDueActiveSellerPersonalCategoryCampaigns,
  linkSellerProductsToPersonalCategory,
} from "../utils/sellerPersonalCategoryHelpers.js";
import { assertSellerPersonalCategoryImageUrlIsUploadedAsset } from "../utils/validateSellerPersonalCategoryImageUrl.js";
import {
  clearMongoCollections,
  connectMongoTestReplSet,
  disconnectMongoTestReplSet,
} from "./helpers/mongoTestDb.js";

before(async () => {
  await connectMongoTestReplSet();
});

after(async () => {
  await disconnectMongoTestReplSet();
});

test("assertNoOpenSellerPersonalCategoryCampaign rejects duplicate open campaign", async () => {
  await clearMongoCollections();

  const sellerId = new mongoose.Types.ObjectId();
  await SellerPersonalCategoryCampaignModel.create({
    sellerId,
    status: SELLER_PERSONAL_CATEGORY_STATUS_PENDING,
    labelRu: "Моя категория",
    imageUrl: "/uploads/tile.jpg",
    tariffCode: "7d",
    durationHours: 24 * 7,
    amountPoints: 3_000,
  });

  await assert.rejects(
    () => assertNoOpenSellerPersonalCategoryCampaign(String(sellerId)),
    /SELLER_PERSONAL_CATEGORY_CAMPAIGN_ALREADY_OPEN/,
  );
});

test("assertSellerPersonalCategoryImageUrlIsUploadedAsset rejects external urls", () => {
  assert.throws(
    () => assertSellerPersonalCategoryImageUrlIsUploadedAsset("https://evil.example/tile.jpg"),
    /SELLER_PERSONAL_CATEGORY_IMAGE_URL_INVALID/,
  );

  assert.doesNotThrow(() =>
    assertSellerPersonalCategoryImageUrlIsUploadedAsset("/uploads/tile.jpg"),
  );
});

test("activateSellerPersonalCategoryCampaign links approved seller products", async () => {
  await clearMongoCollections();

  const sellerId = new mongoose.Types.ObjectId();
  const staffId = new mongoose.Types.ObjectId();
  const campaign = await SellerPersonalCategoryCampaignModel.create({
    sellerId,
    status: SELLER_PERSONAL_CATEGORY_STATUS_PENDING,
    labelRu: "Аптека Ивана",
    imageUrl: "/uploads/tile.jpg",
    tariffCode: "24h",
    durationHours: 24,
    amountPoints: 1_000,
  });

  const product = await ProductModel.create({
    productName: "Товар",
    productPrice: 100,
    productSeller: sellerId,
    productCategory: "pharmacy",
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
  });

  await activateSellerPersonalCategoryCampaign({
    campaignId: campaign._id,
    approvedByUserId: staffId,
  });

  const category = await SellerPersonalCategoryModel.findOne({ sellerId }).lean();
  assert.ok(category?._id);
  assert.ok(category?.activeUntil);

  const updatedProduct = await ProductModel.findById(product._id).lean();
  assert.equal(String(updatedProduct?.sellerPersonalCategoryId), String(category?._id));
});

test("expireDueActiveSellerPersonalCategoryCampaigns drains multiple due campaigns", async () => {
  await clearMongoCollections();

  const sellerA = new mongoose.Types.ObjectId();
  const sellerB = new mongoose.Types.ObjectId();
  const categoryA = await SellerPersonalCategoryModel.create({
    sellerId: sellerA,
    labelRu: "A",
    imageUrl: "/uploads/a.jpg",
    activeUntil: new Date(Date.now() - 1000),
  });
  const categoryB = await SellerPersonalCategoryModel.create({
    sellerId: sellerB,
    labelRu: "B",
    imageUrl: "/uploads/b.jpg",
    activeUntil: new Date(Date.now() - 1000),
  });

  await SellerPersonalCategoryCampaignModel.create({
    sellerId: sellerA,
    personalCategoryId: categoryA._id,
    status: SELLER_PERSONAL_CATEGORY_STATUS_ACTIVE,
    labelRu: "A",
    imageUrl: "/uploads/a.jpg",
    tariffCode: "24h",
    durationHours: 24,
    amountPoints: 1_000,
    activeUntil: new Date(Date.now() - 1000),
  });
  await SellerPersonalCategoryCampaignModel.create({
    sellerId: sellerB,
    personalCategoryId: categoryB._id,
    status: SELLER_PERSONAL_CATEGORY_STATUS_ACTIVE,
    labelRu: "B",
    imageUrl: "/uploads/b.jpg",
    tariffCode: "24h",
    durationHours: 24,
    amountPoints: 1_000,
    activeUntil: new Date(Date.now() - 1000),
  });

  await expireDueActiveSellerPersonalCategoryCampaigns();

  const expiredCount = await SellerPersonalCategoryCampaignModel.countDocuments({
    status: "expired",
  });
  assert.equal(expiredCount, 2);
});

test("expireDueActiveSellerPersonalCategoryCampaigns is idempotent", async () => {
  await clearMongoCollections();

  const sellerId = new mongoose.Types.ObjectId();
  const category = await SellerPersonalCategoryModel.create({
    sellerId,
    labelRu: "Срок истёк",
    imageUrl: "/uploads/expired.jpg",
    activeUntil: new Date(Date.now() - 1000),
  });

  await SellerPersonalCategoryCampaignModel.create({
    sellerId,
    personalCategoryId: category._id,
    status: SELLER_PERSONAL_CATEGORY_STATUS_ACTIVE,
    labelRu: "Срок истёк",
    imageUrl: "/uploads/expired.jpg",
    tariffCode: "7d",
    durationHours: 24 * 7,
    amountPoints: 3_000,
    activeUntil: new Date(Date.now() - 1000),
  });

  await Promise.all([
    expireDueActiveSellerPersonalCategoryCampaigns(),
    expireDueActiveSellerPersonalCategoryCampaigns(),
  ]);

  const notifications = await UserInAppNotificationModel.find({
    userId: sellerId,
    kind: SELLER_PERSONAL_CATEGORY_NOTIFICATION_KIND_EXPIRED,
  }).lean();

  assert.equal(notifications.length, 1);

  const campaign = await SellerPersonalCategoryCampaignModel.findOne({ sellerId }).lean();
  assert.equal(campaign?.status, "expired");
});

test("partial unique index blocks second open campaign for seller", async () => {
  await clearMongoCollections();

  const sellerId = new mongoose.Types.ObjectId();

  await SellerPersonalCategoryCampaignModel.create({
    sellerId,
    status: SELLER_PERSONAL_CATEGORY_STATUS_PENDING,
    labelRu: "Первая",
    imageUrl: "/uploads/a.jpg",
    tariffCode: "7d",
    durationHours: 24 * 7,
    amountPoints: 3_000,
  });

  await assert.rejects(
    () =>
      SellerPersonalCategoryCampaignModel.create({
        sellerId,
        status: SELLER_PERSONAL_CATEGORY_STATUS_ACTIVE,
        labelRu: "Вторая",
        imageUrl: "/uploads/b.jpg",
        tariffCode: "24h",
        durationHours: 24,
        amountPoints: 1_000,
      }),
    (error) => error && typeof error === "object" && "code" in error && error.code === 11000,
  );
});

test("linkSellerProductsToPersonalCategory only links approved products", async () => {
  await clearMongoCollections();

  const sellerId = new mongoose.Types.ObjectId();
  const personalCategoryId = new mongoose.Types.ObjectId();

  const approved = await ProductModel.create({
    productName: "Одобрен",
    productPrice: 100,
    productSeller: sellerId,
    productCategory: "pharmacy",
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
  });
  const pending = await ProductModel.create({
    productName: "На модерации",
    productPrice: 200,
    productSeller: sellerId,
    productCategory: "pharmacy",
    productModerationStatus: "pending",
  });

  await linkSellerProductsToPersonalCategory(sellerId, personalCategoryId);

  const approvedRow = await ProductModel.findById(approved._id).lean();
  const pendingRow = await ProductModel.findById(pending._id).lean();

  assert.equal(String(approvedRow?.sellerPersonalCategoryId), String(personalCategoryId));
  assert.equal(pendingRow?.sellerPersonalCategoryId ?? null, null);
});
