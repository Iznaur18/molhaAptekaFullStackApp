import {
  dealRequestDataSchema,
  dealRequestSellerContactDataSchema,
  myDealRequestsDataSchema,
} from "@molha/api-contract";
import type { z } from "zod";

import { apiClient, parseApiContractData } from "@/shared/api";
import { DEAL_REQUESTS_PAGE_UI, PRODUCT_DEAL_ACTIONS_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type DealRequest = z.infer<typeof dealRequestDataSchema>["request"];
export type MyDealRequestsPage = z.infer<typeof myDealRequestsDataSchema>;
export type DealRequestRole = DealRequest["role"];

/** `GET /deal-requests/me` — заявки, где я покупатель или продавец. */
export const fetchMyDealRequests = async ({
  role,
  page,
  limit,
}: {
  role: DealRequestRole;
  page: number;
  limit: number;
}): Promise<MyDealRequestsPage> => {
  try {
    const { data } = await apiClient.get("/deal-requests/me", {
      params: { role, page, limit },
    });
    return parseApiContractData(data, myDealRequestsDataSchema);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, DEAL_REQUESTS_PAGE_UI.LOAD_FALLBACK_ERROR),
    );
  }
};

export type CreateDealRequestBody = {
  productId: string;
  preferredAt: string;
  comment?: string;
  address?: string;
};

/** `POST /deal-requests` — заявка на осмотр или услугу из объявления. */
export const createDealRequest = async (
  body: CreateDealRequestBody,
): Promise<DealRequest> => {
  try {
    const { data } = await apiClient.post("/deal-requests", body);
    return parseApiContractData(data, dealRequestDataSchema).request;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, PRODUCT_DEAL_ACTIONS_UI.SUBMIT_FALLBACK_ERROR),
    );
  }
};

export type DealRequestActionParams = {
  requestId: string;
  /** accept, decline, cancel, confirm или outcome. */
  action: string;
  body?: Record<string, unknown>;
};

/** `POST /deal-requests/:id/:action` — любое действие над заявкой. */
export const postDealRequestAction = async ({
  requestId,
  action,
  body = {},
}: DealRequestActionParams): Promise<DealRequest> => {
  try {
    const { data } = await apiClient.post(
      `/deal-requests/${encodeURIComponent(requestId)}/${action}`,
      body,
    );
    return parseApiContractData(data, dealRequestDataSchema).request;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, DEAL_REQUESTS_PAGE_UI.ACTION_FALLBACK_ERROR),
    );
  }
};

/** `GET /deal-requests/seller-contact/:productId` — телефон продавца у осмотра. */
export const fetchDealRequestSellerPhone = async (
  productId: string,
): Promise<string | null> => {
  try {
    const { data } = await apiClient.get(
      `/deal-requests/seller-contact/${encodeURIComponent(productId)}`,
    );
    return parseApiContractData(data, dealRequestSellerContactDataSchema).phone;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, PRODUCT_DEAL_ACTIONS_UI.PHONE_FALLBACK_ERROR),
    );
  }
};
