import {
  authMeDataSchema,
  catalogProductsPageDataSchema,
  myIntroAdCampaignDataSchema,
  mySellerPersonalCategoryCampaignDataSchema,
  orderFromApiSchema,
  parseApiSuccess,
  productFromApiSchema,
  userPublicProfileSchema,
} from "@molha/api-contract";
import {
  parseApiContractData as parseSharedApiContractData,
  parseAuthMeData as parseSharedAuthMeData,
  parseAuthSessionData as parseSharedAuthSessionData,
  parseCatalogProductsPageData as parseSharedCatalogProductsPageData,
  parseCreateOrderData as parseSharedCreateOrderData,
  parseCreateProductData as parseSharedCreateProductData,
  parsePatchMyProductData as parseSharedPatchMyProductData,
  parseReplaceCartData as parseSharedReplaceCartData,
  parseUserSellerProductsPageData as parseSharedUserSellerProductsPageData,
} from "@izibuy/shared-api";
import { z } from "zod";
import type { z as zod } from "zod";

import { API_CLIENT_UI } from "@/shared/config";

export const parseApiContractData = <T extends zod.ZodTypeAny>(
  payload: unknown,
  dataSchema: T,
): zod.infer<T> => {
  return parseSharedApiContractData(
    payload,
    dataSchema,
    API_CLIENT_UI.INVALID_SERVER_RESPONSE,
  );
};

export const parseAuthMeData = (payload: unknown) =>
  parseSharedAuthMeData(payload, API_CLIENT_UI.INVALID_SERVER_RESPONSE);

export const parseAuthSessionData = (payload: unknown) => {
  const session = parseSharedAuthSessionData(
    payload,
    API_CLIENT_UI.INVALID_SERVER_RESPONSE,
  );
  // Expo web: cookies, токены в JSON могут отсутствовать.
  return session;
};

const catalogProductDataSchema = z.object({
  product: productFromApiSchema,
});

export const parseCatalogProductsPageData = (payload: unknown) =>
  parseSharedCatalogProductsPageData(payload, API_CLIENT_UI.INVALID_SERVER_RESPONSE);

export const parseCatalogProductByIdData = (payload: unknown) =>
  parseApiContractData(payload, catalogProductDataSchema).product;

export const parseMyCartData = (payload: unknown) =>
  parseSharedReplaceCartData(payload, API_CLIENT_UI.INVALID_SERVER_RESPONSE);

export const parseReplaceCartData = (payload: unknown) =>
  parseSharedReplaceCartData(payload, API_CLIENT_UI.INVALID_SERVER_RESPONSE);

export const parseCreateOrderData = (payload: unknown) =>
  parseSharedCreateOrderData(payload, API_CLIENT_UI.INVALID_SERVER_RESPONSE);

const myOrdersDataSchema = z.object({
  orders: z.array(orderFromApiSchema),
});

export const parseMyOrdersData = (payload: unknown) =>
  parseApiContractData(payload, myOrdersDataSchema).orders;

const productCategoryPublicNodeSchema = z
  .object({
    id: z.string().optional(),
    _id: z.string().optional(),
    slug: z.string().optional(),
    labelRu: z.string().optional(),
    name: z.string().optional(),
    parentId: z.string().nullable().optional(),
    depth: z.number().optional(),
    pathSlugs: z.array(z.string()).optional(),
    pathLabelRu: z.array(z.string()).optional(),
    isLeaf: z.boolean().optional(),
    legacyProductCategory: z.string().nullable().optional(),
    searchKeywords: z.array(z.string()).optional(),
  })
  .passthrough()
  .refine((node) => Boolean(node.id || node._id), {
    message: "category id is required",
    path: ["id"],
  });

const categoryChildrenDataSchema = z.object({
  parent: productCategoryPublicNodeSchema,
  categories: z.array(productCategoryPublicNodeSchema).optional().default([]),
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

export const parseCreateProductData = (payload: unknown) =>
  parseSharedCreateProductData(payload, API_CLIENT_UI.INVALID_SERVER_RESPONSE);

export const parsePatchMyProductData = (payload: unknown) =>
  parseSharedPatchMyProductData(payload, API_CLIENT_UI.INVALID_SERVER_RESPONSE);

const mySalesDataSchema = z.object({
  orders: z.array(orderFromApiSchema),
  total: z.number().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export const parseMySalesData = (payload: unknown) =>
  parseApiContractData(payload, mySalesDataSchema);

const categoryRootsDataSchema = z.object({
  categories: z.array(productCategoryPublicNodeSchema).default([]),
});

export const parseCategoryRootsData = (payload: unknown) =>
  parseApiContractData(payload, categoryRootsDataSchema);

export const parseMyIntroAdCampaignData = (payload: unknown) =>
  parseApiContractData(payload, myIntroAdCampaignDataSchema);

export const parseMySellerPersonalCategoryCampaignData = (payload: unknown) =>
  parseApiContractData(payload, mySellerPersonalCategoryCampaignDataSchema);

const userProfileEnvelopeSchema = z.object({
  user: userPublicProfileSchema,
});

export const parseUserProfileByIdData = (payload: unknown) =>
  parseApiContractData(payload, userProfileEnvelopeSchema).user;

export const parseUserSellerProductsPageData = (payload: unknown) =>
  parseSharedUserSellerProductsPageData(
    payload,
    API_CLIENT_UI.INVALID_SERVER_RESPONSE,
  );
