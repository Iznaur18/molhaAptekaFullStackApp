import { apiClient } from "../../../shared/api/apiClient.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

export async function fetchStaffBroadcastRecipientsCount() {
  try {
    const { data } = await apiClient.get("/staff/broadcast-notifications/recipients-count");
    const count = data?.data?.count;
    if (!data?.success || typeof count !== "number") {
      throw new Error("Не удалось получить число получателей");
    }
    return count;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, "Не удалось получить число получателей"),
    );
  }
}

/**
 * @param {{ title: string; message: string }} body
 */
export async function postStaffBroadcastNotification(body) {
  try {
    const { data } = await apiClient.post("/staff/broadcast-notifications", body);
    const sent = data?.data?.sent;
    if (!data?.success || typeof sent !== "number") {
      throw new Error("Не удалось отправить уведомление");
    }
    return { sent };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось отправить уведомление"));
  }
}
