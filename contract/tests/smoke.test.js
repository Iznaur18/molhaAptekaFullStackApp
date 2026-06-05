import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  authMeDataSchema,
  catalogProductsQuerySchema,
  createOrderBodySchema,
  createProductBodySchema,
  parseApiSuccess,
  catalogProductsPageDataSchema,
  patchMyProductBodySchema,
  productWriteDataSchema,
  replaceCartBodySchema,
  userSellerProductsQuerySchema,
} from "../src/index.js";

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

test("createOrderBodySchema requires delivery flat", () => {
  assert.throws(() => {
    createOrderBodySchema.parse({
      items: [{ productId: "507f1f77bcf86cd799439011", quantity: 1 }],
      deliveryAddress: "Москва, Тверская 1",
      deliveryAddressFlat: "",
      paymentMethod: "cashOnDelivery",
    });
  });
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
