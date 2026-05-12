import { ProductModel } from '../../models/index.js';
import { buildRegexSearchOr, errorRes, successRes } from '../../utils/index.js';

const SELLER_PUBLIC_FIELDS = 'userName email userPhoneNumber _id userRatingByVotes';
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

export const getProductsController = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const productsQuery = buildProductsQuery(req.query.search, {
            productIsAvailable: { $ne: false },
        });

        const [products, total] = await Promise.all([
            ProductModel.find(productsQuery)
                .populate('productSeller', SELLER_PUBLIC_FIELDS)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ProductModel.countDocuments(productsQuery),
        ]);

        const pagination = {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };

        return successRes(res, { products, pagination });
    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при получении продуктов');
    }
};

export const getMyProductsController = async (req, res) => {
    try {
        const productsQuery = buildProductsQuery(req.query.search, {
            productSeller: req.userId,
        });

        const products = await ProductModel.find(productsQuery)
            .populate('productSeller', SELLER_PUBLIC_FIELDS)
            .sort({ createdAt: -1 })
            .lean();

        return successRes(res, { products });
    } catch (error) {
        console.error(error);
        return errorRes(res, 500, 'Ошибка при получении своих продуктов');
    }
};
