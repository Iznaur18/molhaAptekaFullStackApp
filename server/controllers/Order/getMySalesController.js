import { OrderModel, ProductModel, UserModel } from '../../models/index.js';
import { buildRegexSearchOr, errorRes, successRes } from '../../utils/index.js';

import {
    ORDER_BUYER_PUBLIC_FIELDS,
    ORDER_ITEMS_POPULATE,
} from './orderQueries.js';
import { normalizeOrderItemsForRuntime } from './orderStatus.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePagination = (query) => {
    const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const normalizeId = (value) => String(value ?? '');

const calculateTotalAmount = (items) =>
    items.reduce((sum, item) => sum + item.quantity * item.unitPriceAtOrder, 0);

const buildBuyerIdsBySearch = async (searchTerm) => {
    if (!searchTerm) return null;

    const buyerSearchQuery = buildRegexSearchOr(searchTerm, [
        'userName',
        'email',
        'userPhoneNumber',
    ]);
    if (!buyerSearchQuery) return null;

    const buyers = await UserModel.find(buyerSearchQuery).select('_id').lean();
    return buyers.map((buyer) => buyer._id);
};

/** `GET /order/sales` — продажи текущего продавца (товары из его каталога в заказах покупателей). */
export const getMySalesController = async (req, res) => {
    try {
        const sellerId = String(req.userId);
        const { page, limit, skip } = parsePagination(req.query);
        const { status, search } = req.query;

        const sellerProducts = await ProductModel.find({ productSeller: sellerId })
            .select('_id')
            .lean();
        const sellerProductIds = sellerProducts.map((product) => product._id);

        if (sellerProductIds.length === 0) {
            return successRes(res, { orders: [], total: 0, page, limit });
        }

        const buyerIds = await buildBuyerIdsBySearch(search);
        if (search && buyerIds?.length === 0) {
            return successRes(res, { orders: [], total: 0, page, limit });
        }

        const query = {
            'items.productId': { $in: sellerProductIds },
            ...(buyerIds ? { userBuyerId: { $in: buyerIds } } : {}),
        };
        const [rawOrders, total] = await Promise.all([
            OrderModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userBuyerId', ORDER_BUYER_PUBLIC_FIELDS)
                .populate(ORDER_ITEMS_POPULATE)
                .lean(),
            OrderModel.countDocuments(query),
        ]);

        const orders = rawOrders
            .map((order) => {
                normalizeOrderItemsForRuntime(order.items);
                const sellerItems = order.items
                    .map((item, itemIndex) => ({ ...item, itemIndex }))
                    .filter((item) => {
                    if (!item?.productId || typeof item.productId === 'string') return false;
                    const itemSellerId = normalizeId(
                        item.productId.productSeller?._id ?? item.productId.productSeller,
                    );
                    const statusMatches = status ? item.status === status : true;
                    return itemSellerId === sellerId && statusMatches;
                    });

                if (sellerItems.length === 0) return null;

                return {
                    ...order,
                    items: sellerItems,
                    totalAmount: calculateTotalAmount(sellerItems),
                };
            })
            .filter(Boolean);

        return successRes(res, { orders, total, page, limit });
    } catch (error) {
        console.error('getMySalesController error:', error);
        return errorRes(res, 500, 'Ошибка при получении продаж');
    }
};
