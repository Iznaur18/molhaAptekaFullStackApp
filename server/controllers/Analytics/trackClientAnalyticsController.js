import { ANALYTICS_CLIENT_EVENT_CHECKOUT_STARTED } from "@molha/api-contract";

import { emitCheckoutStartedEvent } from "../../services/analytics-events/index.js";
import { successRes } from "../../services/http/index.js";

/** POST /analytics/track — события воронки, которые видит только клиент. */
export async function trackClientAnalyticsController(req, res) {
  const { kind, platform } = req.body;
  if (kind === ANALYTICS_CLIENT_EVENT_CHECKOUT_STARTED) {
    emitCheckoutStartedEvent({ userId: String(req.userId), platform });
  }
  successRes(res, { ok: true });
}
