import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { reportClientIssue } from "@/shared/lib/reportClientIssue";

const PENDING_PAYMENT_STORAGE_KEY = "gitorg_pending_payment_id_v1";

const USE_WEB_STORAGE = Platform.OS === "web";

const webStorage = (): Storage | null => {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null;
  }
};

/** Id платежа, с которым пользователь ушёл на форму оплаты. */
export async function rememberPendingPaymentId(paymentId: string): Promise<void> {
  try {
    const value = String(paymentId);
    if (USE_WEB_STORAGE) {
      webStorage()?.setItem(PENDING_PAYMENT_STORAGE_KEY, value);
    } else {
      await SecureStore.setItemAsync(PENDING_PAYMENT_STORAGE_KEY, value);
    }
  } catch (error) {
    reportClientIssue("pendingPaymentStorage#1", error);
  }
}

export async function readPendingPaymentId(): Promise<string> {
  try {
    const raw = USE_WEB_STORAGE
      ? webStorage()?.getItem(PENDING_PAYMENT_STORAGE_KEY)
      : await SecureStore.getItemAsync(PENDING_PAYMENT_STORAGE_KEY);
    return raw?.trim() ? String(raw).trim() : "";
  } catch {
    return "";
  }
}

export async function forgetPendingPaymentId(): Promise<void> {
  try {
    if (USE_WEB_STORAGE) {
      webStorage()?.removeItem(PENDING_PAYMENT_STORAGE_KEY);
    } else {
      await SecureStore.deleteItemAsync(PENDING_PAYMENT_STORAGE_KEY);
    }
  } catch (error) {
    reportClientIssue("pendingPaymentStorage#2", error);
  }
}
