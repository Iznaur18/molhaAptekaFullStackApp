import {
  getMyLuckyBoxConfig,
  getSellerLuckyBoxState,
  listMyLuckyBoxWins,
  playSellerLuckyBox,
  putMyLuckyBoxConfig,
} from "../../services/seller-lucky-box/sellerLuckyBox.js";
import { successRes } from "../../services/http/index.js";

export const getSellerLuckyBoxStateController = async (req, res) => {
  const data = await getSellerLuckyBoxState({
    sellerId: String(req.params.sellerId),
    buyerId: req.userId ? String(req.userId) : null,
  });
  return successRes(res, data);
};

export const playSellerLuckyBoxController = async (req, res) => {
  const data = await playSellerLuckyBox({
    sellerId: String(req.params.sellerId),
    buyerId: String(req.userId),
    boxIndex: req.body.boxIndex,
  });
  return successRes(res, data);
};

export const getMyLuckyBoxConfigController = async (req, res) => {
  const data = await getMyLuckyBoxConfig({ sellerId: String(req.userId) });
  return successRes(res, data);
};

export const putMyLuckyBoxConfigController = async (req, res) => {
  const data = await putMyLuckyBoxConfig({
    sellerId: String(req.userId),
    body: req.body,
  });
  return successRes(res, data);
};

export const listMyLuckyBoxWinsController = async (req, res) => {
  const data = await listMyLuckyBoxWins({ buyerId: String(req.userId) });
  return successRes(res, data);
};
