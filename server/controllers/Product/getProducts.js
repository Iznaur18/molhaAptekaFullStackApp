import {
    MY_PRODUCTS_MODERATION_FILTER_VALUES,
    PRODUCT_MODERATION_APPROVED,
} from '../../constants/productModerationConstants.js';
import {
    PRODUCT_SORT_CONFIRMED,
    PRODUCT_SORT_PREMIUM,
} from '../../constants/productCatalogSort.js';
import { getHiddenSellerIds, isUserAdmin } from '../../utils/adminUserGuard.js';
import { getConfirmedSellerIds } from '../../utils/confirmedSellerCatalog.js';
import {
    filterSellerIdsExcludingHidden,
    getPremiumSellerIds,
} from '../../utils/premiumSellerCatalog.js';
import { getProductIdsWithOpenSales } from '../../utils/productOrderLocks.js';
import {
    countProducts,
    findProductsPage,
    parseProductSortFromQuery,
} from '../../utils/productCatalogQuery.js';
import { buildRegexSearchOr, errorRes, successRes } from '../../utils/index.js';

const PRODUCT_SEARCH_FIELDS = ['productName'];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const parsePagination = (query) => {
    const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const buildProductsQuery = (search, baseQuery = {}) => {
    const searchCondition = buildRegexSearchOr(search, PRODUCT_SEARCH_FIELDS);
    return searchCondition ? { ...baseQuery, ...searchCondition } : baseQuery;
};

const categoryFromQuery = (query) => {
    const raw = query?.productCategory;
    if (raw == null || String(raw).trim() === '') return null;
    return String(raw).trim();
};

const buildPagination = (page, limit, total) => ({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
});

export const getProductsController = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const category = categoryFromQuery(req.query);
        const premiumOnly = req.query.sort === PRODUCT_SORT_PREMIUM;
        const confirmedOnly = req.query.sort === PRODUCT_SORT_CONFIRMED;
        const sort = parseProductSortFromQuery(req.query);
        const hiddenSellerIds = await getHiddenSellerIds();
        const isAdmin = await isUserAdmin(req.userId);
        const includeHidden =
            isAdmin && String(req.query.includeHidden).toLowerCase() === 'true';

        const catalogBaseQuery = {
            productModerationStatus: PRODUCT_MODERATION_APPROVED,
            ...(category ? { productCategory: category } : {}),
        };
        if (!includeHidden) {
            catalogBaseQuery.productIsAvailable = { $ne: false };
        }

        if (premiumOnly) {
            const premiumSellerIds = filterSellerIdsExcludingHidden(
                await getPremiumSellerIds(),
                hiddenSellerIds,
            );
            catalogBaseQuery.productSeller = { $in: premiumSellerIds };
        } else if (confirmedOnly) {
            const confirmedSellerIds = filterSellerIdsExcludingHidden(
                await getConfirmedSellerIds(),
                hiddenSellerIds,
            );
            catalogBaseQuery.productSeller = { $in: confirmedSellerIds };
        } else if (hiddenSellerIds.length > 0) {
            catalogBaseQuery.productSeller = { $nin: hiddenSellerIds };
        }

        const productsQuery = buildProductsQuery(req.query.search, catalogBaseQuery);

        if (
            (premiumOnly || confirmedOnly) &&
            catalogBaseQuery.productSeller?.$in?.length === 0
        ) {
            return successRes(res, {
                products: [],
                pagination: buildPagination(page, limit, 0),
            });
        }

        const [products, total] = await Promise.all([
            findProductsPage(productsQuery, sort, skip, limit),
            countProducts(productsQuery),
        ]);

        let productsPayload = products;
        if (isAdmin) {
            const openSalesIds = await getProductIdsWithOpenSales(
                products.map((p) => String(p._id)),
            );
            productsPayload = products.map((product) => ({
                ...product,
                hasOpenSales: openSalesIds.has(String(product._id)),
            }));
        }

        return successRes(res, {
            products: productsPayload,
            pagination: buildPagination(page, limit, total),
        });
    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при получении продуктов');
    }
};

const moderationStatusFromQuery = (query) => {
    const raw = query?.moderationStatus;
    if (raw == null || String(raw).trim() === '') {
        return null;
    }
    const value = String(raw).trim();
    return MY_PRODUCTS_MODERATION_FILTER_VALUES.includes(value) ? value : null;
};

export const getMyProductsController = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const category = categoryFromQuery(req.query);
        const sort = parseProductSortFromQuery(req.query);
        const moderationStatus = moderationStatusFromQuery(req.query);
        const productsQuery = buildProductsQuery(req.query.search, {
            productSeller: req.userId,
            ...(category ? { productCategory: category } : {}),
            ...(moderationStatus ? { productModerationStatus: moderationStatus } : {}),
        });

        const [products, total] = await Promise.all([
            findProductsPage(productsQuery, sort, skip, limit),
            countProducts(productsQuery),
        ]);

        const openSalesIds = await getProductIdsWithOpenSales(
            products.map((p) => String(p._id)),
        );
        const productsWithSalesFlags = products.map((product) => ({
            ...product,
            hasOpenSales: openSalesIds.has(String(product._id)),
        }));

        return successRes(res, {
            products: productsWithSalesFlags,
            pagination: buildPagination(page, limit, total),
        });
    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при получении своих продуктов');
    }
};
