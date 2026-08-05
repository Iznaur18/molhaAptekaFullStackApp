import {
  ONEC_DEFAULT_CATEGORY_LABEL,
  ONEC_EXCHANGE_DIRECTION_PULL,
  ONEC_EXCHANGE_STATUS_ERROR,
  ONEC_EXCHANGE_STATUS_SUCCESS,
} from "../../constants/onecConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { OneCExchangeLogModel, ProductModel } from "../../models/index.js";
import { buildProductSearchBlobFromFields } from "../product/buildProductSearchBlob.js";
import { fetchOneCNomenclature } from "./onecHttpClient.js";
import { resolveSellerOneCCredentials } from "./onecSettings.js";

/**
 * @param {string} sellerId
 * @param {{ triggeredBy?: "cron" | "manual" }} [opts]
 */
export async function syncSellerNomenclature(sellerId, opts = {}) {
  const triggeredBy = opts.triggeredBy ?? "cron";
  const creds = await resolveSellerOneCCredentials(sellerId);

  let items;
  try {
    items = await fetchOneCNomenclature(creds);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка загрузки номенклатуры";
    await OneCExchangeLogModel.create({
      sellerId,
      direction: ONEC_EXCHANGE_DIRECTION_PULL,
      status: ONEC_EXCHANGE_STATUS_ERROR,
      message: message.slice(0, 2000),
      triggeredBy,
    });
    throw error;
  }

  const seenGuids = new Set();
  let created = 0;
  let updated = 0;
  let deactivated = 0;

  for (const item of items) {
    seenGuids.add(item.guid);
    const available = item.isActive && item.stock > 0;
    const searchBlob = buildProductSearchBlobFromFields({
      productName: item.name,
      productDescription: item.description,
      productCharacteristics: [],
      productCategory: ONEC_DEFAULT_CATEGORY_LABEL,
      categoryBreadcrumbRu: "",
    });

    const existing = await ProductModel.findOne({
      productSeller: sellerId,
      product1cGuid: item.guid,
    }).select("_id");

    const setFields = {
      productName: item.name,
      productDescription: item.description,
      productPrice: item.price,
      productArticle: item.article,
      productStockQuantity: item.stock,
      productIsAvailable: available,
      productFromOneC: true,
      productModerationStatus: PRODUCT_MODERATION_APPROVED,
      productSearchBlob: searchBlob,
    };

    if (item.imageUrls.length > 0) {
      setFields.productImageUrls = item.imageUrls;
    }

    if (existing) {
      await ProductModel.updateOne(
        { _id: existing._id },
        { $set: setFields },
      );
      updated += 1;
    } else {
      await ProductModel.create({
        productSeller: sellerId,
        product1cGuid: item.guid,
        productCategory: ONEC_DEFAULT_CATEGORY_LABEL,
        productCharacteristics: [],
        productImageUrls: item.imageUrls,
        productOldPrice: null,
        ...setFields,
      });
      created += 1;
    }
  }

  const staleFilter = {
    productSeller: sellerId,
    productFromOneC: true,
    product1cGuid: { $nin: [...seenGuids] },
    $or: [{ productIsAvailable: true }, { productStockQuantity: { $gt: 0 } }],
  };

  const staleResult = await ProductModel.updateMany(staleFilter, {
    $set: {
      productIsAvailable: false,
      productStockQuantity: 0,
    },
  });
  deactivated = staleResult.modifiedCount ?? 0;

  const summary = {
    fetched: items.length,
    created,
    updated,
    deactivated,
  };

  await OneCExchangeLogModel.create({
    sellerId,
    direction: ONEC_EXCHANGE_DIRECTION_PULL,
    status: ONEC_EXCHANGE_STATUS_SUCCESS,
    message: `Номенклатура: +${created} / ~${updated} / −${deactivated}`,
    summary,
    triggeredBy,
  });

  return summary;
}
