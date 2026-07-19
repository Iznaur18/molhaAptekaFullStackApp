import { memo, useMemo, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";

import { buildFeaturedRaffleProgress } from "@/entities/raffle/lib/buildFeaturedRaffleProgressLabel";
import { useRaffleFeaturedBannerMetrics } from "@/entities/raffle/model/useRaffleFeaturedBannerMetrics";
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

type RaffleFeaturedBannerProps = {
  raffle: RaffleFromApi;
  cardWidth: number;
  onOpenProducts: (raffleId: string) => void;
  manage?: FeaturedRaffleManage | null;
  inCarousel?: boolean;
  isVideoActive?: boolean;
};

export const RaffleFeaturedBanner = memo(({
  raffle,
  cardWidth,
  onOpenProducts,
  manage = null,
  inCarousel = false,
  isVideoActive = true,
}: RaffleFeaturedBannerProps) => {
  const styles = useRaffleFeaturedBannerStyles();
  const hasManage = Boolean(
    manage && (manage.showEdit || manage.showDelete || manage.showPause),
  );
  const metrics = useRaffleFeaturedBannerMetrics(cardWidth, { hasManage });
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const { isCompleted, progress, target, percent, label: progressLabel } = useMemo(
    () => buildFeaturedRaffleProgress(raffle),
    [raffle],
  );

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

  return (
    <View
      style={[styles.root, inCarousel && styles.rootInCarousel]}
      accessibilityRole="summary"
      accessibilityLabel={raffle.title}
    >
      <View style={styles.cardStack}>
        <SquircleView
          radius={RAFFLE_FEATURED_BANNER_BORDER_RADIUS}
          style={[styles.visualCard, isCompleted && styles.visualCardCompleted]}
        >
          <View
            style={[
              styles.visual,
              {
                width: metrics.visualWidth,
                height: metrics.visualHeight,
              },
            ]}
          >
            <RafflePrizeMedia raffle={raffle} showSoundToggle isVideoActive={isVideoActive} />
            <View style={styles.visualTopBar} pointerEvents="box-none">
              <View style={styles.badge} accessibilityRole="text">
                <Text style={styles.badgeLabel}>{RAFFLE_FEATURED_BANNER_UI.BADGE}</Text>
              </View>
              <View style={styles.visualTopControls}>
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
                <RaffleFeaturedBannerInfoToggle
                  visible={isInfoOpen}
                  onToggle={() => setIsInfoOpen((open) => !open)}
                />
              </View>
            </View>
            <RaffleFeaturedBannerInfoPanel raffle={raffle} visible={isInfoOpen} />
          </View>
        </SquircleView>

        <SquircleView
          radius={RAFFLE_FEATURED_BANNER_BORDER_RADIUS}
          style={[styles.footerCard, isCompleted && styles.footerCardCompleted]}
        >
          <View style={styles.footerContent}>
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

            <Text style={styles.progressLabel} numberOfLines={2}>
              {progressLabel}
            </Text>

            <View style={styles.actions}>
              <Pressable
                style={[styles.btnPrimary, isCompleted && styles.btnPrimaryCompleted]}
                accessibilityRole="button"
                onPress={() => onOpenProducts(raffle._id)}
              >
                <Text
                  style={[styles.btnPrimaryText, isCompleted && styles.btnPrimaryTextCompleted]}
                >
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
        </SquircleView>
      </View>
    </View>
  );
});

RaffleFeaturedBanner.displayName = "RaffleFeaturedBanner";
