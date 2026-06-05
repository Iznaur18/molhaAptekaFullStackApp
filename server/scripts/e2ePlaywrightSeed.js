import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import { PRODUCT_MODERATION_APPROVED } from "../constants/productModerationConstants.js";
import { ProductModel, UserModel } from "../models/index.js";
import { buildProductSearchBlobFromFields } from "../utils/buildProductSearchBlob.js";
import { seedProductCategoryTree } from "../utils/seedProductCategoryTree.js";

export const E2E_PLAYWRIGHT = {
  buyerEmail: "e2e-buyer@example.com",
  sellerEmail: "e2e-seller-new@example.com",
  password: "E2eTestPass12!",
  catalogProductName: "E2E Playwright Catalog Item",
};

const BCRYPT_ROUNDS = 10;

const hashPassword = async (password) => bcrypt.hash(String(password), BCRYPT_ROUNDS);

const upsertVerifiedUser = async ({ email, userName }) => {
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
        isUserDataConfirmed: true,
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

const upsertCatalogProduct = async (productSellerId) => {
  const existing = await ProductModel.findOne({
    productName: E2E_PLAYWRIGHT.catalogProductName,
    productSeller: productSellerId,
  });

  if (existing) {
    await ProductModel.updateOne(
      { _id: existing._id },
      {
        $set: {
          productModerationStatus: PRODUCT_MODERATION_APPROVED,
          productIsAvailable: true,
          productStockQuantity: 5,
          productPrice: 199,
        },
      },
    );
    return existing._id;
  }

  const productName = E2E_PLAYWRIGHT.catalogProductName;
  const productDescription = "E2E fixture product for Playwright catalog flow";
  const productCategory = "electronics";

  const created = await ProductModel.create({
    productName,
    productDescription,
    productSearchBlob: buildProductSearchBlobFromFields({
      productName,
      productDescription,
      productCategory,
    }),
    productImageUrls: ["https://example.com/e2e-product.jpg"],
    productPrice: 199,
    productCategory,
    productIsAvailable: true,
    productStockQuantity: 5,
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productSeller: productSellerId,
  });
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

    await upsertCatalogProduct(seller._id);

    console.info("[e2e-seed] Playwright fixtures ready");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("[e2e-seed]", error);
  process.exit(1);
});
