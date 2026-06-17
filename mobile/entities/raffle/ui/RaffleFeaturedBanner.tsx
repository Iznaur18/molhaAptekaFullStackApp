import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";

import { RaffleDescriptionModal } from "@/entities/raffle/ui/RaffleDescriptionModal";
import { RaffleManageActions } from "@/entities/raffle/ui/RaffleManageActions";
import { RafflePrizeMedia } from "@/entities/raffle/ui/RafflePrizeMedia";
import type { FeaturedRaffleManage, RaffleFromApi } from "@/entities/raffle/model/types";
import { RAFFLE_FEATURED_BANNER_UI } from "@/shared/config";
import { useRaffleFeaturedBannerStyles } from "@/shared/theme/raffleFeaturedStyles";

type RaffleFeaturedBannerProps = {
  raffle: RaffleFromApi;
  onOpenProducts: (raffleId: string) => void;
  manage?: FeaturedRaffleManage | null;
};

export const RaffleFeaturedBanner = ({
  raffle,
  onOpenProducts,
  manage = null,
}: RaffleFeaturedBannerProps) => {
  const styles = useRaffleFeaturedBannerStyles();
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const progress = Number(raffle.salesProgress) || 0;
  const target = Number(raffle.targetSales) || 0;
  const percent = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;
  const isCompleted = raffle.status === "completed";
  const remaining = Math.max(0, target - progress);
  const hasManage = Boolean(
    manage && (manage.showEdit || manage.showDelete || manage.showPause),
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
      style={styles.root}
      accessibilityRole="summary"
      accessibilityLabel={raffle.title}
    >
      <View style={[styles.inner, isCompleted && styles.innerCompleted]}>
        <View style={styles.visual}>
          <RafflePrizeMedia raffle={raffle} showSoundToggle />
          <View style={[styles.badge, isCompleted && styles.badgeCompleted]}>
            <Text style={styles.badgeText}>{RAFFLE_FEATURED_BANNER_UI.BADGE}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{raffle.title}</Text>

          {raffle.description ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={RAFFLE_FEATURED_BANNER_UI.DESCRIPTION_OPEN_ARIA}
              onPress={() => setIsDescriptionOpen(true)}
            >
              <Text style={styles.description} numberOfLines={3}>
                {raffle.description}
              </Text>
            </Pressable>
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
                  isCompleted && styles.progressFillCompleted,
                  { width: `${percent}%` },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {RAFFLE_FEATURED_BANNER_UI.PROGRESS(progress, target)}
              {!isCompleted && remaining > 0
                ? ` · ${RAFFLE_FEATURED_BANNER_UI.REMAINING(remaining)}`
                : ""}
            </Text>
          </View>

          {hasManage ? (
            <View style={[styles.manage, isCompleted && styles.manageCompleted]}>
              <RaffleManageActions {...manage} busy={manage?.busy} completed={isCompleted} />
            </View>
          ) : null}

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
      </View>

      <RaffleDescriptionModal
        visible={isDescriptionOpen}
        title={raffle.title}
        description={raffle.description ?? ""}
        onClose={() => setIsDescriptionOpen(false)}
      />
    </View>
  );
};
