import { UserModel } from '../models/index.js';

export class InsufficientLoyaltyPointsError extends Error {
    /**
     * @param {number} required
     * @param {number} available
     */
    constructor(required, available) {
        super('Недостаточно баллов');
        this.name = 'InsufficientLoyaltyPointsError';
        this.required = required;
        this.available = available;
    }
}

/**
 * @param {{ userId: string; amount: number; session?: import('mongoose').ClientSession }} params
 * @returns {Promise<number>} баланс после списания
 */
export const deductLoyaltyPoints = async ({ userId, amount, session }) => {
    const normalizedAmount = Math.ceil(Number(amount));
    if (normalizedAmount <= 0) {
        throw new Error('Сумма списания должна быть больше 0');
    }

    const updated = await UserModel.findOneAndUpdate(
        { _id: userId, userLoyaltyPoints: { $gte: normalizedAmount } },
        { $inc: { userLoyaltyPoints: -normalizedAmount } },
        { new: true, session: session ?? undefined },
    ).lean();

    if (!updated) {
        const user = await UserModel.findById(userId)
            .select('userLoyaltyPoints')
            .lean();
        const available = Number(user?.userLoyaltyPoints) || 0;
        throw new InsufficientLoyaltyPointsError(normalizedAmount, available);
    }

    return Number(updated.userLoyaltyPoints) || 0;
};

/**
 * @param {{ userId: string; amount: number; session?: import('mongoose').ClientSession }} params
 */
export const refundLoyaltyPoints = async ({ userId, amount, session }) => {
    const normalizedAmount = Math.ceil(Number(amount));
    if (normalizedAmount <= 0) {
        return;
    }

    await UserModel.updateOne(
        { _id: userId },
        { $inc: { userLoyaltyPoints: normalizedAmount } },
        { session: session ?? undefined },
    );
};
