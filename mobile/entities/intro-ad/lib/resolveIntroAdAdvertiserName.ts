type IntroAdAdvertiser = Record<string, unknown> | null | undefined;

type IntroAdAdvertiserSource = {
  advertiser?: IntroAdAdvertiser;
  advertiserId?: string | null;
};

export const resolveIntroAdAdvertiserName = (campaign: IntroAdAdvertiserSource) => {
  const advertiser = campaign.advertiser;
  const nickname =
    typeof advertiser?.userNickname === "string" ? advertiser.userNickname.trim() : "";
  if (nickname) {
    return nickname;
  }

  const fullName = [advertiser?.userName, advertiser?.userSurname]
    .filter((part) => typeof part === "string" && part.trim().length > 0)
    .join(" ")
    .trim();
  if (fullName) {
    return fullName;
  }

  return campaign.advertiserId ?? "—";
};
