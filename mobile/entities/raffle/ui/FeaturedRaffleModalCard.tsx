import { memo, useMemo } from "react";
import { Linking, Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { buildFeaturedRaffleProgress } from "@/entities/raffle/lib/buildFeaturedRaffleProgressLabel";
import type { FeaturedRaffleManage, RaffleFromApi } from "@/entities/raffle/model/types";
import { RaffleFeaturedBannerManageMenu } from "@/entities/raffle/ui/RaffleFeaturedBannerManageMenu";
import { RafflePrizeMedia } from "@/entities/raffle/ui/RafflePrizeMedia";
import { RAFFLE_FEATURED_BANNER_UI } from "@/shared/config";
import {
  RAFFLE_FEATURED_BANNER_BORDER_RADIUS,
  useFeaturedRaffleModalCardStyles,
} from "@/shared/theme/raffleFeaturedStyles";
import { SquircleView } from "@/shared/ui/SquircleView";

type FeaturedRaffleModalCardProps = {
  raffle: RaffleFromApi;
  visualSize: number;
  manage?: FeaturedRaffleManage | null;
  isVideoActive?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const FeaturedRaffleModalCard = memo(
  ({
    raffle,
    visualSize,
    manage = null,
    isVideoActive = true,
    style,
  }: FeaturedRaffleModalCardProps) => {
    const styles = useFeaturedRaffleModalCardStyles();
    const { isCompleted, progress, target, percent, label } = useMemo(
      () => buildFeaturedRaffleProgress(raffle),
      [raffle],
    );
    const hasManage = Boolean(
      manage && (manage.showEdit || manage.showDelete || manage.showPause),
    );
    const description = raffle.description?.trim() ?? "";

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
      <View style={[styles.root, style]} accessibilityRole="summary" accessibilityLabel={raffle.title}>
        <View style={[styles.visualWrap, { width: visualSize }]}>
          <SquircleView
            radius={RAFFLE_FEATURED_BANNER_BORDER_RADIUS}
            style={[
              styles.visualCard,
              isCompleted && styles.visualCardCompleted,
              { width: visualSize, height: visualSize },
            ]}
          >
            <View style={[styles.visual, { width: visualSize, height: visualSize }]}>
              <RafflePrizeMedia raffle={raffle} showSoundToggle isVideoActive={isVideoActive} />
            </View>
          </SquircleView>

          <View style={styles.visualTopBar} pointerEvents="box-none">
            <View style={styles.badge} accessibilityRole="text">
              <Text style={styles.badgeLabel}>{RAFFLE_FEATURED_BANNER_UI.BADGE}</Text>
            </View>
            {hasManage && manage ? (
              <RaffleFeaturedBannerManageMenu
                placement="inline"
                showEdit={manage.showEdit}
                showDelete={manage.showDelete}
                showPause={manage.showPause}
                onEdit={manage.onEdit}
                onDelete={manage.onDelete}
                onPause={manage.onPause}
                busy={manage.busy}
              />
            ) : null}
          </View>
        </View>

        <View style={styles.body}>
          <View
            style={[styles.progressBar, isCompleted && styles.progressBarCompleted]}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: target, now: progress }}
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
            {label}
          </Text>

          <Text style={styles.title} numberOfLines={3}>
            {raffle.title}
          </Text>

          {description.length > 0 ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}

          {isCompleted ? (
            <View style={styles.secondaryActions}>
              {raffle.instagramUrl ? (
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
              <Text style={styles.completedLabel}>{RAFFLE_FEATURED_BANNER_UI.COMPLETED}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  },
);

FeaturedRaffleModalCard.displayName = "FeaturedRaffleModalCard";
