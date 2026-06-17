import {
  parseApiContractData as parseSharedApiContractData,
  parseAuthMeData as parseSharedAuthMeData,
  parseCatalogProductsPageData as parseSharedCatalogProductsPageData,
  parseCreateOrderData as parseSharedCreateOrderData,
  parseCreateProductData as parseSharedCreateProductData,
  parsePatchMyProductData as parseSharedPatchMyProductData,
  parseReplaceCartData as parseSharedReplaceCartData,
  parseUserSellerProductsPageData as parseSharedUserSellerProductsPageData,
} from "@izibuy/shared-api";

import { API_CLIENT_UI } from "../config/appUiCopy.js";

/**
 * @template {import('zod').ZodTypeAny} TSchema
 * @param {unknown} payload
 * @param {TSchema} dataSchema
 */
export function parseApiContractData(payload, dataSchema) {
  return parseSharedApiContractData(
    payload,
    dataSchema,
    API_CLIENT_UI.INVALID_SERVER_RESPONSE,
  );
}

/**
 * @param {unknown} payload
 * @returns {import('@molha/api-contract/types').CatalogProductsPageDataContract}
 */
export function parseCatalogProductsPageData(payload) {
  return parseSharedCatalogProductsPageData(
    payload,
    API_CLIENT_UI.INVALID_SERVER_RESPONSE,
  );
}

/**
 * @param {unknown} payload
 * @returns {import('@molha/api-contract/types').UserSellerProductsPageDataContract}
 */
export function parseUserSellerProductsPageData(payload) {
  return parseSharedUserSellerProductsPageData(
    payload,
    API_CLIENT_UI.INVALID_SERVER_RESPONSE,
  );
}

/**
 * @param {unknown} payload
 * @returns {import('@molha/api-contract/types').AuthMeDataContract}
 */
export function parseAuthMeData(payload) {
  return parseSharedAuthMeData(payload, API_CLIENT_UI.INVALID_SERVER_RESPONSE);
}

/**
 * @param {unknown} payload
 * @returns {import('@molha/api-contract/types').ReplaceCartDataContract}
 */
export function parseReplaceCartData(payload) {
  return parseSharedReplaceCartData(payload, API_CLIENT_UI.INVALID_SERVER_RESPONSE);
}

/**
 * @param {unknown} payload
 * @returns {import('@molha/api-contract/types').CreateOrderDataContract}
 */
export function parseCreateOrderData(payload) {
  return parseSharedCreateOrderData(payload, API_CLIENT_UI.INVALID_SERVER_RESPONSE);
}

/**
 * @param {unknown} payload
 * @returns {import('@molha/api-contract/types').ProductWriteDataContract}
 */
export function parseCreateProductData(payload) {
  return parseSharedCreateProductData(payload, API_CLIENT_UI.INVALID_SERVER_RESPONSE);
}

/**
 * @param {unknown} payload
 * @returns {import('@molha/api-contract/types').ProductWriteDataContract}
 */
export function parsePatchMyProductData(payload) {
  return parseSharedPatchMyProductData(
    payload,
    API_CLIENT_UI.INVALID_SERVER_RESPONSE,
  );
}
