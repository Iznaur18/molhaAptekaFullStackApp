import { PRODUCT_CATEGORY_VALUES } from "../../constants/productConstants.js";
import {
  PRODUCT_SEARCH_SYNONYM_CATEGORIES_MAX,
  PRODUCT_SEARCH_SYNONYM_MIN_TOKEN_LENGTH,
  PRODUCT_SEARCH_SYNONYM_TOKEN_MAX_LENGTH,
} from "../../constants/productSearchSynonymConstants.js";
import ProductSearchSynonymModel from "../../models/ProductSearchSynonymModel.js";
import { AppError } from "../../errors/AppError.js";
import { normalizeProductSearchSynonymToken } from "../../utils/normalizeProductSearchSynonymToken.js";
import { invalidateProductSearchSynonymCache } from "../../utils/productSearchSynonymCache.js";
import { errorRes, successRes } from "../../services/http/index.js";

/**
 * @param {import('mongoose').LeanDocument<import('../../models/ProductSearchSynonymModel.js').default>} row
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

/** GET /product/admin/search-synonyms */
export async function listProductSearchSynonymsAdminController(_req, res) {
  const rows = await ProductSearchSynonymModel.find().sort({ token: 1 }).lean();
  successRes(res, { synonyms: rows.map(toSynonymPayload) });
}

/** POST /product/admin/search-synonyms */
export async function createProductSearchSynonymAdminController(req, res) {
  const token = normalizeProductSearchSynonymToken(req.body?.token);
  if (token.length < PRODUCT_SEARCH_SYNONYM_MIN_TOKEN_LENGTH) {
    return errorRes(
      res,
      400,
      `Токен не короче ${PRODUCT_SEARCH_SYNONYM_MIN_TOKEN_LENGTH} символов`,
    );
  }
  if (token.length > PRODUCT_SEARCH_SYNONYM_TOKEN_MAX_LENGTH) {
    return errorRes(res, 400, "Слишком длинный токен");
  }

  const categories = normalizeCategoriesInput(req.body?.categories);
  const existing = await ProductSearchSynonymModel.findOne({ token }).lean();
  if (existing) {
    return errorRes(res, 409, "Синоним с таким токеном уже есть");
  }

  const doc = await ProductSearchSynonymModel.create({ token, categories });
  invalidateProductSearchSynonymCache();
  successRes(res, { synonym: toSynonymPayload(doc.toObject()) }, 201);
}

/** PATCH /product/admin/search-synonyms/:synonymId */
export async function patchProductSearchSynonymAdminController(req, res) {
  const synonymId = String(req.params.synonymId ?? "");
  const doc = await ProductSearchSynonymModel.findById(synonymId);
  if (!doc) {
    return errorRes(res, 404, "Синоним не найден");
  }

  if (req.body?.token !== undefined) {
    const token = normalizeProductSearchSynonymToken(req.body.token);
    if (token.length < PRODUCT_SEARCH_SYNONYM_MIN_TOKEN_LENGTH) {
      return errorRes(
        res,
        400,
        `Токен не короче ${PRODUCT_SEARCH_SYNONYM_MIN_TOKEN_LENGTH} символов`,
      );
    }
    const duplicate = await ProductSearchSynonymModel.findOne({
      token,
      _id: { $ne: doc._id },
    }).lean();
    if (duplicate) {
      return errorRes(res, 409, "Синоним с таким токеном уже есть");
    }
    doc.token = token;
  }

  if (req.body?.categories !== undefined) {
    doc.categories = normalizeCategoriesInput(req.body.categories);
  }

  await doc.save();
  invalidateProductSearchSynonymCache();
  successRes(res, { synonym: toSynonymPayload(doc.toObject()) });
}

/** DELETE /product/admin/search-synonyms/:synonymId */
export async function deleteProductSearchSynonymAdminController(req, res) {
  const synonymId = String(req.params.synonymId ?? "");
  const deleted = await ProductSearchSynonymModel.findByIdAndDelete(synonymId);
  if (!deleted) {
    return errorRes(res, 404, "Синоним не найден");
  }
  invalidateProductSearchSynonymCache();
  successRes(res, { deletedId: synonymId });
}
