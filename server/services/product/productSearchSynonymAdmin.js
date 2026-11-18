import { PRODUCT_CATEGORY_VALUES } from "../../constants/productConstants.js";
import {
  PRODUCT_SEARCH_SYNONYM_CATEGORIES_MAX,
  PRODUCT_SEARCH_SYNONYM_MIN_TOKEN_LENGTH,
  PRODUCT_SEARCH_SYNONYM_TOKEN_MAX_LENGTH,
} from "../../constants/productSearchSynonymConstants.js";
import { AppError } from "../../errors/AppError.js";
import ProductSearchSynonymModel from "../../models/ProductSearchSynonymModel.js";
import { normalizeProductSearchSynonymToken } from "../../utils/normalizeProductSearchSynonymToken.js";
import { invalidateProductSearchSynonymCache } from "./productSearchSynonymCache.js";

/**
 * @param {Record<string, unknown>} row
 */
const toSynonymPayload = (row) => ({
  _id: String(row._id),
  token: String(row.token ?? ""),
  categories: Array.isArray(row.categories) ? row.categories : [],
  updatedAt: row.updatedAt ?? null,
  createdAt: row.createdAt ?? null,
});

/**
 * @param {unknown} raw
 */
const normalizeCategoriesInput = (raw) => {
  if (!Array.isArray(raw)) {
    throw new AppError(400, "categories должен быть массивом slug");
  }
  const unique = [
    ...new Set(
      raw
        .map((item) => String(item ?? "").trim())
        .filter((slug) => PRODUCT_CATEGORY_VALUES.includes(slug)),
    ),
  ];
  if (!unique.length) {
    throw new AppError(400, "Укажите хотя бы одну категорию");
  }
  if (unique.length > PRODUCT_SEARCH_SYNONYM_CATEGORIES_MAX) {
    throw new AppError(
      400,
      `Не более ${PRODUCT_SEARCH_SYNONYM_CATEGORIES_MAX} категорий на синоним`,
    );
  }
  return unique;
};

/**
 * @param {unknown} rawToken
 */
const assertToken = (rawToken) => {
  const token = normalizeProductSearchSynonymToken(rawToken);
  if (token.length < PRODUCT_SEARCH_SYNONYM_MIN_TOKEN_LENGTH) {
    throw new AppError(
      400,
      `Токен не короче ${PRODUCT_SEARCH_SYNONYM_MIN_TOKEN_LENGTH} символов`,
    );
  }
  if (token.length > PRODUCT_SEARCH_SYNONYM_TOKEN_MAX_LENGTH) {
    throw new AppError(400, "Слишком длинный токен");
  }
  return token;
};

export async function listProductSearchSynonymsAdmin() {
  const rows = await ProductSearchSynonymModel.find().sort({ token: 1 }).lean();
  return { synonyms: rows.map(toSynonymPayload) };
}

/**
 * @param {{ token: unknown; categories: unknown }} args
 */
export async function createProductSearchSynonymAdmin({ token: tokenRaw, categories }) {
  const token = assertToken(tokenRaw);
  const normalizedCategories = normalizeCategoriesInput(categories);
  const existing = await ProductSearchSynonymModel.findOne({ token }).lean();
  if (existing) {
    throw new AppError(409, "Синоним с таким токеном уже есть");
  }

  const doc = await ProductSearchSynonymModel.create({
    token,
    categories: normalizedCategories,
  });
  invalidateProductSearchSynonymCache();
  return { synonym: toSynonymPayload(doc.toObject()) };
}

/**
 * @param {{
 *   synonymId: string;
 *   token?: unknown;
 *   categories?: unknown;
 * }} args
 */
export async function patchProductSearchSynonymAdmin({
  synonymId,
  token: tokenRaw,
  categories,
}) {
  const doc = await ProductSearchSynonymModel.findById(synonymId);
  if (!doc) {
    throw new AppError(404, "Синоним не найден");
  }

  if (tokenRaw !== undefined) {
    const token = assertToken(tokenRaw);
    const duplicate = await ProductSearchSynonymModel.findOne({
      token,
      _id: { $ne: doc._id },
    }).lean();
    if (duplicate) {
      throw new AppError(409, "Синоним с таким токеном уже есть");
    }
    doc.token = token;
  }

  if (categories !== undefined) {
    doc.categories = normalizeCategoriesInput(categories);
  }

  await doc.save();
  invalidateProductSearchSynonymCache();
  return { synonym: toSynonymPayload(doc.toObject()) };
}

/**
 * @param {{ synonymId: string }} args
 */
export async function deleteProductSearchSynonymAdmin({ synonymId }) {
  const deleted = await ProductSearchSynonymModel.findByIdAndDelete(synonymId);
  if (!deleted) {
    throw new AppError(404, "Синоним не найден");
  }
  invalidateProductSearchSynonymCache();
  return { deletedId: synonymId };
}
