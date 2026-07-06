import { useCallback, useState } from "react";

import { useMyRaffleQuery } from "@/entities/raffle/model/useMyRaffleQuery";
import { useSetProductRaffleParticipationMutation } from "@/entities/raffle/model/useSetProductRaffleParticipationMutation";
import { API_CLIENT_UI } from "@/shared/config";

type CatalogProduct = Record<string, unknown> & { _id: string };

type UseProductPromotionManageSupportParams = {
  product: CatalogProduct | null;
  syncProduct?: (updated: CatalogProduct) => void;
  setManageErrorMessage?: (message: string) => void;
  enabled?: boolean;
};

export const useProductPromotionManageSupport = ({
  product,
  syncProduct,
  setManageErrorMessage,
  enabled = true,
}: UseProductPromotionManageSupportParams) => {
  const myRaffleQuery = useMyRaffleQuery({ enabled });
  const setParticipationMutation = useSetProductRaffleParticipationMutation();
  const [raffleParticipationPendingProductId, setRaffleParticipationPendingProductId] = useState<
    string | null
  >(null);

  const sellerRaffleActive = myRaffleQuery.data?.raffle?.status === "active";
  const productId = product?._id != null ? String(product._id) : null;

  const handleToggleRaffleParticipation = useCallback(
    async (targetProduct: CatalogProduct, participate: boolean) => {
      if (targetProduct._id == null) {
        return;
      }

      const targetProductId = String(targetProduct._id);
      setRaffleParticipationPendingProductId(targetProductId);
      setManageErrorMessage?.("");

      try {
        const updated = await setParticipationMutation.mutateAsync({
          productId: targetProductId,
          enabled: participate,
        });
        syncProduct?.(updated as CatalogProduct);
      } catch (error) {
        setManageErrorMessage?.(
          error instanceof Error
            ? error.message
            : API_CLIENT_UI.SET_RAFFLE_PARTICIPATION_FALLBACK,
        );
      } finally {
        setRaffleParticipationPendingProductId(null);
      }
    },
    [setManageErrorMessage, setParticipationMutation, syncProduct],
  );

  const handleInstallmentProgramSaved = useCallback(
    (productPatch?: Record<string, unknown>) => {
      if (!product || !productPatch || productId == null) {
        return;
      }
      syncProduct?.({ ...product, ...productPatch } as CatalogProduct);
    },
    [product, productId, syncProduct],
  );

  return {
    sellerRaffleActive,
    handleToggleRaffleParticipation,
    isRaffleParticipationPending:
      productId != null && raffleParticipationPendingProductId === productId,
    handleInstallmentProgramSaved,
  };
};
