import assert from "node:assert/strict";
import { describe, it } from "node:test";
import mongoose from "mongoose";

const { default: ProductCategoryDisplayModel } = await import(
  "../models/ProductCategoryDisplayModel.js"
);

/**
 * Хук был написан под `next`, а mongoose 9 его не передаёт: на успешном пути
 * падало «next is not a function», то есть модель нельзя было ни создать, ни
 * сохранить, а сама проверка ключа не выполнялась ни разу. Не всплывало из-за
 * того, что приложение пишет сюда только через `findOneAndUpdate` — документные
 * хуки он не запускает.
 */
describe("ключ переопределения витрины", () => {
  it("слаг без id проходит", async () => {
    const doc = new ProductCategoryDisplayModel({
      categorySlug: "autos",
      customLabel: "Транспорт и запчасти",
    });

    await doc.validate();
  });

  it("id без слага проходит", async () => {
    const doc = new ProductCategoryDisplayModel({
      categoryId: new mongoose.Types.ObjectId(),
      customLabel: "Аксессуары и мелочи",
    });

    await doc.validate();
  });

  it("оба ключа сразу — отказ", async () => {
    const doc = new ProductCategoryDisplayModel({
      categorySlug: "autos",
      categoryId: new mongoose.Types.ObjectId(),
    });

    await assert.rejects(() => doc.validate(), /ровно одно из полей/u);
  });

  it("ни одного ключа — отказ", async () => {
    const doc = new ProductCategoryDisplayModel({ customLabel: "Без адреса" });

    await assert.rejects(() => doc.validate(), /ровно одно из полей/u);
  });
});
