import "dotenv/config";
import { SELLER_PRODUCTS_LIMIT_UNLIMITED } from "@molha/api-contract";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import {
  PRODUCT_MODERATION_APPROVED,
  PRODUCT_MODERATION_PENDING,
} from "../constants/productModerationConstants.js";
import {
  ProductModel,
  UserDataConfirmationRequestModel,
  UserModel,
} from "../models/index.js";
import { buildProductSearchBlobFromFields } from "../utils/buildProductSearchBlob.js";
import { seedHardcodedProductCategoryTree } from "../utils/seedProductCategoryTree.js";

export const E2E_PLAYWRIGHT = {
  buyerEmail: "e2e-buyer@example.com",
  sellerEmail: "e2e-seller-new@example.com",
  moderatorEmail: "e2e-moderator@example.com",
  kycBuyerEmail: "e2e-kyc-buyer@example.com",
  password: "E2eTestPass12!",
  catalogProductName: "E2E Playwright Catalog Item",
  pendingProductName: "E2E Playwright Pending Item",
  virtualCatalogPrefix: "E2E Virtual Catalog",
  virtualCatalogCount: 105,
};

const BCRYPT_ROUNDS = 10;

/** Одна точка самовывоза: схема товара требует адрес и координаты. */
const E2E_PICKUP_LOCATION = {
  id: "e2e-pickup",
  label: "",
  address: "Москва, ул. E2E, д. 1",
  lat: 55.751244,
  lon: 37.618423,
  isDefault: true,
};

const hashPassword = async (password) => bcrypt.hash(String(password), BCRYPT_ROUNDS);

/**
 * @param {{
 *   email: string;
 *   userName: string;
 *   isUserDataConfirmed?: boolean;
 *   userRole?: "user" | "admin" | "moderator";
 * }} params
 */
const upsertVerifiedUser = async ({
  email,
  userName,
  isUserDataConfirmed = true,
  userRole = "user",
}) => {
  const passwordHash = await hashPassword(E2E_PLAYWRIGHT.password);
  const user = await UserModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      $set: {
        email: email.toLowerCase(),
        passwordHash,
        userName,
        isEmailVerified: true,
        isActiveUser: true,
        isUserDataConfirmed,
        userRole,
        // Сид кладёт продавцу 107 товаров — больше обычного лимита (50), и
        // «Разместить товар» открывал окно лимита вместо мастера создания.
        sellerProductsLimitOverride: SELLER_PRODUCTS_LIMIT_UNLIMITED,
      },
      $unset: {
        emailVerificationTokenHash: "",
        emailVerificationExpiresAt: "",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return user;
};

/**
 * @param {import("mongoose").Types.ObjectId} productSellerId
 * @param {{
 *   productName: string;
 *   productModerationStatus: string;
 *   productIsAvailable?: boolean;
 *   productStockQuantity?: number;
 *   productPrice?: number;
 * }} params
 */
const upsertSellerProduct = async (
  productSellerId,
  {
    productName,
    productModerationStatus,
    productIsAvailable = true,
    productStockQuantity = 5,
    productPrice = 199,
  },
) => {
  const productDescription = `E2E fixture: ${productName}`;
  const productCategory = "electronics";

  const existing = await ProductModel.findOne({
    productName,
    productSeller: productSellerId,
  });

  const payload = {
    // Самовывоз включён по умолчанию, а без точки корзина прячет строку как
    // «нет адреса самовывоза» — оформить заказ было бы нечего. Доставку в E2E
    // не берём: адрес доставки выбирается только на карте (DaData/геокодер).
    productPickupEnabled: true,
    productDeliveryEnabled: false,
    productPickupLocations: [E2E_PICKUP_LOCATION],
    productName,
    productDescription,
    productSearchBlob: buildProductSearchBlobFromFields({
      productName,
      productDescription,
      productCategory,
    }),
    productImageUrls: ["https://example.com/e2e-product.jpg"],
    productPrice,
    productCategory,
    productIsAvailable,
    productStockQuantity,
    productModerationStatus,
    productSeller: productSellerId,
  };

  if (existing) {
    await ProductModel.updateOne({ _id: existing._id }, { $set: payload });
    return existing._id;
  }

  const created = await ProductModel.create(payload);
  return created._id;
};

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI не задан");
  }

  await mongoose.connect(process.env.MONGO_URI);
  try {
    await seedHardcodedProductCategoryTree();

    const seller = await upsertVerifiedUser({
      email: E2E_PLAYWRIGHT.sellerEmail,
      userName: "e2eSellerNew",
    });
    // Товары, созданные тестом seller-create через мастер, остаются в очереди
    // модерации и ломают проверку «Нет товаров, ожидающих проверки» на
    // следующем прогоне — убираем их, как и остальные следы прошлых запусков.
    await ProductModel.deleteMany({
      productSeller: seller._id,
      productName: { $regex: "^E2E UI Product " },
    });

    // «Доставка и оплата» продавца: новый товар по умолчанию следует профилю,
    // и адрес с регионом сервер берёт отсюда. Свой адрес в мастере выбирается
    // только на карте, а регион по нему определяет DaData — в E2E её нет.
    await UserModel.updateOne(
      { _id: seller._id },
      {
        $set: {
          sellerFulfillmentDefaults: {
            pickupLocations: [{ ...E2E_PICKUP_LOCATION, id: "profile-1" }],
            pickupEnabled: true,
            deliveryCarrier: "",
            regionCode: "RU-MOW",
          },
        },
      },
    );
    await upsertVerifiedUser({
      email: E2E_PLAYWRIGHT.buyerEmail,
      userName: "e2eBuyer",
    });
    await upsertVerifiedUser({
      email: E2E_PLAYWRIGHT.moderatorEmail,
      userName: "e2eModerator",
      userRole: "moderator",
    });

    const kycBuyer = await upsertVerifiedUser({
      email: E2E_PLAYWRIGHT.kycBuyerEmail,
      userName: "e2eKycBuyer",
      isUserDataConfirmed: false,
    });
    await UserDataConfirmationRequestModel.deleteMany({ userId: kycBuyer._id });

    await upsertSellerProduct(seller._id, {
      productName: E2E_PLAYWRIGHT.catalogProductName,
      productModerationStatus: PRODUCT_MODERATION_APPROVED,
    });
    await upsertSellerProduct(seller._id, {
      productName: E2E_PLAYWRIGHT.pendingProductName,
      productModerationStatus: PRODUCT_MODERATION_PENDING,
      productIsAvailable: false,
    });

    for (let index = 1; index <= E2E_PLAYWRIGHT.virtualCatalogCount; index += 1) {
      const suffix = String(index).padStart(3, "0");
      await upsertSellerProduct(seller._id, {
        productName: `${E2E_PLAYWRIGHT.virtualCatalogPrefix} ${suffix}`,
        productModerationStatus: PRODUCT_MODERATION_APPROVED,
        productPrice: 100 + index,
      });
    }

    console.info("[e2e-seed] Playwright fixtures ready");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("[e2e-seed]", error);
  process.exit(1);
});
