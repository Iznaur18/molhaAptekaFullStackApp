import { submitSiteHeaderBannerCampaignBodySchema } from "@molha/api-contract";

/**
 * @param {{
 *   imageUrl: string;
 *   imageAlt: string;
 *   linkPath: string;
 *   backgroundColor: string;
 * }} form
 * @returns {string | null}
 */
export const validateSiteHeaderBannerCampaignForm = (form) => {
  const imageUrl = String(form.imageUrl ?? "").trim();
  const imageAlt = String(form.imageAlt ?? "").trim();

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
      linkPath: String(form.linkPath ?? "").trim() || null,
      backgroundColor: String(form.backgroundColor ?? "").trim() || null,
    });
  } catch {
    return "Проверьте поля баннера";
  }

  return null;
};

/**
 * @param {{
 *   imageUrl: string;
 *   imageAlt: string;
 *   linkPath: string;
 *   backgroundColor: string;
 * }} form
 */
export const buildSubmitSiteHeaderBannerCampaignBody = (form) => ({
  imageUrl: String(form.imageUrl ?? "").trim(),
  imageAlt: String(form.imageAlt ?? "").trim(),
  linkPath: String(form.linkPath ?? "").trim() || null,
  backgroundColor: String(form.backgroundColor ?? "").trim() || null,
});

export const createEmptySiteHeaderBannerCampaignForm = () => ({
  imageUrl: "",
  imageAlt: "",
  linkPath: "",
  backgroundColor: "",
});
