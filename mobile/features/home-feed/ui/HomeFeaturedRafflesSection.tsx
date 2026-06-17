import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { canSellerEditRaffle } from "@/entities/raffle/lib/canSellerEditRaffle";
import { useMyRaffleMutations } from "@/entities/raffle/model/useMyRaffleMutations";
import type { FeaturedRaffleManage, RaffleFromApi } from "@/entities/raffle/model/types";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { RaffleFeaturedCarousel } from "@/entities/raffle/ui/RaffleFeaturedCarousel";
import { PRODUCT_REPORT_UI, RAFFLE_MANAGE_UI } from "@/shared/config";

type HomeFeaturedRafflesSectionProps = {
  raffles: RaffleFromApi[];
};

export const HomeFeaturedRafflesSection = ({ raffles }: HomeFeaturedRafflesSectionProps) => {
  const router = useRouter();
  const sessionQuery = useAuthSessionQuery();
  const { canModerate } = useUserAccess();
  const { pauseMyMutation, deleteMyMutation } = useMyRaffleMutations();
  const [isBusy, setIsBusy] = useState(false);

  const currentUserId =
    sessionQuery.data?.user?._id != null ? String(sessionQuery.data.user._id) : null;

  const handleOpenProducts = useCallback(
    (raffleId: string) => {
      router.push(`/raffle/${raffleId}` as never);
    },
    [router],
  );

  const getManage = useCallback(
    (raffle: RaffleFromApi): FeaturedRaffleManage | null => {
      if (!raffle) {
        return null;
      }

      const isOwner = currentUserId != null && String(raffle.sellerId) === currentUserId;
      const canManage = isOwner || canModerate;
      if (!canManage) {
        return null;
      }

      return {
        showEdit: isOwner ? canSellerEditRaffle(raffle) : canModerate,
        showDelete: isOwner,
        showPause: isOwner && raffle.status === "active",
        busy: isBusy,
        onEdit: () => router.push("/(tabs)/profile" as never),
        onDelete: () => {
          Alert.alert(RAFFLE_MANAGE_UI.DELETE, RAFFLE_MANAGE_UI.DELETE_CONFIRM_OWNER, [
            { text: PRODUCT_REPORT_UI.CANCEL, style: "cancel" },
            {
              text: RAFFLE_MANAGE_UI.DELETE,
              style: "destructive",
              onPress: () => {
                void (async () => {
                  try {
                    setIsBusy(true);
                    await deleteMyMutation.mutateAsync(raffle._id);
                  } catch {
                    // mutation error surfaces via query state elsewhere
                  } finally {
                    setIsBusy(false);
                  }
                })();
              },
            },
          ]);
        },
        onPause: () => {
          void (async () => {
            try {
              setIsBusy(true);
              await pauseMyMutation.mutateAsync(raffle._id);
            } catch {
              // ignore
            } finally {
              setIsBusy(false);
            }
          })();
        },
      };
    },
    [
      canModerate,
      currentUserId,
      deleteMyMutation,
      isBusy,
      pauseMyMutation,
      router,
    ],
  );

  return (
    <RaffleFeaturedCarousel
      raffles={raffles}
      onOpenProducts={handleOpenProducts}
      getManage={getManage}
    />
  );
};
