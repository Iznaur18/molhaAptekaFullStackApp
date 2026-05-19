import { getHiddenSellerIds } from '../../utils/adminUserGuard.js';
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
        const sort = parseProductSortFromQuery(req.query);
        const hiddenSellerIds = await getHiddenSellerIds();
        const productsQuery = buildProductsQuery(req.query.search, {
            productIsAvailable: { $ne: false },
            ...(category ? { productCategory: category } : {}),
            ...(hiddenSellerIds.length > 0
                ? { productSeller: { $nin: hiddenSellerIds } }
                : {}),
        });

        const [products, total] = await Promise.all([
            findProductsPage(productsQuery, sort, skip, limit),
            countProducts(productsQuery),
        ]);

        return successRes(res, {
            products,
            pagination: buildPagination(page, limit, total),
        });
    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при получении продуктов');
    }
};

export const getMyProductsController = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const category = categoryFromQuery(req.query);
        const sort = parseProductSortFromQuery(req.query);
        const productsQuery = buildProductsQuery(req.query.search, {
            productSeller: req.userId,
            ...(category ? { productCategory: category } : {}),
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
