import { ProductModel } from "../../models/index.js";

export const up = async () => {
  await ProductModel.updateMany(
    { productCharacteristics: { $exists: false } },
    { $set: { productCharacteristics: [] } },
  );
};
