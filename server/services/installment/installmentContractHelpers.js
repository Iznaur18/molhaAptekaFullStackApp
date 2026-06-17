import mongoose from "mongoose";

import { AppError } from "../../errors/AppError.js";
import { InstallmentContractModel, UserModel } from "../../models/index.js";
import { isUserAdmin } from "../access/adminUserGuard.js";
import { repairInstallmentPaymentStatusDrift } from "./installmentHelpers.js";

import { ACTIVE_INSTALLMENT_CONTRACT_STATUSES } from "./installmentContractConstants.js";

/**
 * @param {import('mongoose').Document} contract
 * @param {number | string} paymentIndex
 */
export const findContractPayment = (contract, paymentIndex) =>
  contract.payments.find((row) => row.paymentIndex === Number(paymentIndex));

/**
 * @param {string} userId
 * @param {import('mongoose').Types.ObjectId} orderId
 * @param {import('mongoose').ClientSession} session
 */
export const appendOrderToUserBuyList = async (userId, orderId, session) => {
  const user = await UserModel.findById(userId).session(session);
  if (!user) {
    return false;
  }

  const safeBuyList = Array.isArray(user.buyList)
    ? user.buyList.filter((id) => mongoose.isValidObjectId(id))
    : [];

  user.buyList = [...safeBuyList, orderId];
  await user.save({ validateBeforeSave: false, session });
  return true;
};

/**
 * @param {string} contractId
 */
export const loadInstallmentContractOrThrow = async (contractId) => {
  const contract = await InstallmentContractModel.findById(contractId);
  if (!contract) {
    throw new AppError(404, "Контракт не найден");
  }

  await repairInstallmentPaymentStatusDrift(contract);
  return contract;
};

/**
 * @param {import('mongoose').Document} contract
 */
export const assertActiveInstallmentContract = (contract) => {
  if (!ACTIVE_INSTALLMENT_CONTRACT_STATUSES.includes(contract.status)) {
    throw new AppError(409, "Контракт не активен");
  }
};

/**
 * @param {string} userId
 * @param {import('mongoose').Document} contract
 */
export const assertInstallmentBuyer = (userId, contract) => {
  if (String(contract.buyerUserId) !== String(userId)) {
    throw new AppError(403, "Нет прав");
  }
};

/**
 * @param {string} userId
 * @param {import('mongoose').Document} contract
 */
export const assertInstallmentSellerOrAdmin = async (userId, contract) => {
  const isSeller = String(contract.sellerUserId) === String(userId);
  const isAdmin = await isUserAdmin(userId);
  if (!isSeller && !isAdmin) {
    throw new AppError(403, "Нет прав");
  }
};

/**
 * @param {string} userId
 * @param {import('mongoose').Document} contract
 */
export const assertInstallmentParticipant = (userId, contract) => {
  const isBuyer = String(contract.buyerUserId) === String(userId);
  const isSeller = String(contract.sellerUserId) === String(userId);
  if (!isBuyer && !isSeller) {
    throw new AppError(403, "Нет прав");
  }
};
