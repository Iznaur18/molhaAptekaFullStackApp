import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, View } from "react-native";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { canSellerEditRaffle } from "@/entities/raffle/lib/canSellerEditRaffle";
import { useMyRaffleMutations } from "@/entities/raffle/model/useMyRaffleMutations";
import { useRaffleStaffMutations } from "@/entities/raffle/model/useRaffleStaffMutations";
import type { FeaturedRaffleManage, RaffleFromApi } from "@/entities/raffle/model/types";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { CreateRaffleModal } from "@/features/create-raffle-page/ui/CreateRaffleModal";
import { HomeFeaturedRaffleModal } from "@/features/home-feed/ui/HomeFeaturedRaffleModal";
import { HomeFeaturedRafflesRevealButton } from "@/features/home-feed/ui/HomeFeaturedRafflesRevealButton";
import { raffleQueryKeys } from "@/shared/api";
import { HOME_FEED_UI, PRODUCT_REPORT_UI, RAFFLE_MANAGE_UI } from "@/shared/config";
import { useRaffleFeaturedSectionStyles } from "@/shared/theme/raffleFeaturedStyles";

type HomeFeaturedRafflesSectionProps = {
  raffles: RaffleFromApi[];
};

export const HomeFeaturedRafflesSection = ({ raffles }: HomeFeaturedRafflesSectionProps) => {
  const sectionStyles = useRaffleFeaturedSectionStyles();
  const router = useRouter();
  const sessionQuery = useAuthSessionQuery();
  const queryClient = useQueryClient();
  const { canModerate } = useUserAccess();
  const { pauseMyMutation, deleteMyMutation } = useMyRaffleMutations();
  const { deleteStaffMutation } = useRaffleStaffMutations();
  const [isBusy, setIsBusy] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRaffle, setEditingRaffle] = useState<RaffleFromApi | null>(null);
  const [editUseStaffApi, setEditUseStaffApi] = useState(false);

  const currentUserId =
    sessionQuery.data?.user?._id != null ? String(sessionQuery.data.user._id) : null;
  const hasRaffles = raffles.length > 0;

  const handleOpenProducts = useCallback(
    (raffleId: string) => {
      router.push(`/raffle/${raffleId}` as never);
    },
    [router],
  );

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

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

      const useStaffDelete = !isOwner && canModerate;

      return {
        showEdit: isOwner ? canSellerEditRaffle(raffle) : canModerate,
        showDelete: isOwner || canModerate,
        showPause: isOwner && raffle.status === "active",
        busy: isBusy,
        onEdit: () => {
          setIsModalOpen(false);
          setEditUseStaffApi(canModerate && !isOwner);
          setEditingRaffle(raffle);
        },
        onDelete: () => {
          setIsModalOpen(false);
          setTimeout(() => {
            Alert.alert(
              RAFFLE_MANAGE_UI.DELETE,
              useStaffDelete
                ? RAFFLE_MANAGE_UI.DELETE_CONFIRM_STAFF
                : RAFFLE_MANAGE_UI.DELETE_CONFIRM_OWNER,
              [
                { text: PRODUCT_REPORT_UI.CANCEL, style: "cancel" },
                {
                  text: RAFFLE_MANAGE_UI.DELETE,
                  style: "destructive",
                  onPress: () => {
                    void (async () => {
                      try {
                        setIsBusy(true);
                        if (useStaffDelete) {
                          await deleteStaffMutation.mutateAsync(String(raffle._id));
                          await Promise.all([
                            queryClient.invalidateQueries({
                              queryKey: [...raffleQueryKeys.all, "featured"],
                            }),
                            queryClient.invalidateQueries({
                              queryKey: raffleQueryKeys.staffQueue(),
                            }),
                          ]);
                        } else {
                          await deleteMyMutation.mutateAsync(raffle._id);
                        }
                      } catch {
                        // mutation error surfaces via query state elsewhere
                      } finally {
                        setIsBusy(false);
                      }
                    })();
                  },
                },
              ],
            );
          }, 80);
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
    [canModerate, currentUserId, deleteMyMutation, deleteStaffMutation, isBusy, pauseMyMutation, queryClient],
  );

  return (
    <>
      {hasRaffles ? (
        <View style={sectionStyles.root} accessibilityLabel={HOME_FEED_UI.RAFFLES_SECTION_ARIA}>
          <HomeFeaturedRafflesRevealButton onPress={openModal} />
        </View>
      ) : null}

      <HomeFeaturedRaffleModal
        visible={isModalOpen && hasRaffles}
        raffles={raffles}
        onClose={closeModal}
        onOpenProducts={handleOpenProducts}
        getManage={getManage}
      />

      <CreateRaffleModal
        visible={editingRaffle != null}
        raffleToEdit={editingRaffle}
        useStaffApi={editUseStaffApi}
        onClose={() => setEditingRaffle(null)}
      />
    </>
  );
};
