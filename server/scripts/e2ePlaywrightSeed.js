import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import {
  PRODUCT_MODERATION_APPROVED,
  PRODUCT_MODERATION_PENDING,
} from "../constants/productModerationConstants.js";
import { ProductModel, UserDataConfirmationRequestModel, UserModel } from "../models/index.js";
import { buildProductSearchBlobFromFields } from "../utils/buildProductSearchBlob.js";
import { seedProductCategoryTree } from "../utils/seedProductCategoryTree.js";

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
    await seedProductCategoryTree();

    const seller = await upsertVerifiedUser({
      email: E2E_PLAYWRIGHT.sellerEmail,
      userName: "e2eSellerNew",
    });
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
