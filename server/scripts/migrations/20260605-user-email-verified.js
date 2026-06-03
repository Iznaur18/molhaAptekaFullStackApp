/**
 * Backfill isEmailVerified=true для существующих пользователей с email.
 */
export const up = async () => {
    const { UserModel } = await import('../../models/index.js');

    const result = await UserModel.updateMany(
        {
            email: { $exists: true, $nin: [null, ''] },
            isEmailVerified: { $ne: true },
        },
        { $set: { isEmailVerified: true } },
    );

    return {
        matched: result.matchedCount ?? result.n ?? 0,
        modified: result.modifiedCount ?? result.nModified ?? 0,
    };
};
