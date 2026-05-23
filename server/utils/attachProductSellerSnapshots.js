import { PRODUCT_SELLER_PUBLIC_FIELD_NAMES } from '../constants/productSellerPublicFields.js';
import { getSellerListedProductCountByIds } from './sellerListedProductCount.js';

/**
 * @param {Record<string, unknown> | null | undefined} seller
 */
export const pickProductSellerPublicSnapshot = (seller) => {
    if (seller == null || typeof seller !== 'object') {
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

    const listedCounts = await getSellerListedProductCountByIds(sellerIds);

    return products.map((product) => {
        const seller = product.productSeller;
        if (seller == null || typeof seller !== 'object' || seller._id == null) {
            return product;
        }

        const sellerId = String(seller._id);
        const snapshot = pickProductSellerPublicSnapshot({
            ...seller,
            sellerListedProductCount: listedCounts[sellerId] ?? 0,
        });

        return {
            ...product,
            productSeller: snapshot,
        };
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
    return enriched;
};
