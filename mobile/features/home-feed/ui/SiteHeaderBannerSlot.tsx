import { SiteHeaderBannerCarousel } from "@/entities/site-header-banner/ui/SiteHeaderBannerCarousel";
import { useSiteHeaderBannerSlidesQuery } from "@/entities/site-header-banner/model/useSiteHeaderBannerSlidesQuery";
import { useViewerRegion } from "@/entities/region/model/ViewerRegionProvider";
import { SkeletonShimmer } from "@/shared/ui/SkeletonShimmer";
import { useHomeFeedSkeletonStyles } from "@/shared/theme/homeFeedSkeletonStyles";

type SiteHeaderBannerSlotProps = {
  visible: boolean;
  edgeToEdge?: boolean;
};

export const SiteHeaderBannerSlot = ({
  visible,
  edgeToEdge = false,
}: SiteHeaderBannerSlotProps) => {
  const skeletonStyles = useHomeFeedSkeletonStyles();
  const { viewerRegionCode } = useViewerRegion();
  const slidesQuery = useSiteHeaderBannerSlidesQuery({
    enabled: visible,
    regionCode: viewerRegionCode,
  });
  const slides = visible ? (slidesQuery.data ?? []) : [];

  if (!visible) {
    return null;
  }

  if (slidesQuery.isPending) {
    return (
      <SkeletonShimmer
        style={[
          skeletonStyles.bannerPlaceholder,
          edgeToEdge ? skeletonStyles.bannerPlaceholderEdgeToEdge : null,
        ]}
      />
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return <SiteHeaderBannerCarousel slides={slides} edgeToEdge={edgeToEdge} />;
};
