import mongoose from "mongoose";

import {
  ONEC_CATEGORY_EXTERNAL_ID_MAX_LENGTH,
  ONEC_CATEGORY_NAME_MAX_LENGTH,
} from "../constants/onecExchangeConstants.js";

/**
 * Дерево групп номенклатуры из `import.xml` (`Классификатор/Группы`) и его
 * сопоставление с категориями сайта.
 *
 * Импорт только **заполняет** дерево; `categoryId` проставляет продавец руками
 * в кабинете. Товар без сопоставленной (своей или ближайшей родительской)
 * категории на витрину не выходит — иначе он не находится ни одним фильтром
 * каталога, который ищет по `productCategoryId`.
 */
const OneCCategoryMappingSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    /** Ид группы в 1С. */
    externalId: {
      type: String,
      required: true,
      trim: true,
      maxlength: ONEC_CATEGORY_EXTERNAL_ID_MAX_LENGTH,
    },
    name: {
      type: String,
      default: "",
      trim: true,
      maxlength: ONEC_CATEGORY_NAME_MAX_LENGTH,
    },
    parentExternalId: {
      type: String,
      default: null,
      trim: true,
      maxlength: ONEC_CATEGORY_EXTERNAL_ID_MAX_LENGTH,
    },
    /** Путь имён от корня — чтобы в кабинете было видно «Аптека / Витамины». */
    pathNames: {
      type: [String],
      default: [],
    },
    depth: {
      type: Number,
      default: 0,
      min: 0,
    },
    /** Категория сайта. `null` — ещё не сопоставлено. */
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      default: null,
    },
    /** Сколько товаров последнего импорта пришло в эту группу — для сортировки в UI. */
    productCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastSeenAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

OneCCategoryMappingSchema.index(
  { sellerId: 1, externalId: 1 },
  { unique: true, name: "onec_category_seller_external_unique" },
);
OneCCategoryMappingSchema.index(
  { sellerId: 1, categoryId: 1 },
  { name: "onec_category_seller_mapped" },
);

export default mongoose.model(
  "OneCCategoryMapping",
  OneCCategoryMappingSchema,
);
