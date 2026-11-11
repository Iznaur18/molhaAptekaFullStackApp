import {
  getMyFortuneWheelConfig,
  getSellerFortuneWheelState,
  listMyFortuneWheelWins,
  putMyFortuneWheelConfig,
  spinSellerFortuneWheel,
} from "../../services/seller-fortune-wheel/sellerFortuneWheel.js";
import { successRes } from "../../services/http/index.js";

export const getSellerFortuneWheelStateController = async (req, res) => {
  const data = await getSellerFortuneWheelState({
    sellerId: String(req.params.sellerId),
    buyerId: req.userId ? String(req.userId) : null,
  });
  return successRes(res, data);
};

export const spinSellerFortuneWheelController = async (req, res) => {
  const data = await spinSellerFortuneWheel({
    sellerId: String(req.params.sellerId),
    buyerId: String(req.userId),
  });
  return successRes(res, data);
};

export const getMyFortuneWheelConfigController = async (req, res) => {
  const data = await getMyFortuneWheelConfig({ sellerId: String(req.userId) });
  return successRes(res, data);
};

export const putMyFortuneWheelConfigController = async (req, res) => {
  const data = await putMyFortuneWheelConfig({
    sellerId: String(req.userId),
    body: req.body,
  });
  return successRes(res, data);
};

export const listMyFortuneWheelWinsController = async (req, res) => {
  const data = await listMyFortuneWheelWins({ buyerId: String(req.userId) });
  return successRes(res, data);
};
