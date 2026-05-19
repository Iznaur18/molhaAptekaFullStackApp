/**
 * @param {{ db: import("mongodb").Db; isApply: boolean }} ctx
 * @returns {Promise<{ matched: number; modified: number }>}
 */
export async function up({ db, isApply }) {
  const usersCollection = db.collection("users");
  const matched = await usersCollection.countDocuments({ userRole: "pharmacist" });

  if (!isApply || matched === 0) {
    return { matched, modified: 0 };
  }

  const result = await usersCollection.updateMany(
    { userRole: "pharmacist" },
    { $set: { userRole: "moderator" } },
  );

  return { matched, modified: result.modifiedCount };
}
