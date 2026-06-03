import mongoose from 'mongoose';

/**
 * @template T
 * @param {(session: import('mongoose').ClientSession) => Promise<T>} callback
 * @returns {Promise<T>}
 */
export const runInTransaction = async (callback) => {
    const session = await mongoose.startSession();

    try {
        let result;
        await session.withTransaction(async () => {
            result = await callback(session);
        });
        return /** @type {T} */ (result);
    } finally {
        await session.endSession();
    }
};

/**
 * @param {import('mongoose').ClientSession | null | undefined} session
 * @param {Record<string, unknown>} [options]
 */
export const withMongoSession = (options = {}, session = null) =>
    session ? { ...options, session } : options;
