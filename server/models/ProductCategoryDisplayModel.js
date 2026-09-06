import mongoose from "mongoose";

import { PRODUCT_CATEGORY_SLUG_MAX_LENGTH } from "../constants/productCategoryTreeConstants.js";

const Schema = mongoose.Schema;

const ProductCategoryDisplaySchema = new Schema(
  {
    categorySlug: {
      type: String,
      trim: true,
      maxlength: PRODUCT_CATEGORY_SLUG_MAX_LENGTH,
      default: null,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      default: null,
    },
    customLabel: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

// ВАЖНО: sparse НЕ исключает документы с полем = null (только полностью
// отсутствующее поле). Поскольку categorySlug/categoryId имеют default: null,
// каждая «node»-запись хранит categorySlug: null, а каждая «slug»-запись —
// categoryId: null. С { unique, sparse } второй null конфликтует с первым и даёт
// E11000. Поэтому используем partialFilterExpression: индексируем только реальные
// значения нужного типа, а null'ы в уникальный индекс не попадают.
ProductCategoryDisplaySchema.index(
  { categorySlug: 1 },
  { unique: true, partialFilterExpression: { categorySlug: { $type: "string" } } },
);
ProductCategoryDisplaySchema.index(
  { categoryId: 1 },
  { unique: true, partialFilterExpression: { categoryId: { $type: "objectId" } } },
);

/**
 * Ключ ровно один: либо слаг корневой плитки, либо id узла дерева.
 *
 * Хук был написан в старом стиле, через `next`, а mongoose 9 его больше не
 * передаёт: на успешном пути падало «next is not a function», то есть любой
 * `create()`/`save()` по этой модели бросал исключение, а сама проверка не
 * выполнялась никогда. Не всплывало потому, что приложение пишет сюда только
 * через `findOneAndUpdate`, а он документные хуки не запускает вовсе.
 */
ProductCategoryDisplaySchema.pre("validate", function validateCategoryDisplayKey() {
  const hasSlug =
    typeof this.categorySlug === "string" && this.categorySlug.trim().length > 0;
  const hasId = this.categoryId != null;

  if (hasSlug === hasId) {
    throw new Error("Укажите ровно одно из полей: categorySlug или categoryId");
  }
});

export default mongoose.model("ProductCategoryDisplay", ProductCategoryDisplaySchema);
