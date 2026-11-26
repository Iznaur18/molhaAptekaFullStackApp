/**
 * Dev: включить «Колесо» и «Коробки» у demovitrina на её существующих товарах.
 *
 *   MONGO_URI=... node scripts/seedDemovitrinaGames.mjs
 */
import "dotenv/config";
import mongoose from "mongoose";

import {
  ProductModel,
  SellerFortuneWheelConfigModel,
  SellerLuckyBoxConfigModel,
  UserModel,
} from "../models/index.js";

const SELLER_USERNAME = "demovitrina";

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI не задан");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const seller = await UserModel.findOne({ userName: SELLER_USERNAME }).select(
    "_id userName email",
  );
  if (!seller) {
    console.error(`Пользователь ${SELLER_USERNAME} не найден`);
    process.exit(1);
  }

  const products = await ProductModel.find({
    productSeller: seller._id,
    productIsAvailable: true,
  })
    .select("_id productName productPrice")
    .sort({ productPrice: 1 })
    .limit(8)
    .lean();

  if (products.length < 4) {
    console.error(`Нужно ≥4 товара у ${SELLER_USERNAME}, сейчас ${products.length}`);
    process.exit(1);
  }

  const [prizeA, prizeB, prizeC, prizeD] = products;

  await SellerFortuneWheelConfigModel.findOneAndUpdate(
    { sellerId: seller._id },
    {
      $set: {
        enabled: true,
        sectors: [
          {
            discountPercent: 10,
            durationHours: 24,
            chancePercent: 15,
            enabled: true,
            prizeProductId: null,
          },
          {
            discountPercent: 25,
            durationHours: 24,
            chancePercent: 20,
            enabled: true,
            prizeProductId: null,
          },
          {
            discountPercent: 40,
            durationHours: 12,
            chancePercent: 15,
            enabled: true,
            prizeProductId: null,
          },
          {
            discountPercent: 1,
            durationHours: 24,
            chancePercent: 20,
            enabled: true,
            prizeProductId: prizeA._id,
          },
          {
            discountPercent: 1,
            durationHours: 24,
            chancePercent: 20,
            enabled: true,
            prizeProductId: prizeB._id,
          },
          {
            discountPercent: 1,
            durationHours: 1,
            chancePercent: 10,
            enabled: false,
            prizeProductId: null,
          },
        ],
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  await SellerLuckyBoxConfigModel.findOneAndUpdate(
    { sellerId: seller._id },
    {
      $set: {
        enabled: true,
        prizes: [
          {
            discountPercent: 15,
            durationHours: 24,
            enabled: true,
            prizeProductId: null,
          },
          {
            discountPercent: 30,
            durationHours: 24,
            enabled: true,
            prizeProductId: null,
          },
          {
            discountPercent: 1,
            durationHours: 24,
            enabled: true,
            prizeProductId: prizeC._id,
          },
          {
            discountPercent: 1,
            durationHours: 24,
            enabled: true,
            prizeProductId: prizeD._id,
          },
        ],
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  console.log(
    JSON.stringify(
      {
        seller: {
          id: String(seller._id),
          userName: seller.userName,
          email: seller.email,
        },
        prizeProducts: products.slice(0, 4).map((p) => ({
          id: String(p._id),
          name: p.productName,
          price: p.productPrice,
        })),
        fortuneWheel: { enabled: true, sectors: 6 },
        luckyBox: { enabled: true, prizes: 4 },
      },
      null,
      2,
    ),
  );

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
