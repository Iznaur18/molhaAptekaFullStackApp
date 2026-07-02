import { SiteHeaderBannerCarousel } from "@/entities/site-header-banner/ui/SiteHeaderBannerCarousel";
import { useSiteHeaderBannerSlidesQuery } from "@/entities/site-header-banner/model/useSiteHeaderBannerSlidesQuery";

type SiteHeaderBannerSlotProps = {
  visible: boolean;
  edgeToEdge?: boolean;
};

export const SiteHeaderBannerSlot = ({
  visible,
  edgeToEdge = false,
}: SiteHeaderBannerSlotProps) => {
  const slidesQuery = useSiteHeaderBannerSlidesQuery({ enabled: visible });
  const slides = visible ? (slidesQuery.data ?? []) : [];

  if (!visible || slides.length === 0) {
    return null;
  }

  return <SiteHeaderBannerCarousel slides={slides} edgeToEdge={edgeToEdge} />;
};
