import { CURATED_PRODUCT_LIST_TITLE_MAX_LENGTH } from "../../constants/curatedProductListConstants.js";
import CuratedProductListModel from "../../models/CuratedProductListModel.js";
import { getHiddenSellerIds } from "../../utils/adminUserGuard.js";
import {
  assertCuratedListProductCatalogVisible,
  buildAdminCuratedListsResponse,
  buildHomeCuratedListsResponse,
  normalizeCuratedProductListTitle,
  reorderCuratedProductLists,
  toCuratedProductListPayload,
} from "../../utils/curatedProductListHelpers.js";
import { resolveBuyerCityFilter } from "../../utils/userCityCatalogFilter.js";
import { errorRes, successRes } from "../../utils/index.js";

const sortCuratedLists = { sortOrder: 1, createdAt: 1 };

const parseTruthyQueryFlag = (raw) =>
  raw != null && String(raw).trim().toLowerCase() === "true";

/** GET /product/curated-lists/home */
export async function getHomeCuratedProductListsController(req, res) {
  try {
    const hiddenSellerIds = await getHiddenSellerIds();
    const allCities = parseTruthyQueryFlag(req.query.allCities);
    const buyerCityKey = allCities ? null : await resolveBuyerCityFilter(req.userId);

    const lists = await CuratedProductListModel.find().sort(sortCuratedLists).lean();
    const curatedLists = await buildHomeCuratedListsResponse(lists, hiddenSellerIds, {
      buyerCityKey,
    });
    successRes(res, { lists: curatedLists });
  } catch (error) {
    return errorRes(
      res,
      500,
      error instanceof Error ? error.message : "Не удалось загрузить подборки",
    );
  }
}

/** GET /product/admin/curated-lists */
export async function listCuratedProductListsAdminController(_req, res) {
  try {
    const hiddenSellerIds = await getHiddenSellerIds();
    const lists = await CuratedProductListModel.find().sort(sortCuratedLists).lean();
    const curatedLists = await buildAdminCuratedListsResponse(lists, hiddenSellerIds);
    successRes(res, { lists: curatedLists });
  } catch (error) {
    return errorRes(
      res,
      500,
      error instanceof Error ? error.message : "Не удалось загрузить подборки",
    );
  }
}

/** POST /product/admin/curated-lists */
export async function createCuratedProductListAdminController(req, res) {
  try {
    const title = normalizeCuratedProductListTitle(req.body?.title);
    if (title.length > CURATED_PRODUCT_LIST_TITLE_MAX_LENGTH) {
      return errorRes(res, 400, "Слишком длинный заголовок");
    }

    const maxSortOrder = await CuratedProductListModel.findOne()
      .sort({ sortOrder: -1 })
      .select("sortOrder")
      .lean();
    const sortOrder = Number(maxSortOrder?.sortOrder ?? -1) + 1;

    const doc = await CuratedProductListModel.create({
      title,
      sortOrder,
      updatedBy: req.userId ?? null,
    });

    successRes(res, { list: toCuratedProductListPayload(doc.toObject()) }, 201);
  } catch (error) {
    return errorRes(
      res,
      400,
      error instanceof Error ? error.message : "Не удалось создать список",
    );
  }
}

/** PATCH /product/admin/curated-lists/reorder */
export async function reorderCuratedProductListsAdminController(req, res) {
  try {
    const orderedListIds = Array.isArray(req.body?.orderedListIds)
      ? req.body.orderedListIds.map((id) => String(id))
      : [];
    if (!orderedListIds.length) {
      return errorRes(res, 400, "Укажите orderedListIds");
    }

    await reorderCuratedProductLists(orderedListIds);
    const hiddenSellerIds = await getHiddenSellerIds();
    const lists = await CuratedProductListModel.find().sort(sortCuratedLists).lean();
    const curatedLists = await buildAdminCuratedListsResponse(lists, hiddenSellerIds);
    successRes(res, { lists: curatedLists });
  } catch (error) {
    return errorRes(
      res,
      400,
      error instanceof Error ? error.message : "Не удалось изменить порядок списков",
    );
  }
}

/** PATCH /product/admin/curated-lists/:listId */
export async function patchCuratedProductListAdminController(req, res) {
  try {
    const listId = String(req.params.listId ?? "");
    const doc = await CuratedProductListModel.findById(listId);
    if (!doc) {
      return errorRes(res, 404, "Список не найден");
    }

    if (req.body?.title !== undefined) {
      const title = normalizeCuratedProductListTitle(req.body.title);
      if (title.length > CURATED_PRODUCT_LIST_TITLE_MAX_LENGTH) {
        return errorRes(res, 400, "Слишком длинный заголовок");
      }
      doc.title = title;
    }

    doc.updatedBy = req.userId ?? null;
    await doc.save();
    successRes(res, { list: toCuratedProductListPayload(doc.toObject()) });
  } catch (error) {
    return errorRes(
      res,
      400,
      error instanceof Error ? error.message : "Не удалось обновить список",
    );
  }
}

/** DELETE /product/admin/curated-lists/:listId */
export async function deleteCuratedProductListAdminController(req, res) {
  try {
    const listId = String(req.params.listId ?? "");
    const deleted = await CuratedProductListModel.findByIdAndDelete(listId);
    if (!deleted) {
      return errorRes(res, 404, "Список не найден");
    }
    successRes(res, { deletedId: listId });
  } catch (error) {
    return errorRes(
      res,
      500,
      error instanceof Error ? error.message : "Не удалось удалить список",
    );
  }
}

/** POST /product/admin/curated-lists/:listId/products */
export async function addCuratedProductListItemAdminController(req, res) {
  try {
    const listId = String(req.params.listId ?? "");
    const productId = String(req.body?.productId ?? "").trim();

    const doc = await CuratedProductListModel.findById(listId);
    if (!doc) {
      return errorRes(res, 404, "Список не найден");
    }

    await assertCuratedListProductCatalogVisible(productId);

    const existingIds = (doc.productIds ?? []).map((id) => String(id));
    if (existingIds.includes(productId)) {
      return errorRes(res, 409, "Товар уже есть в этом списке");
    }

    doc.productIds = [...existingIds, productId];
    doc.updatedBy = req.userId ?? null;
    await doc.save();

    successRes(res, { list: toCuratedProductListPayload(doc.toObject()) });
  } catch (error) {
    return errorRes(
      res,
      400,
      error instanceof Error ? error.message : "Не удалось добавить товар",
    );
  }
}

/** DELETE /product/admin/curated-lists/:listId/products/:productId */
export async function removeCuratedProductListItemAdminController(req, res) {
  try {
    const listId = String(req.params.listId ?? "");
    const productId = String(req.params.productId ?? "").trim();

    const doc = await CuratedProductListModel.findById(listId);
    if (!doc) {
      return errorRes(res, 404, "Список не найден");
    }

    const nextIds = (doc.productIds ?? [])
      .map((id) => String(id))
      .filter((id) => id !== productId);

    if (nextIds.length === (doc.productIds ?? []).length) {
      return errorRes(res, 404, "Товар не найден в списке");
    }

    doc.productIds = nextIds;
    doc.updatedBy = req.userId ?? null;
    await doc.save();

    successRes(res, { list: toCuratedProductListPayload(doc.toObject()) });
  } catch (error) {
    return errorRes(
      res,
      500,
      error instanceof Error ? error.message : "Не удалось удалить товар из списка",
    );
  }
}
