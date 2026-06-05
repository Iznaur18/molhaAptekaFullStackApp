import {
  parseApiSuccess,
  authMeDataSchema,
  catalogProductsPageDataSchema,
  createOrderDataSchema,
  productWriteDataSchema,
  replaceCartDataSchema,
  userSellerProductsPageDataSchema,
} from "@molha/api-contract";

import { API_CLIENT_UI } from "../config/appUiCopy.js";

/**
 * @param {unknown} error
 */
function toContractClientError(error) {
  if (error instanceof Error && error.message === "INVALID_API_ENVELOPE") {
    return new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
  }
  if (error instanceof Error && error.message === "INVALID_API_DATA") {
    return new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
  }
  return error instanceof Error ? error : new Error(String(error));
}

/**
 * @template {import('zod').ZodTypeAny} TSchema
 * @param {unknown} payload
 * @param {TSchema} dataSchema
 */
export function parseApiContractData(payload, dataSchema) {
  try {
    return parseApiSuccess(payload, dataSchema);
  } catch (e) {
    throw toContractClientError(e);
  }
}

/**
 * @param {unknown} payload
 * @returns {import('@molha/api-contract/types').CatalogProductsPageDataContract}
 */
export function parseCatalogProductsPageData(payload) {
  return parseApiContractData(payload, catalogProductsPageDataSchema);
}

/**
 * @param {unknown} payload
 * @returns {import('@molha/api-contract/types').UserSellerProductsPageDataContract}
 */
export function parseUserSellerProductsPageData(payload) {
  return parseApiContractData(payload, userSellerProductsPageDataSchema);
}

/**
 * @param {unknown} payload
 * @returns {import('@molha/api-contract/types').AuthMeDataContract}
 */
export function parseAuthMeData(payload) {
  return parseApiContractData(payload, authMeDataSchema);
}

/**
 * @param {unknown} payload
 * @returns {import('@molha/api-contract/types').ReplaceCartDataContract}
 */
export function parseReplaceCartData(payload) {
  return parseApiContractData(payload, replaceCartDataSchema);
}

/**
 * @param {unknown} payload
 * @returns {import('@molha/api-contract/types').CreateOrderDataContract}
 */
export function parseCreateOrderData(payload) {
  return parseApiContractData(payload, createOrderDataSchema);
}

/**
 * @param {unknown} payload
 * @returns {import('@molha/api-contract/types').ProductWriteDataContract}
 */
export function parseCreateProductData(payload) {
  return parseApiContractData(payload, productWriteDataSchema);
}

/**
 * @param {unknown} payload
 * @returns {import('@molha/api-contract/types').ProductWriteDataContract}
 */
export function parsePatchMyProductData(payload) {
  return parseApiContractData(payload, productWriteDataSchema);
}
