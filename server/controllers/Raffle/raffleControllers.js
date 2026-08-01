import {
  approveRaffle,
  countPendingRaffles,
  createRaffle,
  deleteMyRaffle,
  deleteRaffleByStaff,
  getFeaturedRaffles,
  getMyRaffleOverview,
  getRaffleById,
  getRaffleCreateAdvertisingStatus,
  getRaffleProducts,
  listPendingRaffles,
  patchMyRaffle,
  patchRaffleByStaff,
  pauseMyRaffle,
  rejectRaffle,
  setProductRaffleParticipation,
  cancelRaffleCreateUnlock,
  unlockRaffleCreate,
} from "../../services/raffle/index.js";
import { successRes } from "../../services/http/index.js";

export const getFeaturedRaffleController = async (req, res) => {
  const { resolveViewerRegionCodeForRequest } =
    await import("../../services/user/userRegionCatalogFilter.js");
  const viewerRegionCode = await resolveViewerRegionCodeForRequest({
    userId: req.userId,
    queryRegionCode: req.query.regionCode,
  });
  const result = await getFeaturedRaffles({ viewerRegionCode });
  return successRes(res, result);
};

export const getRaffleByIdController = async (req, res) => {
  const raffle = await getRaffleById({
    raffleId: req.params.raffleId,
    userId: req.userId,
  });

  return successRes(res, { raffle });
};

export const getRaffleProductsController = async (req, res) => {
  const result = await getRaffleProducts({
    raffleId: req.params.raffleId,
    search: req.query.search,
    query: req.query,
  });

  return successRes(res, result);
};

export const createRaffleController = async (req, res) => {
  const result = await createRaffle({
    sellerId: String(req.userId),
    body: req.body,
  });

  return successRes(res, result, 201);
};

export const getRaffleCreateAdvertisingController = async (req, res) => {
  const result = await getRaffleCreateAdvertisingStatus(String(req.userId));
  return successRes(res, result);
};

export const unlockRaffleCreateController = async (req, res) => {
  const result = await unlockRaffleCreate({ sellerId: String(req.userId) });
  return successRes(res, result);
};

export const cancelRaffleCreateController = async (req, res) => {
  const result = await cancelRaffleCreateUnlock({ sellerId: String(req.userId) });
  return successRes(res, result);
};

export const getMyRaffleController = async (req, res) => {
  const result = await getMyRaffleOverview(String(req.userId));
  return successRes(res, result);
};

export const patchMyRaffleController = async (req, res) => {
  const result = await patchMyRaffle({
    sellerId: String(req.userId),
    raffleId: req.params.raffleId,
    body: req.body,
  });

  return successRes(res, result);
};

export const patchRaffleByStaffController = async (req, res) => {
  const result = await patchRaffleByStaff({
    raffleId: req.params.raffleId,
    body: req.body,
  });

  return successRes(res, result);
};

export const deleteMyRaffleController = async (req, res) => {
  const result = await deleteMyRaffle({
    sellerId: String(req.userId),
    raffleId: req.params.raffleId,
  });

  return successRes(res, result);
};

export const deleteRaffleByStaffController = async (req, res) => {
  const result = await deleteRaffleByStaff({ raffleId: req.params.raffleId });
  return successRes(res, result);
};

export const pauseMyRaffleController = async (req, res) => {
  const result = await pauseMyRaffle({
    sellerId: String(req.userId),
    raffleId: req.params.raffleId,
  });

  return successRes(res, result);
};

export const setProductRaffleParticipationController = async (req, res) => {
  const result = await setProductRaffleParticipation({
    sellerId: String(req.userId),
    productId: req.params.productId,
    enabled: req.body.enabled === true,
  });

  return successRes(res, result);
};

export const getPendingRafflesController = async (req, res) => {
  const raffles = await listPendingRaffles();
  return successRes(res, { raffles });
};

export const getPendingRafflesCountController = async (req, res) => {
  const count = await countPendingRaffles();
  return successRes(res, { count });
};

export const approveRaffleController = async (req, res) => {
  const result = await approveRaffle({
    staffId: String(req.userId),
    raffleId: req.params.raffleId,
  });

  return successRes(res, result);
};

export const rejectRaffleController = async (req, res) => {
  const result = await rejectRaffle({
    raffleId: req.params.raffleId,
    comment: req.body?.comment,
  });

  return successRes(res, result);
};
