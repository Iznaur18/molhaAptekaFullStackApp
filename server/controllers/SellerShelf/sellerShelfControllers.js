import {
  createSellerShelf,
  deleteSellerShelf,
  listMySellerShelves,
  listPublicSellerShelves,
  patchSellerShelf,
  reorderSellerShelves,
  setSellerShelfProducts,
} from "../../services/seller-shelf/sellerShelf.js";
import { successRes } from "../../services/http/index.js";

export const listMySellerShelvesController = async (req, res) => {
  const data = await listMySellerShelves({ userId: String(req.userId) });
  return successRes(res, data);
};

export const listPublicSellerShelvesController = async (req, res) => {
  const data = await listPublicSellerShelves({
    sellerId: String(req.params.sellerId),
  });
  return successRes(res, data);
};

export const createSellerShelfController = async (req, res) => {
  const data = await createSellerShelf({
    userId: String(req.userId),
    name: req.body.name,
  });
  return successRes(res, data);
};

export const patchSellerShelfController = async (req, res) => {
  const data = await patchSellerShelf({
    userId: String(req.userId),
    shelfId: String(req.params.shelfId),
    name: req.body.name,
    sortOrder: req.body.sortOrder,
  });
  return successRes(res, data);
};

export const reorderSellerShelvesController = async (req, res) => {
  const data = await reorderSellerShelves({
    userId: String(req.userId),
    orderedShelfIds: req.body.orderedShelfIds,
  });
  return successRes(res, data);
};

export const deleteSellerShelfController = async (req, res) => {
  const data = await deleteSellerShelf({
    userId: String(req.userId),
    shelfId: String(req.params.shelfId),
  });
  return successRes(res, data);
};

export const setSellerShelfProductsController = async (req, res) => {
  const data = await setSellerShelfProducts({
    userId: String(req.userId),
    shelfId: String(req.params.shelfId),
    productIds: req.body.productIds ?? [],
  });
  return successRes(res, data);
};
