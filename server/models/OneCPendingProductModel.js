import mongoose from "mongoose";

import {
  ONEC_ARTICLE_MAX_LENGTH,
  ONEC_DESCRIPTION_MAX_LENGTH,
  ONEC_NAME_MAX_LENGTH,
} from "../constants/onecConstants.js";
import {
  ONEC_CATEGORY_EXTERNAL_ID_MAX_LENGTH,
  ONEC_EXTERNAL_ID_MAX_LENGTH,
} from "../constants/onecExchangeConstants.js";

/**
 * «Отстойник» импорта 1С: номенклатура, которая по правилу приёмки на сайт не
 * попадает — нет ни одной картинки И нет остатка.
 *
 * Зачем отдельная коллекция, а не карточка товара со снятой витриной:
 * в CommerceML каталог и остатки приезжают РАЗНЫМИ файлами (`import.xml`, потом
 * `offers/rests.xml`), поэтому в момент разбора каталога остаток нового товара
 * ещё неизвестен. Держим разобранное описание здесь, ничего не создавая в
 * `products` и не заливая картинки в хранилище; как только тот же `Ид`
 * приезжает с остатком > 0, из строки собирается настоящая карточка.
 *
 * Строка живёт до полной выгрузки, в которой 1С этот `Ид` больше не прислала.
 */
const OneCPendingProductSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    /** `Ид` товара (или `товар#характеристика`) в 1С — тот же ключ, что `product1cGuid`. */
    externalId: {
      type: String,
      required: true,
      trim: true,
      maxlength: ONEC_EXTERNAL_ID_MAX_LENGTH,
    },
    name: {
      type: String,
      default: "",
      trim: true,
      maxlength: ONEC_NAME_MAX_LENGTH,
    },
    description: {
      type: String,
      default: "",
      maxlength: ONEC_DESCRIPTION_MAX_LENGTH,
    },
    article: {
      type: String,
      default: "",
      trim: true,
      maxlength: ONEC_ARTICLE_MAX_LENGTH,
    },
    characteristics: {
      type: [
        {
          _id: false,
          key: { type: String, default: "", maxlength: 60 },
          value: { type: String, default: "", maxlength: 300 },
        },
      ],
      default: [],
    },
    groupIds: {
      type: [String],
      default: [],
    },
    /** Последний остаток из `offers/rests.xml`. `null` — данных ещё не было. */
    lastKnownStock: {
      type: Number,
      default: null,
    },
    /** Последняя цена оттуда же — чтобы карточка родилась сразу с ценой. */
    lastKnownPrice: {
      type: Number,
      default: null,
    },
    /** Когда `Ид` последний раз встретился в каталоге 1С. */
    lastSeenAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

OneCPendingProductSchema.index(
  { sellerId: 1, externalId: 1 },
  { unique: true, name: "onec_pending_seller_external_unique" },
);

export default mongoose.model("OneCPendingProduct", OneCPendingProductSchema);
