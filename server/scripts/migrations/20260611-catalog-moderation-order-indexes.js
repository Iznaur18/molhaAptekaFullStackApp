import { OrderModel, ProductModel } from "../../models/index.js";

/** Идемпотентно создаёт индексы из схем Product / Order (страховка к autoIndex). */
export const up = async () => {
  await ProductModel.createIndexes();
  await OrderModel.createIndexes();
};
