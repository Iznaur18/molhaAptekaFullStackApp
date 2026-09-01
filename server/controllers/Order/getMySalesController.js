import mongoose from "mongoose";

import { OrderModel, ProductModel, UserModel } from "../../models/index.js";
import { errorRes, successRes } from "../../services/http/index.js";
import { buildRegexSearchOr } from "../../utils/buildRegexSearchOr.js";
import { loadInstallmentPlanSummariesByIds } from "../../services/installment/installmentHelpers.js";
import { sanitizeOrderForSellerApi } from "../../services/order/buyerPassportShare.js";
import { attachShipmentCourierInfo } from "../../services/order/attachShipmentCourierInfo.js";

import { ORDER_BUYER_PUBLIC_FIELDS, ORDER_ITEMS_POPULATE } from "./orderQueries.js";
import { ORDER_AFFILIATE_REFERRER_POPULATE } from "../../services/order/orderQueries.js";
import {
  fetchMySalesOrderPageIds,
  orderRowsByIds,
} from "../../services/order/fetchMySalesOrderPageIds.js";
import {
  buildOrderStatusFromItems,
  normalizeOrderItemsForRuntime,
} from "../../services/order/orderStatus.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MAX_PRODUCT_IDS_IN_FILTER = 50;

/**
 * @param {unknown} raw
 * @param {import('mongoose').Types.ObjectId[]} sellerProductIds
 * @returns
 *   | { ok: true; productIdSet: Set<string> | null; queryProductIds: import('mongoose').Types.ObjectId[] }
 *   | { ok: false; message: string }
 */
const resolveProductIdsFilter = (raw, sellerProductIds) => {
  if (raw == null || String(raw).trim() === "") {
    return {
      ok: true,
      productIdSet: null,
      queryProductIds: sellerProductIds,
    };
  }

  const parts = String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const unique = [...new Set(parts)];

  if (unique.length === 0) {
    return {
      ok: true,
      productIdSet: null,
      queryProductIds: sellerProductIds,
    };
  }

  if (unique.length > MAX_PRODUCT_IDS_IN_FILTER) {
    return {
      ok: false,
      message: `Не более ${MAX_PRODUCT_IDS_IN_FILTER} товаров в фильтре`,
    };
  }
  for (const id of unique) {
    if (!mongoose.isValidObjectId(id)) {
      return { ok: false, message: "Неверный идентификатор товара в фильтре" };
    }
  }

  const sellerSet = new Set(sellerProductIds.map((id) => String(id)));
  for (const id of unique) {
    if (!sellerSet.has(id)) {
      return { ok: false, message: "Указан товар не из вашего каталога" };
    }
  }

  return {
    ok: true,
    productIdSet: new Set(unique),
    queryProductIds: unique.map((id) => new mongoose.Types.ObjectId(id)),
  };
};

const parsePagination = (query) => {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const normalizeId = (value) => String(value ?? "");

const calculateTotalAmount = (items) =>
  items.reduce((sum, item) => sum + item.quantity * item.unitPriceAtOrder, 0);

const buildBuyerIdsBySearch = async (searchTerm) => {
  if (!searchTerm) return null;

  const buyerSearchQuery = buildRegexSearchOr(searchTerm, [
    "userName",
    "email",
    "userPhoneNumber",
  ]);
  if (!buyerSearchQuery) return null;

  const buyers = await UserModel.find(buyerSearchQuery).select("_id").lean();
  return buyers.map((buyer) => buyer._id);
};

/** `GET /order/sales` — продажи текущего продавца (товары из его каталога в заказах покупателей). */
export const getMySalesController = async (req, res) => {
  const sellerId = String(req.userId);
  const { page, limit, skip } = parsePagination(req.query);
  const { status, search, productIds } = req.query;

  const sellerProducts = await ProductModel.find({ productSeller: sellerId })
    .select("_id")
    .lean();
  const sellerProductIds = sellerProducts.map((product) => product._id);

  if (sellerProductIds.length === 0) {
    return successRes(res, { orders: [], total: 0, page, limit });
  }

  const filterResult = resolveProductIdsFilter(productIds, sellerProductIds);
  if (!filterResult.ok) {
    return errorRes(res, 400, filterResult.message);
  }

  const { productIdSet, queryProductIds } = filterResult;

  const buyerIds = await buildBuyerIdsBySearch(search);
  if (search && buyerIds?.length === 0) {
    return successRes(res, { orders: [], total: 0, page, limit });
  }

  const query = {
    "items.productId": { $in: queryProductIds },
    ...(buyerIds ? { userBuyerId: { $in: buyerIds } } : {}),
  };
  const pendingFirst = !status;
  const { orderIds, total } = await fetchMySalesOrderPageIds({
    query,
    sellerProductIds: queryProductIds,
    pendingFirst,
    skip,
    limit,
  });

  const rawOrdersUnordered =
    orderIds.length === 0
      ? []
      : await OrderModel.find({ _id: { $in: orderIds } })
          .populate("userBuyerId", ORDER_BUYER_PUBLIC_FIELDS)
          .populate(ORDER_ITEMS_POPULATE)
          .populate(ORDER_AFFILIATE_REFERRER_POPULATE)
          .lean();
  const rawOrders = orderRowsByIds(orderIds, rawOrdersUnordered);

  const orders = rawOrders
    .map((order) => {
      normalizeOrderItemsForRuntime(order.items);
      const sellerItems = order.items
        .map((item, itemIndex) => ({ ...item, itemIndex }))
        .filter((item) => {
          if (!item?.productId || typeof item.productId === "string") return false;
          const itemProductIdStr = normalizeId(item.productId._id ?? item.productId);
          if (productIdSet && !productIdSet.has(itemProductIdStr)) return false;
          const itemSellerId = normalizeId(
            item.productId.productSeller?._id ?? item.productId.productSeller,
          );
          const statusMatches = status ? item.status === status : true;
          return itemSellerId === sellerId && statusMatches;
        });

      if (sellerItems.length === 0) return null;

      return {
        ...order,
        items: sellerItems,
        totalAmount: calculateTotalAmount(sellerItems),
        status: buildOrderStatusFromItems(sellerItems),
      };
    })
    .filter(Boolean);

  const contractIds = orders
    .map((order) => order.installmentContractId)
    .filter(Boolean);
  const planSummaryByContractId = await loadInstallmentPlanSummariesByIds(contractIds);

  const ordersWithInstallment = orders.map((order) => {
    const contractId = order.installmentContractId
      ? String(order.installmentContractId)
      : null;
    const installmentContract =
      contractId != null ? (planSummaryByContractId[contractId] ?? null) : null;

    const withPlan = installmentContract ? { ...order, installmentContract } : order;
    return sanitizeOrderForSellerApi(withPlan);
  });

  await attachShipmentCourierInfo(ordersWithInstallment);

  return successRes(res, {
    orders: ordersWithInstallment,
    total,
    page,
    limit,
  });
};
