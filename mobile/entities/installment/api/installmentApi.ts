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
  buyerPassportShare?: {
    passport?: Record<string, unknown>;
    passportSelfiePhotoUrl?: string;
    consentAt?: string | null;
  } | null;
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

export type UpsertInstallmentProgramBody = {
  isEnabled: boolean;
  plans: Array<{
    title: string;
    monthsCount: number;
    monthlyAmountRub: number;
    firstPaymentRequiredNow?: boolean;
  }>;
};

export const upsertProductInstallmentProgram = async (
  productId: string,
  body: UpsertInstallmentProgramBody,
) => {
  try {
    const { data } = await apiClient.put(`/product/${productId}/installment-program`, body);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { message?: string; product?: Record<string, unknown> };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.UPSERT_INSTALLMENT_PROGRAM_FALLBACK));
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
    passportShareConsent: true;
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
      params: {
        page: 1,
        limit: 100,
        ...(status ? { status } : {}),
      },
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
      params: {
        page: 1,
        limit: 100,
        ...(status ? { status } : {}),
      },
    });
    if (!data?.success || !Array.isArray(data.data?.contracts)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.contracts as InstallmentContract[];
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, "Не удалось загрузить продажи в рассрочку"),
    );
  }
};

export const markInstallmentPaymentPaid = async (
  contractId: string,
  paymentIndex: number,
  idempotencyKey?: string,
) => {
  try {
    const body: { idempotencyKey?: string } = {};
    if (idempotencyKey) {
      body.idempotencyKey = idempotencyKey;
    }
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/payments/${paymentIndex}/mark-paid`,
      body,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { contract?: InstallmentContract };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось отметить оплату"));
  }
};

export const confirmInstallmentPayment = async (
  contractId: string,
  paymentIndex: number,
  idempotencyKey?: string,
) => {
  try {
    const body: { idempotencyKey?: string } = {};
    if (idempotencyKey) {
      body.idempotencyKey = idempotencyKey;
    }
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/payments/${paymentIndex}/confirm`,
      body,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { contract?: InstallmentContract };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось подтвердить оплату"));
  }
};

export const rejectInstallmentPayment = async (
  contractId: string,
  paymentIndex: number,
  idempotencyKey?: string,
) => {
  try {
    const body: { idempotencyKey?: string } = {};
    if (idempotencyKey) {
      body.idempotencyKey = idempotencyKey;
    }
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/payments/${paymentIndex}/reject`,
      body,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { contract?: InstallmentContract };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось отклонить оплату"));
  }
};

export const markInstallmentEarlyPayoff = async (
  contractId: string,
  idempotencyKey?: string,
) => {
  try {
    const body: { idempotencyKey?: string } = {};
    if (idempotencyKey) {
      body.idempotencyKey = idempotencyKey;
    }
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/pay-early`,
      body,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { contract?: InstallmentContract };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось оформить досрочное погашение"));
  }
};

export const confirmInstallmentEarlyPayoff = async (
  contractId: string,
  idempotencyKey?: string,
) => {
  try {
    const body: { idempotencyKey?: string } = {};
    if (idempotencyKey) {
      body.idempotencyKey = idempotencyKey;
    }
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/pay-early/confirm`,
      body,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { contract?: InstallmentContract };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось подтвердить досрочное погашение"));
  }
};

export const cancelInstallmentEarlyPayoff = async (
  contractId: string,
  idempotencyKey?: string,
) => {
  try {
    const body: { idempotencyKey?: string } = {};
    if (idempotencyKey) {
      body.idempotencyKey = idempotencyKey;
    }
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/pay-early/cancel`,
      body,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data as { contract?: InstallmentContract };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось отменить досрочное погашение"));
  }
};

export const rejectInstallmentEarlyPayoff = async (
  contractId: string,
  idempotencyKey?: string,
) => {
  try {
    const body: { idempotencyKey?: string } = {};
    if (idempotencyKey) {
      body.idempotencyKey = idempotencyKey;
    }
    const { data } = await apiClient.patch(
      `/installment/contracts/${contractId}/pay-early/reject`,
      body,
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
