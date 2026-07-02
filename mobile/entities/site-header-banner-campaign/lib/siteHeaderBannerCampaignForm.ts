import { submitSiteHeaderBannerCampaignBodySchema } from "@molha/api-contract";

export type SiteHeaderBannerCampaignFormState = {
  imageUrl: string;
  imageAlt: string;
  linkPath: string;
  backgroundColor: string;
};

export const createSiteHeaderBannerCampaignFormState = (): SiteHeaderBannerCampaignFormState => ({
  imageUrl: "",
  imageAlt: "",
  linkPath: "",
  backgroundColor: "",
});

export const validateSiteHeaderBannerCampaignForm = (
  form: SiteHeaderBannerCampaignFormState,
): string | null => {
  const imageUrl = form.imageUrl.trim();
  const imageAlt = form.imageAlt.trim();

  if (!imageUrl) {
    return "Загрузите изображение баннера";
  }

  if (!imageAlt) {
    return "Укажите alt-текст баннера";
  }

  try {
    submitSiteHeaderBannerCampaignBodySchema.parse({
      imageUrl,
      imageAlt,
      linkPath: form.linkPath.trim() || null,
      backgroundColor: form.backgroundColor.trim() || null,
    });
  } catch {
    return "Проверьте поля баннера";
  }

  return null;
};

export const buildSubmitSiteHeaderBannerCampaignBody = (
  form: SiteHeaderBannerCampaignFormState,
) => ({
  imageUrl: form.imageUrl.trim(),
  imageAlt: form.imageAlt.trim(),
  linkPath: form.linkPath.trim() || null,
  backgroundColor: form.backgroundColor.trim() || null,
});
