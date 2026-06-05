import { OrderModel, ProductModel } from "../../models/index.js";

/** Идемпотентно создаёт индексы из схем Product / Order (prod: autoIndex выключен). */
export const up = async () => {
  await ProductModel.createIndexes();
  await OrderModel.createIndexes();
};
