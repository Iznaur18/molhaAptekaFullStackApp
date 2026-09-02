import FaqItemLinkModel from "../../models/FaqItemLinkModel.js";
import { successRes } from "../../services/http/index.js";

/**
 * @param {import('mongoose').Document | Record<string, unknown> | null | undefined} row
 */
const toFaqItemLinkPayload = (row) => ({
  itemId: String(row?.itemId ?? ""),
  href:
    typeof row?.href === "string" && row.href.trim() ? row.href.trim() : null,
  updatedAt: row?.updatedAt ?? null,
});

/** GET /faq/item-links */
export async function getFaqItemLinksController(_req, res) {
  const rows = await FaqItemLinkModel.find({ href: { $ne: null } }).lean();
  successRes(res, {
    links: rows.map(toFaqItemLinkPayload).filter((row) => row.href),
  });
}

/** PATCH /faq/item-links/:itemId — только admin. */
export async function patchFaqItemLinkController(req, res) {
  const itemId = String(req.params.itemId ?? "").trim();
  const { href, resetHref } = req.body ?? {};

  /** @type {Record<string, unknown>} */
  const update = {
    updatedBy: req.userId,
  };

  if (resetHref === true) {
    update.href = null;
  } else if (href !== undefined) {
    update.href =
      href == null || String(href).trim() === "" ? null : String(href).trim();
  }

  const saved = await FaqItemLinkModel.findOneAndUpdate(
    { itemId },
    { $set: update },
    { upsert: true, returnDocument: "after", runValidators: true },
  ).lean();

  successRes(res, {
    link: toFaqItemLinkPayload(saved),
  });
}
