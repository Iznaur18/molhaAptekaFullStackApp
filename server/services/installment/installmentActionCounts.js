import {
  countInstallmentBuyerActionItems,
  countInstallmentSellerActionItems,
} from "./installmentHelpers.js";

/**
 * @param {string} userId
 */
export async function getInstallmentBuyerActionCount(userId) {
  return countInstallmentBuyerActionItems(userId);
}

/**
 * @param {string} userId
 */
export async function getInstallmentSellerActionCount(userId) {
  return countInstallmentSellerActionItems(userId);
}
