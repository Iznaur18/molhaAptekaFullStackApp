import { PRODUCT_SELLER_PUBLIC_FIELD_NAMES } from "../../constants/productSellerPublicFields.js";
import { attachTotalSalesAmountToUsers } from "../order/sellerTotalSalesAmount.js";
import { attachFollowersCountToUsers } from "../user/userFollowHelpers.js";
import { enrichProductApiFields } from "./productDiscount.js";
import { getSellerListedProductCountByIds } from "./sellerListedProductCount.js";

/**
 * @param {Record<string, unknown> | null | undefined} seller
 */
export const pickProductSellerPublicSnapshot = (seller) => {
  if (seller == null || typeof seller !== "object") {
    return null;
  }

  /** @type {Record<string, unknown>} */
  const snapshot = {};
  for (const key of PRODUCT_SELLER_PUBLIC_FIELD_NAMES) {
    if (seller[key] !== undefined) {
      snapshot[key] = seller[key];
    }
  }

  if (seller.sellerListedProductCount !== undefined) {
    snapshot.sellerListedProductCount = seller.sellerListedProductCount;
  }

  if (seller.totalSalesAmount !== undefined) {
    snapshot.totalSalesAmount = seller.totalSalesAmount;
  }

  if (seller.followersCount !== undefined) {
    snapshot.followersCount = seller.followersCount;
  }

  return snapshot._id != null ? snapshot : null;
};

/**
 * @param {Record<string, unknown>[]} products
 */
export const attachProductSellerSnapshots = async (products) => {
  if (!Array.isArray(products) || products.length === 0) {
    return products;
  }

  const sellerIds = products
    .map((product) => product.productSeller?._id)
    .filter((id) => id != null)
    .map((id) => String(id));

  const uniqueSellerIds = [...new Set(sellerIds)];
  const sellerIdRows = uniqueSellerIds.map((sellerId) => ({ _id: sellerId }));

  const [listedCounts, sellersWithFollowers, sellersWithSales] = await Promise.all([
    getSellerListedProductCountByIds(uniqueSellerIds),
    attachFollowersCountToUsers(sellerIdRows),
    attachTotalSalesAmountToUsers(sellerIdRows),
  ]);

  const followersBySellerId = Object.fromEntries(
    sellersWithFollowers.map((seller) => [String(seller._id), seller.followersCount ?? 0]),
  );
  const totalSalesBySellerId = Object.fromEntries(
    sellersWithSales.map((seller) => [String(seller._id), seller.totalSalesAmount ?? 0]),
  );

  return products.map((product) => {
    const seller = product.productSeller;
    if (seller == null || typeof seller !== "object" || seller._id == null) {
      return enrichProductApiFields(product);
    }

    const sellerId = String(seller._id);
    const snapshot = pickProductSellerPublicSnapshot({
      ...seller,
      sellerListedProductCount: listedCounts[sellerId] ?? 0,
      totalSalesAmount: totalSalesBySellerId[sellerId] ?? 0,
      followersCount: followersBySellerId[sellerId] ?? 0,
    });

    return enrichProductApiFields({
      ...product,
      productSeller: snapshot,
    });
  });
};

/**
 * @param {Record<string, unknown> | null | undefined} product
 */
export const attachProductSellerSnapshot = async (product) => {
  if (product == null) {
    return product;
  }

  const [enriched] = await attachProductSellerSnapshots([product]);
  return enriched ?? enrichProductApiFields(product);
};
