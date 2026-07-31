/**
 * @param referrer unknown populated user or id
 */
export function resolveAffiliateReferrerDisplayName(referrer: unknown): string {
  if (referrer == null || typeof referrer !== "object") {
    return "";
  }
  const name = String(
    (referrer as { userName?: unknown }).userName ?? "",
  ).trim();
  return name;
}

export type OrderLineAffiliateSellerInput = {
  affiliateStatus?: string | null;
  affiliateAmount?: number | null;
  affiliatePercentUsed?: number | null;
  affiliateReferrerUserId?: unknown;
};

/**
 * Seller-facing affiliate attribution line for order cards.
 */
export function resolveOrderLineAffiliateSellerLine(input: {
  item: OrderLineAffiliateSellerInput;
  attentionRole?: string;
}): string | null {
  const { item, attentionRole = "buyer" } = input;
  if (attentionRole !== "seller") {
    return null;
  }
  const status = String(item?.affiliateStatus ?? "none");
  if (status === "none" || status === "") {
    return null;
  }
  const name =
    resolveAffiliateReferrerDisplayName(item.affiliateReferrerUserId) ||
    "партнёр";
  const amount = Math.ceil(Number(item.affiliateAmount) || 0);
  const percent = Math.floor(Number(item.affiliatePercentUsed) || 0);

  if (status === "pending") {
    return `Привёл: ${name} · выплата после подтверждения`;
  }
  if (status === "paid") {
    const pctPart = percent > 0 ? ` · ${percent}%` : "";
    const amountPart = amount > 0 ? ` · ${amount}` : "";
    return `Привёл: ${name}${pctPart}${amountPart}`;
  }
  if (status === "skipped_no_program") {
    return `Привёл: ${name} · партнёрка выкл. на момент подтверждения`;
  }
  if (status === "skipped_antifraud") {
    return `Привёл: ${name} · выплата отклонена`;
  }
  return `Привёл: ${name}`;
}
