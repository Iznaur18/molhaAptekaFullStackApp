import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  addressSuggestBodySchema,
  authMeDataSchema,
  authSessionDataSchema,
  refreshAuthBodySchema,
  catalogProductsQuerySchema,
  catalogFeedTileKeyParamsSchema,
  createProductCategoryAdminBodySchema,
  createProductSearchSynonymBodySchema,
  getMyInstallmentContractsListQuerySchema,
  resolveDataConfirmationBodySchema,
  upsertProductInstallmentProgramBodySchema,
  verifyEmailWithCodeBodySchema,
  createOrderBodySchema,
  createProductBodySchema,
  createRaffleBodySchema,
  createUserStoryBodySchema,
  getAllOrdersQuerySchema,
  getMySalesQuerySchema,
  loginBodySchema,
  orderItemActionParamsSchema,
  parseApiSuccess,
  catalogProductsPageDataSchema,
  patchMyProductBodySchema,
  productIdParamsSchema,
  productReviewsListQuerySchema,
  productWriteDataSchema,
  registerBodySchema,
  replaceCartBodySchema,
  resolveProductReportsBodySchema,
  submitDataConfirmationBodySchema,
  submitProductReportBodySchema,
  submitProductReviewBodySchema,
  requestProductPromotionBodySchema,
  productPriceOfferBodySchema,
  updateProfileBodySchema,
  userFollowListQuerySchema,
  userIdClientParamsSchema,
  userSearchQuerySchema,
  userSellerProductsQuerySchema,
} from "../src/index.js";

test("loginBodySchema validates credentials", () => {
  const parsed = loginBodySchema.parse({
    email: "user@example.com",
    password: "secret12",
  });
  assert.equal(parsed.email, "user@example.com");
});

test("authSessionDataSchema includes bearer tokens", () => {
  const parsed = authSessionDataSchema.parse({
    _id: "507f1f77bcf86cd799439011",
    email: "user@example.com",
    accessToken: "access.jwt.token",
    refreshToken: "refresh.jwt.token",
  });
  assert.equal(parsed.accessToken, "access.jwt.token");
  assert.equal(refreshAuthBodySchema.parse({}).refreshToken, undefined);
  assert.equal(
    refreshAuthBodySchema.parse({ refreshToken: "rt" }).refreshToken,
    "rt",
  );
});

test("registerBodySchema normalizes phone and userName", () => {
  const parsed = registerBodySchema.parse({
    email: "user@example.com",
    password: "secret12",
    passwordConfirm: "secret12",
    userName: "Tester",
    phoneNumber: "8 (912) 345-67-89",
  });
  assert.equal(parsed.userName, "tester");
  assert.equal(parsed.phoneNumber, "+79123456789");
});

test("route param schemas accept mongo ids", () => {
  const id = "507f1f77bcf86cd799439011";
  assert.equal(productIdParamsSchema.parse({ productId: id }).productId, id);
  assert.equal(userIdClientParamsSchema.parse({ userIdClient: id }).userIdClient, id);
  assert.equal(
    orderItemActionParamsSchema.parse({ orderId: id, itemIndex: "2" }).itemIndex,
    2,
  );
});

test("updateProfileBodySchema clears nullable fields", () => {
  const parsed = updateProfileBodySchema.parse({
    userName: null,
    userPhoneNumber: "",
    notesAboutUser: "short note",
  });
  assert.equal(parsed.userName, null);
  assert.equal(parsed.userPhoneNumber, null);
});

test("order query schemas coerce pagination", () => {
  const parsed = getAllOrdersQuerySchema.parse({ page: "2", limit: "50", status: "pending" });
  assert.equal(parsed.page, 2);
  assert.equal(parsed.limit, 50);
  assert.equal(parsed.status, "pending");
});

test("getMySalesQuerySchema validates productIds filter", () => {
  const id = "507f1f77bcf86cd799439011";
  const parsed = getMySalesQuerySchema.parse({ productIds: `${id},507f1f77bcf86cd799439012` });
  assert.equal(parsed.productIds, `${id},507f1f77bcf86cd799439012`);
});

test("submitProductReportBodySchema validates report text", () => {
  const parsed = submitProductReportBodySchema.parse({ reportText: "  spam  " });
  assert.equal(parsed.reportText, "spam");
});

test("resolveProductReportsBodySchema accepts staff resolution", () => {
  const parsed = resolveProductReportsBodySchema.parse({
    resolution: "hide",
    staffNote: "removed",
  });
  assert.equal(parsed.resolution, "hide");
});

test("submitProductReviewBodySchema coerces rating", () => {
  const parsed = submitProductReviewBodySchema.parse({ rating: "4", text: null });
  assert.equal(parsed.rating, 4);
});

test("productReviewsListQuerySchema defaults limit", () => {
  const parsed = productReviewsListQuerySchema.parse({});
  assert.equal(parsed.limit, 20);
});

test("requestProductPromotionBodySchema validates tier and tariff", () => {
  const parsed = requestProductPromotionBodySchema.parse({ tier: "2", tariffCode: "7d" });
  assert.equal(parsed.tier, 2);
  assert.equal(parsed.tariffCode, "7d");
});

test("productPriceOfferBodySchema coerces offerPrice", () => {
  const parsed = productPriceOfferBodySchema.parse({ offerPrice: "1500" });
  assert.equal(parsed.offerPrice, 1500);
});

test("userSearchQuerySchema trims search and filters role", () => {
  const parsed = userSearchQuerySchema.parse({
    search: "  alice ",
    page: "2",
    userRole: "moderator",
  });
  assert.equal(parsed.search, "alice");
  assert.equal(parsed.page, 2);
  assert.equal(parsed.userRole, "moderator");
});

test("userSearchQuerySchema rejects short search", () => {
  assert.throws(() => userSearchQuerySchema.parse({ search: "ab" }));
});

test("verifyEmailWithCodeBodySchema validates six-digit code", () => {
  const parsed = verifyEmailWithCodeBodySchema.parse({ code: " 123456 " });
  assert.equal(parsed.code, "123456");
});

test("resolveDataConfirmationBodySchema accepts approve resolution", () => {
  const parsed = resolveDataConfirmationBodySchema.parse({ resolution: "approve" });
  assert.equal(parsed.resolution, "approve");
});

test("addressSuggestBodySchema requires query length", () => {
  const parsed = addressSuggestBodySchema.parse({ query: "Москва" });
  assert.equal(parsed.query, "Москва");
});

test("createProductCategoryAdminBodySchema validates slug", () => {
  const parsed = createProductCategoryAdminBodySchema.parse({
    slug: "electronics-headphones",
    labelRu: "Наушники",
  });
  assert.equal(parsed.slug, "electronics-headphones");
});

test("createProductSearchSynonymBodySchema validates categories", () => {
  const parsed = createProductSearchSynonymBodySchema.parse({
    token: "phone",
    categories: ["electronics"],
  });
  assert.deepEqual(parsed.categories, ["electronics"]);
});

test("catalogFeedTileKeyParamsSchema accepts known tile key", () => {
  const parsed = catalogFeedTileKeyParamsSchema.parse({ tileKey: "sort:newest" });
  assert.equal(parsed.tileKey, "sort:newest");
});

test("upsertProductInstallmentProgramBodySchema validates plans", () => {
  const parsed = upsertProductInstallmentProgramBodySchema.parse({
    isEnabled: true,
    plans: [{ title: "6 мес", monthsCount: "6", monthlyAmountRub: "1000" }],
  });
  assert.equal(parsed.plans[0].monthsCount, 6);
});

test("getMyInstallmentContractsListQuerySchema filters status", () => {
  const parsed = getMyInstallmentContractsListQuerySchema.parse({ status: "in_progress" });
  assert.equal(parsed.status, "in_progress");
});

test("userFollowListQuerySchema defaults page", () => {
  const parsed = userFollowListQuerySchema.parse({});
  assert.equal(parsed.page, 1);
});

test("createRaffleBodySchema validates image prize raffle", () => {
  const parsed = createRaffleBodySchema.parse({
    title: "Summer drop",
    targetSales: "100",
    instagramUrl: "https://instagram.com/shop",
    prizeImageUrl: "/uploads/prize.png",
  });
  assert.equal(parsed.targetSales, 100);
  assert.equal(parsed.prizeMediaType, undefined);
});

test("createUserStoryBodySchema validates media payload", () => {
  const parsed = createUserStoryBodySchema.parse({
    mediaType: "image",
    mediaUrl: "https://cdn.example/story.png",
  });
  assert.equal(parsed.mediaType, "image");
});

test("submitDataConfirmationBodySchema accepts nested passport", () => {
  const parsed = submitDataConfirmationBodySchema.parse({
    passport: {
      lastName: "Иванов",
      firstName: "Иван",
      middleName: "",
      series: "1234",
      number: "567890",
      issuedBy: "ОВД района",
      departmentCode: "123-456",
      birthDate: "1990-01-15",
      issuedAt: "2010-05-20",
    },
    passportSelfiePhotoUrl: "/uploads/selfie.jpg",
  });
  assert.equal(parsed.lastName, "Иванов");
  assert.equal(parsed.passportSelfiePhotoUrl, "/uploads/selfie.jpg");
});

test("catalogProductsQuerySchema coerces page/limit and flags", () => {
  const parsed = catalogProductsQuerySchema.parse({
    page: "2",
    limit: "20",
    followingOnly: "true",
    saleOnly: "false",
  });
  assert.equal(parsed.page, 2);
  assert.equal(parsed.limit, 20);
  assert.equal(parsed.followingOnly, true);
  assert.equal(parsed.saleOnly, false);
});

test("catalogProductsQuerySchema rejects unknown category", () => {
  assert.throws(() => {
    catalogProductsQuerySchema.parse({ productCategory: "unknown_slug" });
  });
});

test("parseApiSuccess validates catalog page payload", () => {
  const data = parseApiSuccess(
    {
      success: true,
      data: {
        products: [{ _id: "507f1f77bcf86cd799439011", productName: "Test" }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    },
    catalogProductsPageDataSchema,
  );
  assert.equal(data.products.length, 1);
  assert.equal(data.pagination.total, 1);
});

test("userSellerProductsQuerySchema caps limit at 20", () => {
  assert.throws(() => {
    userSellerProductsQuerySchema.parse({ limit: "25" });
  });
});

test("replaceCartBodySchema validates items map", () => {
  const productId = "507f1f77bcf86cd799439011";
  const parsed = replaceCartBodySchema.parse({
    items: { [productId]: "2" },
  });
  assert.equal(parsed.items[productId], 2);
});

test("createOrderBodySchema allows empty delivery flat", () => {
  const parsed = createOrderBodySchema.parse({
    items: [{ productId: "507f1f77bcf86cd799439011", quantity: 1 }],
    deliveryAddress: "Москва, Тверская 1",
    deliveryAddressFlat: "",
    paymentMethod: "cashOnDelivery",
  });
  assert.equal(parsed.deliveryAddressFlat, "");
});

test("parseApiSuccess validates auth me payload", () => {
  const data = parseApiSuccess(
    {
      success: true,
      data: {
        user: { _id: "507f1f77bcf86cd799439012", userName: "tester" },
        inAppNotifications: [],
      },
    },
    authMeDataSchema,
  );
  assert.equal(data.user.userName, "tester");
});

test("createProductBodySchema accepts relative /uploads image urls", () => {
  const parsed = createProductBodySchema.parse({
    productName: "Test product name",
    productDescription: "Description long enough for validation",
    productPrice: 100,
    productIsAvailable: true,
    productCategory: "pharmacy",
    productImageUrls: ["/uploads/photo.webp"],
  });
  assert.deepEqual(parsed.productImageUrls, ["/uploads/photo.webp"]);
});

test("createProductBodySchema requires category id or legacy slug", () => {
  assert.throws(() => {
    createProductBodySchema.parse({
      productName: "Test product name",
      productDescription: "Description long enough for validation",
      productPrice: 100,
      productIsAvailable: true,
    });
  });
});

test("parseApiSuccess validates create product response with moderation", () => {
  const data = parseApiSuccess(
    {
      success: true,
      data: {
        message: "Продукт успешно создан",
        product: {
          _id: "507f1f77bcf86cd799439011",
          productName: "Test",
          productModerationStatus: "pending",
        },
      },
    },
    productWriteDataSchema,
  );
  assert.equal(data.product.productModerationStatus, "pending");
});

test("patchMyProductBodySchema rejects empty patch body", () => {
  assert.throws(() => {
    patchMyProductBodySchema.parse({});
  });
});

test("openapi.yaml documents commerce and auth contract paths", () => {
  const openapiPath = join(dirname(fileURLToPath(import.meta.url)), "..", "openapi.yaml");
  const yaml = readFileSync(openapiPath, "utf8");

  const requiredPaths = [
    "/product:",
    "/product/{productId}:",
    "/cart:",
    "/order:",
    "/auth/me:",
    "CreateProductBody:",
    "PatchProductBody:",
    "ReplaceCartBody:",
    "CreateOrderBody:",
    "AuthMeData:",
    "accessTokenCookie:",
  ];

  for (const fragment of requiredPaths) {
    assert.match(yaml, new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
