import { PRODUCT_SELLER_PUBLIC_FIELD_NAMES } from "../../constants/productSellerPublicFields.js";
import { attachTotalSalesAmountToUsers } from "../order/sellerTotalSalesAmount.js";
import { attachFollowersCountToUsers } from "../user/userFollowHelpers.js";
import { enrichProductApiFields } from "./productDiscount.js";
import { getSellerListedProductCountByIds } from "./sellerListedProductCount.js";

/**
 * Читает значение по пути `a.b`.
 *
 * В списке публичных полей есть вложенные (`sellerSafeDeal.moderationStatus`):
 * для `.select()` это одна строка, а в документе — объект, и плоское
 * `seller["sellerSafeDeal.moderationStatus"]` всегда undefined. Из-за этого
 * поле молча не доезжало до витрины.
 *
 * @param {Record<string, unknown>} source
 * @param {string} path
 */
const readSellerFieldPath = (source, path) => {
  let current = /** @type {unknown} */ (source);
  for (const segment of path.split(".")) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    current = /** @type {Record<string, unknown>} */ (current)[segment];
  }
  return current;
};

/**
 * @param {Record<string, unknown>} target
 * @param {string} path
 * @param {unknown} value
 */
const writeSellerFieldPath = (target, path, value) => {
  const segments = path.split(".");
  let current = target;
  for (const segment of segments.slice(0, -1)) {
    if (current[segment] == null || typeof current[segment] !== "object") {
      current[segment] = {};
    }
    current = /** @type {Record<string, unknown>} */ (current[segment]);
  }
  current[segments[segments.length - 1]] = value;
};

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
    const value = readSellerFieldPath(seller, key);
    if (value !== undefined) {
      writeSellerFieldPath(snapshot, key, value);
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
    sellersWithFollowers.map((seller) => [
      String(seller._id),
      seller.followersCount ?? 0,
    ]),
  );
  const totalSalesBySellerId = Object.fromEntries(
    sellersWithSales.map((seller) => [
      String(seller._id),
      seller.totalSalesAmount ?? 0,
    ]),
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
