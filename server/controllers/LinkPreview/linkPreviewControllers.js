import mongoose from "mongoose";
import { isLinkPreviewBotUserAgent } from "@izibuy/shared-lib";

import { buildLinkPreviewHtml } from "../../services/link-preview/buildLinkPreviewHtml.js";
import { getProductLinkPreview } from "../../services/link-preview/getProductLinkPreview.js";
import { getSellerLinkPreview } from "../../services/link-preview/getSellerLinkPreview.js";
import { resolveSiteOgImageUrl } from "../../services/link-preview/resolveAbsolutePublicMediaUrl.js";
import { resolveFrontendOrigin } from "../../utils/resolveFrontendOrigin.js";

/**
 * @param {import("express").Request} req
 */
function readUserAgent(req) {
  const header = req.headers["user-agent"];
  return Array.isArray(header) ? header[0] : header;
}

/**
 * @param {import("express").Response} res
 * @param {{ title: string; description: string; url: string; imageUrl: string }} preview
 * @param {number} [status]
 */
function sendLinkPreviewHtml(res, preview, status = 200) {
  const html = buildLinkPreviewHtml(preview);
  res
    .status(status)
    .type("html")
    .set("Cache-Control", "public, max-age=300")
    .send(html);
}

/**
 * @param {import("express").Response} res
 * @param {string} canonicalPath
 */
function sendSiteFallbackPreview(res, canonicalPath) {
  const origin = resolveFrontendOrigin();
  sendLinkPreviewHtml(
    res,
    {
      title: "Gitorg — маркетплейс товаров",
      description:
        "Gitorg — маркетплейс: покупай и продавай товары, участвуй в розыгрышах и акциях.",
      url: `${origin}${canonicalPath}`,
      imageUrl: resolveSiteOgImageUrl(),
    },
    404,
  );
}

/** GET /product/:productId — только crawler UA → OG HTML; иначе next(). */
export const productLinkPreviewController = async (req, res, next) => {
  if (!isLinkPreviewBotUserAgent(readUserAgent(req))) {
    return next();
  }

  const productId = String(req.params.productId ?? "").trim();
  if (!mongoose.isValidObjectId(productId)) {
    return sendSiteFallbackPreview(res, `/product/${encodeURIComponent(productId)}`);
  }

  const preview = await getProductLinkPreview(productId);
  if (!preview) {
    return sendSiteFallbackPreview(res, `/product/${encodeURIComponent(productId)}`);
  }

  return sendLinkPreviewHtml(res, preview);
};

/** GET /seller/:sellerId — только crawler UA → OG HTML; иначе next(). */
export const sellerLinkPreviewController = async (req, res, next) => {
  if (!isLinkPreviewBotUserAgent(readUserAgent(req))) {
    return next();
  }

  const sellerId = String(req.params.sellerId ?? "").trim();
  if (!mongoose.isValidObjectId(sellerId)) {
    return sendSiteFallbackPreview(res, `/seller/${encodeURIComponent(sellerId)}`);
  }

  const preview = await getSellerLinkPreview(sellerId);
  if (!preview) {
    return sendSiteFallbackPreview(res, `/seller/${encodeURIComponent(sellerId)}`);
  }

  return sendLinkPreviewHtml(res, preview);
};
