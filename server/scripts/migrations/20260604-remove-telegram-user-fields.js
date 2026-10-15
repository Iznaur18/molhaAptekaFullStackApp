import { UserModel } from "../../models/index.js";

export const removeTelegramUserFieldsUp = async () => {
  await UserModel.updateMany(
    {},
    {
      $unset: {
        telegramUserId: "",
        telegramUsername: "",
        telegramPhotoUrl: "",
      },
    },
  );

  try {
    await UserModel.collection.dropIndex("telegramUserId_1");
  } catch (error) {
    // Индекс уже удалён или не создавался, на чистой базе нет и коллекции —
    // это и нужно.
    const codeName = /** @type {{ codeName?: string }} */ (error)?.codeName;
    if (codeName !== "IndexNotFound" && codeName !== "NamespaceNotFound") {
      throw error;
    }
  }
};
