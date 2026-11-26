import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import {
  FORTUNE_WHEEL_RESULT_WIN,
  FORTUNE_WHEEL_WIN_STATUS_ACTIVE,
} from "../constants/sellerFortuneWheelConstants.js";
import {
  SellerFortuneWheelSpinModel,
  SellerFortuneWheelWinModel,
  UserModel,
} from "../models/index.js";
import { resolveMskDayKey } from "../services/seller-lucky-box/sellerLuckyBoxDayKey.js";

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("MONGO_URI не задан");
  process.exit(1);
}

await mongoose.connect(mongoUri);
const passwordHash = await bcrypt.hash("123456", 10);
const buyer = await UserModel.findOneAndUpdate(
  { email: "buyer@test.local" },
  {
    $set: {
      email: "buyer@test.local",
      passwordHash,
      userName: "buyertest",
      isEmailVerified: true,
      isActiveUser: true,
      isBlockedUser: false,
      userRole: "user",
    },
  },
  { upsert: true, new: true, setDefaultsOnInsert: true },
);
const seller = await UserModel.findOne({ userName: "adminaa" }).select("_id");
if (!seller) {
  throw new Error("adminaa not found");
}
await SellerFortuneWheelWinModel.deleteMany({
  buyerId: buyer._id,
  sellerId: seller._id,
});
await SellerFortuneWheelSpinModel.deleteMany({
  buyerId: buyer._id,
  sellerId: seller._id,
});
const dayKey = resolveMskDayKey();
const spin = await SellerFortuneWheelSpinModel.create({
  sellerId: seller._id,
  buyerId: buyer._id,
  dayKey,
  sectorIndex: 1,
  result: FORTUNE_WHEEL_RESULT_WIN,
  prize: {
    discountPercent: 40,
    durationHours: 24,
    prizeProductId: null,
    prizeProductName: null,
  },
});
const win = await SellerFortuneWheelWinModel.create({
  sellerId: seller._id,
  buyerId: buyer._id,
  discountPercent: 40,
  durationHours: 24,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  status: FORTUNE_WHEEL_WIN_STATUS_ACTIVE,
  prizeProductId: null,
  spinId: spin._id,
});
console.log(
  JSON.stringify({
    buyerId: String(buyer._id),
    email: "buyer@test.local",
    password: "123456",
    winId: String(win._id),
    spinId: String(spin._id),
    sellerId: String(seller._id),
  }),
);
await mongoose.disconnect();
