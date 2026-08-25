import { emitAdEvent } from "../../services/analytics-events/index.js";
import { successRes } from "../../services/http/index.js";

/** POST /analytics/track-ad — impression/click (auth optional). */
export async function trackAdAnalyticsController(req, res) {
  const { kind, surface, subjectId, campaignId } = req.body;
  emitAdEvent({
    kind,
    surface,
    subjectId,
    campaignId: campaignId ?? null,
    actorUserId: req.userId ? String(req.userId) : null,
  });
  successRes(res, { ok: true });
}
