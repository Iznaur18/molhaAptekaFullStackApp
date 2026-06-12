import {
  authMeDataSchema,
  authSessionDataSchema,
  catalogProductsPageDataSchema,
  createOrderDataSchema,
  orderFromApiSchema,
  parseApiSuccess,
  productFromApiSchema,
  replaceCartDataSchema,
  userPublicProfileSchema,
} from "@molha/api-contract";
import { z } from "zod";
import type { z as zod } from "zod";

import { API_CLIENT_UI } from "@/shared/config";

const toContractClientError = (error: unknown): Error => {
  if (error instanceof Error && error.message === "INVALID_API_ENVELOPE") {
    return new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
  }
  if (error instanceof Error && error.message === "INVALID_API_DATA") {
    return new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
  }
  return error instanceof Error ? error : new Error(String(error));
};

export const parseApiContractData = <T extends zod.ZodTypeAny>(
  payload: unknown,
  dataSchema: T,
): zod.infer<T> => {
  try {
    return parseApiSuccess(payload, dataSchema);
  } catch (error) {
    throw toContractClientError(error);
  }
};

export const parseAuthMeData = (payload: unknown) =>
  parseApiContractData(payload, authMeDataSchema);

export const parseAuthSessionData = (payload: unknown) =>
  parseApiContractData(payload, authSessionDataSchema);

const catalogProductDataSchema = z.object({
  product: productFromApiSchema,
});

export const parseCatalogProductsPageData = (payload: unknown) =>
  parseApiContractData(payload, catalogProductsPageDataSchema);

export const parseCatalogProductByIdData = (payload: unknown) =>
  parseApiContractData(payload, catalogProductDataSchema).product;

export const parseMyCartData = (payload: unknown) =>
  parseApiContractData(payload, replaceCartDataSchema);

export const parseReplaceCartData = (payload: unknown) =>
  parseApiContractData(payload, replaceCartDataSchema);

export const parseCreateOrderData = (payload: unknown) =>
  parseApiContractData(payload, createOrderDataSchema);

const myOrdersDataSchema = z.object({
  orders: z.array(orderFromApiSchema),
});

export const parseMyOrdersData = (payload: unknown) =>
  parseApiContractData(payload, myOrdersDataSchema).orders;

const categoryChildrenDataSchema = z.object({
  parent: z.object({ _id: z.string(), name: z.string().optional() }).passthrough(),
  categories: z
    .array(z.object({ _id: z.string(), name: z.string().optional() }).passthrough())
    .optional()
    .default([]),
});

export const parseCategoryChildrenData = (payload: unknown) =>
  parseApiContractData(payload, categoryChildrenDataSchema);

const addressSuggestionSchema = z.object({
  value: z.string(),
  unrestrictedValue: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

const addressSuggestionsDataSchema = z.object({
  suggestions: z.array(addressSuggestionSchema),
});

export const parseAddressSuggestionsData = (payload: unknown) =>
  parseApiContractData(payload, addressSuggestionsDataSchema).suggestions;

const categoryDisplaySchema = z
  .object({
    categorySlug: z.string().nullable().optional(),
    categoryId: z.string().nullable().optional(),
    customLabel: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
  })
  .passthrough();

const categoryDisplaysDataSchema = z.object({
  displays: z.array(categoryDisplaySchema),
});

export const parseCategoryDisplaysData = (payload: unknown) =>
  parseApiContractData(payload, categoryDisplaysDataSchema).displays;

const updateOrderItemDataSchema = z.object({
  order: orderFromApiSchema,
});

export const parseUpdateOrderItemData = (payload: unknown) =>
  parseApiContractData(payload, updateOrderItemDataSchema).order;

const confirmOrderItemDataSchema = z.object({
  order: orderFromApiSchema,
  pointsEarned: z.number().optional(),
});

export const parseConfirmOrderItemData = (payload: unknown) =>
  parseApiContractData(payload, confirmOrderItemDataSchema);

const productReportStatusDataSchema = z.object({
  hasPendingReport: z.boolean(),
});

export const parseProductReportStatusData = (payload: unknown) =>
  parseApiContractData(payload, productReportStatusDataSchema);

const patchUserProfileEnvelopeSchema = z.object({
  user: userPublicProfileSchema,
});

const uploadImageDataSchema = z.object({
  url: z.string(),
  filename: z.string().optional(),
  originalname: z.string().optional(),
});

export const parseUploadImageData = (payload: unknown) =>
  parseApiContractData(payload, uploadImageDataSchema);

export const parsePatchUserProfileData = (payload: unknown) => {
  try {
    const envelope = parseApiSuccess(payload, patchUserProfileEnvelopeSchema);
    return envelope.user;
  } catch {
    return parseApiContractData(payload, userPublicProfileSchema);
  }
};
