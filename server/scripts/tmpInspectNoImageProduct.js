import "dotenv/config";
import mongoose from "mongoose";

import { ProductModel, UserModel } from "../models/index.js";
import {
  productHasImages,
  productsWithoutImagesFilter,
} from "../services/product/productImagePresence.js";

const PRODUCT_ID = process.argv[2] || "6a9fffef70c1f477e255ad1f";

await mongoose.connect(process.env.MONGO_URI);
const p = await ProductModel.findById(PRODUCT_ID).lean();
if (!p) {
  console.log(JSON.stringify({ found: false, PRODUCT_ID }));
  await mongoose.disconnect();
  process.exit(0);
}

const seller = await UserModel.findById(p.productSeller).select("userName").lean();
const sellerId = p.productSeller;
const baseOneC = { productSeller: sellerId, productFromOneC: true };

const [noImagesOneC, noImagesSeller, availableNoImagesOneC] = await Promise.all([
  ProductModel.countDocuments({ ...baseOneC, ...productsWithoutImagesFilter }),
  ProductModel.countDocuments({
    productSeller: sellerId,
    ...productsWithoutImagesFilter,
  }),
  ProductModel.countDocuments({
    ...baseOneC,
    productIsAvailable: true,
    ...productsWithoutImagesFilter,
  }),
]);

console.log(
  JSON.stringify(
    {
      found: true,
      id: String(p._id),
      name: p.productName,
      fromOneC: p.productFromOneC,
      available: p.productIsAvailable,
      stock: p.productStockQuantity,
      held: p.product1cHeld,
      hasImages: productHasImages(p),
      imageUrls: p.productImageUrls,
      imageUrl: p.productImageUrl,
      seller: seller?.userName,
      sellerId: String(sellerId),
      noImagesOneC,
      noImagesSeller,
      availableNoImagesOneC,
    },
    null,
    2,
  ),
);

await mongoose.disconnect();
