type SellerPersonalCategorySeller = Record<string, unknown> | null | undefined;

type SellerPersonalCategorySellerSource = {
  seller?: SellerPersonalCategorySeller;
  sellerId?: string | null;
};

export const resolveSellerPersonalCategorySellerName = (
  campaign: SellerPersonalCategorySellerSource,
) => {
  const seller = campaign.seller;
  const nickname =
    typeof seller?.userNickname === "string" ? seller.userNickname.trim() : "";
  if (nickname) {
    return nickname;
  }

  const fullName = [seller?.userName, seller?.userSurname]
    .filter((part) => typeof part === "string" && part.trim().length > 0)
    .join(" ")
    .trim();
  if (fullName) {
    return fullName;
  }

  return campaign.sellerId ?? "";
};

export const formatSellerPersonalCategoryCampaignSummary = (campaign: {
  labelRu?: string | null;
  amountPoints?: number | null;
  tariffCode?: string | null;
}) => {
  const label = campaign.labelRu?.trim() || "—";
  const points =
    typeof campaign.amountPoints === "number" ? campaign.amountPoints : "—";
  const tariff = campaign.tariffCode?.trim() || "—";
  return `${label} — ${points} баллов (${tariff})`;
};
