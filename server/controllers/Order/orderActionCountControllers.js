import { errorRes, successRes } from '../../utils/index.js';
import {
    countMyOrdersActionItems,
    countMySalesActionItems,
} from '../../utils/orderActionCounts.js';

/** `GET /order/action-count` */
export const getMyOrdersActionCountController = async (req, res) => {
    try {
        const count = await countMyOrdersActionItems(req.userId);
        return successRes(res, { count });
    } catch (error) {
        console.error('getMyOrdersActionCountController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке счётчика');
    }
};

/** `GET /order/sales/action-count` */
export const getMySalesActionCountController = async (req, res) => {
    try {
        const count = await countMySalesActionItems(req.userId);
        return successRes(res, { count });
    } catch (error) {
        console.error('getMySalesActionCountController error:', error);
        return errorRes(res, 500, 'Ошибка при загрузке счётчика');
    }
};
