import { attachTotalPurchasesAmountToUsers } from './buyerTotalPurchasesAmount.js';
import { attachTotalSalesAmountToUsers } from './sellerTotalSalesAmount.js';

/**
 * @param {Record<string, unknown>[]} users
 */
export const attachUserListCommerceStats = async (users) => {
    if (!Array.isArray(users) || users.length === 0) {
        return users;
    }

    const [withSales, withPurchases] = await Promise.all([
        attachTotalSalesAmountToUsers(users),
        attachTotalPurchasesAmountToUsers(users),
    ]);

    return withSales.map((user, index) => ({
        ...user,
        totalPurchasesAmount: withPurchases[index]?.totalPurchasesAmount ?? 0,
    }));
};
