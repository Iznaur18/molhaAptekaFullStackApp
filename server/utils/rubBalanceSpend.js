import { UserModel } from '../models/index.js';

export class InsufficientRubBalanceError extends Error {
    /**
     * @param {number} required
     * @param {number} available
     */
    constructor(required, available) {
        super('Недостаточно средств на балансе');
        this.name = 'InsufficientRubBalanceError';
        this.required = required;
        this.available = available;
    }
}

/**
 * @param {{ userId: string; amount: number; session?: import('mongoose').ClientSession }} params
 * @returns {Promise<number>} баланс после списания
 */
export const deductRubBalance = async ({ userId, amount, session }) => {
    const normalizedAmount = Math.ceil(Number(amount));
    if (normalizedAmount <= 0) {
        throw new Error('Сумма списания должна быть больше 0');
    }

    const updated = await UserModel.findOneAndUpdate(
        { _id: userId, userRubBalance: { $gte: normalizedAmount } },
        { $inc: { userRubBalance: -normalizedAmount } },
        { returnDocument: 'after', session: session ?? undefined },
    ).lean();

    if (!updated) {
        const user = await UserModel.findById(userId)
            .select('userRubBalance')
            .lean();
        const available = Number(user?.userRubBalance) || 0;
        throw new InsufficientRubBalanceError(normalizedAmount, available);
    }

    return Number(updated.userRubBalance) || 0;
};

/**
 * @param {{ userId: string; amount: number; session?: import('mongoose').ClientSession }} params
 */
export const refundRubBalance = async ({ userId, amount, session }) => {
    const normalizedAmount = Math.ceil(Number(amount));
    if (normalizedAmount <= 0) {
        return;
    }

    await UserModel.updateOne(
        { _id: userId },
        { $inc: { userRubBalance: normalizedAmount } },
        { session: session ?? undefined },
    );
};
