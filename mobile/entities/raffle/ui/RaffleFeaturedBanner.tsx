import { useMemo, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";

import { getRaffleFeaturedBannerBackdrop } from "@/entities/raffle/lib/getRaffleFeaturedBannerBackdrop";
import { useRaffleFeaturedBannerMetrics } from "@/entities/raffle/model/useRaffleFeaturedBannerMetrics";
import { RaffleDescriptionModal } from "@/entities/raffle/ui/RaffleDescriptionModal";
import { RaffleFeaturedBannerBackdropLayer } from "@/entities/raffle/ui/RaffleFeaturedBannerBackdropLayer";
import { RaffleFeaturedBannerBackground } from "@/entities/raffle/ui/RaffleFeaturedBannerBackground";
import {
  RaffleFeaturedBannerInfoPanel,
  RaffleFeaturedBannerInfoToggle,
} from "@/entities/raffle/ui/RaffleFeaturedBannerInfoOverlay";
import { RaffleFeaturedBannerManageMenu } from "@/entities/raffle/ui/RaffleFeaturedBannerManageMenu";
import { RafflePrizeMedia } from "@/entities/raffle/ui/RafflePrizeMedia";
import type { FeaturedRaffleManage, RaffleFromApi } from "@/entities/raffle/model/types";
import { RAFFLE_FEATURED_BANNER_UI } from "@/shared/config";
import {
  RAFFLE_FEATURED_BANNER_BORDER_RADIUS,
  useRaffleFeaturedBannerStyles,
} from "@/shared/theme/raffleFeaturedStyles";
import { SquircleView } from "@/shared/ui/SquircleView";

const DESCRIPTION_PREVIEW_MAX_LINES = 3;

type RaffleFeaturedBannerProps = {
  raffle: RaffleFromApi;
  cardWidth: number;
  onOpenProducts: (raffleId: string) => void;
  manage?: FeaturedRaffleManage | null;
  inCarousel?: boolean;
};

export const RaffleFeaturedBanner = ({
  raffle,
  cardWidth,
  onOpenProducts,
  manage = null,
  inCarousel = false,
}: RaffleFeaturedBannerProps) => {
  const styles = useRaffleFeaturedBannerStyles();
  const hasManage = Boolean(
    manage && (manage.showEdit || manage.showDelete || manage.showPause),
  );
  const metrics = useRaffleFeaturedBannerMetrics(cardWidth);
  const backdrop = useMemo(() => getRaffleFeaturedBannerBackdrop(raffle), [raffle]);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const isSplit = metrics.layout === "split";
  const isCompleted = raffle.status === "completed";
  const hasBackdrop = backdrop.hasBackdrop;

  const progress = Number(raffle.salesProgress) || 0;
  const target = Number(raffle.targetSales) || 0;
  const percent = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;
  const remaining = Math.max(0, target - progress);
  const copyOnBackdropStyle = undefined;

  const handleOpenInstagram = async () => {
    const url = raffle.instagramUrl?.trim();
    if (!url) {
      return;
    }
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch {
      // ignore
    }
  };

  const innerStyle = [
    styles.inner,
    inCarousel && styles.innerInCarousel,
    isSplit ? styles.innerSplit : styles.innerStacked,
    hasBackdrop && styles.innerHasBackdrop,
    isCompleted && styles.innerCompleted,
  ];

  const bannerContent = (
    <>
      {!hasBackdrop ? <RaffleFeaturedBannerBackground /> : null}
      <RaffleFeaturedBannerBackdropLayer
        raffle={raffle}
        backdrop={backdrop}
        completed={isCompleted}
      />

      <View
        style={[
          styles.visual,
          isSplit ? styles.visualSplit : styles.visualStacked,
          {
            height: metrics.visualHeight,
            minHeight: metrics.visualHeight,
          },
        ]}
      >
        <RafflePrizeMedia raffle={raffle} showSoundToggle />
        {!isSplit || (hasManage && manage) ? (
          <View style={styles.visualActionControls}>
            {hasManage && manage ? (
              <RaffleFeaturedBannerManageMenu
                showEdit={manage.showEdit}
                showDelete={manage.showDelete}
                showPause={manage.showPause}
                onEdit={manage.onEdit}
                onDelete={manage.onDelete}
                onPause={manage.onPause}
                busy={manage.busy}
              />
            ) : null}
            {!isSplit ? (
              <RaffleFeaturedBannerInfoToggle
                visible={isInfoOpen}
                onToggle={() => setIsInfoOpen((open) => !open)}
              />
            ) : null}
          </View>
        ) : null}
        {!isSplit ? (
          <RaffleFeaturedBannerInfoPanel
            raffle={raffle}
            visible={isInfoOpen}
            onBackdropText={hasBackdrop}
          />
        ) : null}
      </View>

      <View style={[styles.body, isSplit ? styles.bodySplit : styles.bodyStacked]}>
        {metrics.showInlineCopy ? (
          <>
            <Text style={[styles.title, copyOnBackdropStyle]} numberOfLines={2}>
              {raffle.title}
            </Text>

            {raffle.description ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={RAFFLE_FEATURED_BANNER_UI.DESCRIPTION_OPEN_ARIA}
                onPress={() => setIsDescriptionOpen(true)}
              >
                <Text
                  style={[styles.description, copyOnBackdropStyle]}
                  numberOfLines={DESCRIPTION_PREVIEW_MAX_LINES}
                >
                  {raffle.description}
                </Text>
              </Pressable>
            ) : null}
          </>
        ) : null}

        <View style={styles.progressWrap}>
          <View
            style={[styles.progressBar, isCompleted && styles.progressBarCompleted]}
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: target,
              now: progress,
            }}
          >
            <View
              style={[
                styles.progressFill,
                isCompleted ? styles.progressFillCompleted : null,
                { width: `${percent}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, copyOnBackdropStyle]} numberOfLines={2}>
            {RAFFLE_FEATURED_BANNER_UI.PROGRESS(progress, target)}
            {!isCompleted && remaining > 0
              ? ` · ${RAFFLE_FEATURED_BANNER_UI.REMAINING(remaining)}`
              : ""}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.btnPrimary, isCompleted && styles.btnPrimaryCompleted]}
            accessibilityRole="button"
            onPress={() => onOpenProducts(raffle._id)}
          >
            <Text style={[styles.btnPrimaryText, isCompleted && styles.btnPrimaryTextCompleted]}>
              {RAFFLE_FEATURED_BANNER_UI.OPEN_PRODUCTS}
            </Text>
          </Pressable>

          {isCompleted && raffle.instagramUrl ? (
            <Pressable
              style={styles.btnInstagram}
              accessibilityRole="link"
              onPress={() => void handleOpenInstagram()}
            >
              <Text style={styles.btnInstagramText}>
                {RAFFLE_FEATURED_BANNER_UI.OPEN_INSTAGRAM}
              </Text>
            </Pressable>
          ) : null}

          {isCompleted ? (
            <Text style={styles.completedLabel}>{RAFFLE_FEATURED_BANNER_UI.COMPLETED}</Text>
          ) : null}
        </View>
      </View>
    </>
  );

  return (
    <View
      style={[styles.root, inCarousel && styles.rootInCarousel]}
      accessibilityRole="summary"
      accessibilityLabel={raffle.title}
    >
      {inCarousel ? (
        <View style={innerStyle}>{bannerContent}</View>
      ) : (
        <SquircleView
          radius={RAFFLE_FEATURED_BANNER_BORDER_RADIUS}
          shadowStyle={styles.innerShadow}
          style={innerStyle}
        >
          {bannerContent}
        </SquircleView>
      )}

      <RaffleDescriptionModal
        visible={isDescriptionOpen}
        title={raffle.title}
        description={raffle.description ?? ""}
        onClose={() => setIsDescriptionOpen(false)}
      />
    </View>
  );
};
