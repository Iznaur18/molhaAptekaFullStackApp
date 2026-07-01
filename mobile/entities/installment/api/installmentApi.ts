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

export type InstallmentPayment = {
  _id?: string | null;
  paymentIndex: number;
  amountRub?: number;
  dueAt?: string;
  status?: string;
  paidAt?: string | null;
  buyerMarkedPaidAt?: string | null;
};

export type InstallmentCounterparty = {
  _id?: string;
  userName?: string;
  email?: string;
  userPhoneNumber?: string;
  isPremiumUser?: boolean;
  isUserDataConfirmed?: boolean;
};

export type InstallmentContract = {
  _id: string;
  productId?: string;
  status?: string;
  planTitle?: string;
  monthsCount?: number;
  monthlyPaymentRub?: number;
  totalAmountRub?: number;
  paidAmountRub?: number;
  productNameAtContract?: string;
  finalDueAt?: string;
  nextPaymentDueAt?: string | null;
  hasOverduePayment?: boolean;
  product?: { _id?: string; productName?: string };
  buyer?: InstallmentCounterparty;
  seller?: InstallmentCounterparty;
  payments?: InstallmentPayment[];
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
    return data.data as { contract?: InstallmentContract };
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
    return data.data as { contract?: InstallmentContract };
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
    return data.data as { contract?: InstallmentContract };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось отклонить оплату"));
  }
};

export const markInstallmentEarlyPayoff = async (contractId: string) => {
  try {
    const { data } = await apiClient.patch(`/installment/contracts/${contractId}/pay-early`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { contract?: InstallmentContract };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось оформить досрочное погашение"));
  }
};

export const confirmInstallmentEarlyPayoff = async (contractId: string) => {
  try {
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/pay-early/confirm`,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { contract?: InstallmentContract };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось подтвердить досрочное погашение"));
  }
};

export const cancelInstallmentEarlyPayoff = async (contractId: string) => {
  try {
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/pay-early/cancel`,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { contract?: InstallmentContract };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось отменить досрочное погашение"));
  }
};

export const rejectInstallmentEarlyPayoff = async (contractId: string) => {
  try {
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/pay-early/reject`,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { contract?: InstallmentContract };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось отклонить досрочное погашение"));
  }
};

export const openInstallmentDispute = async (contractId: string, reason: string) => {
  try {
    const { data } = await apiClient.post(`/installment/contracts/${contractId}/dispute`, {
      reason,
    });
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { contract?: InstallmentContract };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось открыть спор"));
  }
};
