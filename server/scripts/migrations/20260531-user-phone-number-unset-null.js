/**
 * Удаляет `userPhoneNumber: null | ''` — sparse unique index допускает
 * только отсутствие поля, не несколько явных null.
 *
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
    const users = db.collection('users');
    const filter = {
        $or: [{ userPhoneNumber: null }, { userPhoneNumber: '' }],
    };

    const matched = await users.countDocuments(filter);

    if (!isApply) {
        return { matched, wouldUnset: matched };
    }

    const result = await users.updateMany(filter, {
        $unset: { userPhoneNumber: 1 },
    });

    return { matched, modified: result.modifiedCount };
}
