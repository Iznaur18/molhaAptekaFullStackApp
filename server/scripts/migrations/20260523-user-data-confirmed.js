import { UserModel } from '../../models/index.js';

export async function up() {
    const result = await UserModel.updateMany(
        { isUserDataConfirmed: { $exists: false } },
        { $set: { isUserDataConfirmed: false } },
    );
    const modified = result.modifiedCount ?? result.nModified ?? 0;
    console.log(`isUserDataConfirmed: backfilled ${modified} users`);
}
