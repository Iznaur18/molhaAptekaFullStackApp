import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type InstallmentPlan = {
  _id: string;
  title?: string;
  monthsCount?: number;
  monthlyAmountRub?: number;
  firstPaymentRequiredNow?: boolean;
};

export type InstallmentProgram = {
  _id?: string;
  isEnabled?: boolean;
  moderationStatus?: string;
  plans: InstallmentPlan[];
};

export type InstallmentContract = {
  _id: string;
  status?: string;
  totalAmountRub?: number;
  paidAmountRub?: number;
  product?: { _id?: string; productName?: string };
  buyer?: { _id?: string; userName?: string };
  seller?: { _id?: string; userName?: string };
  payments?: Array<{
    index?: number;
    status?: string;
    amountRub?: number;
    dueAt?: string;
  }>;
};

export const fetchProductInstallmentProgram = async (productId: string) => {
  try {
    const { data } = await apiClient.get(`/product/${productId}/installment-program`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return (data.data?.program ?? null) as InstallmentProgram | null;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось загрузить рассрочку"));
  }
};

export const createInstallmentContract = async (
  productId: string,
  body: {
    planId: string;
    quantity: number;
    deliveryAddress: string;
    deliveryAddressFlat?: string;
    paymentMethod: string;
  },
) => {
  try {
    const { data } = await apiClient.post(`/product/${productId}/installment-contracts`, body);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось оформить рассрочку"));
  }
};

export const fetchMyInstallmentContracts = async (status?: string) => {
  try {
    const { data } = await apiClient.get("/installment/contracts/my", {
      params: status ? { status } : undefined,
    });
    if (!data?.success || !Array.isArray(data.data?.contracts)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.contracts as InstallmentContract[];
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось загрузить рассрочки"));
  }
};

export const fetchMyInstallmentSales = async (status?: string) => {
  try {
    const { data } = await apiClient.get("/installment/contracts/sales", {
      params: status ? { status } : undefined,
    });
    if (!data?.success || !Array.isArray(data.data?.contracts)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.contracts as InstallmentContract[];
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось загрузить продажи в рассрочку"));
  }
};

export const markInstallmentPaymentPaid = async (contractId: string, paymentIndex: number) => {
  try {
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/payments/${paymentIndex}/mark-paid`,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось отметить оплату"));
  }
};

export const confirmInstallmentPayment = async (contractId: string, paymentIndex: number) => {
  try {
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/payments/${paymentIndex}/confirm`,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось подтвердить оплату"));
  }
};

export const rejectInstallmentPayment = async (contractId: string, paymentIndex: number) => {
  try {
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/payments/${paymentIndex}/reject`,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось отклонить оплату"));
  }
};
