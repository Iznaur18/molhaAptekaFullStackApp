import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import type { PriceOfferBuyerPreview } from "@/entities/product-price-offer/api/incomingPriceOffersApi";
import type { SellerProductPriceOffer } from "@/entities/product-price-offer/api/sellerProductPriceOffersApi";
import { usePriceOfferSellerMutations } from "@/entities/product-price-offer/model/usePriceOfferSellerMutations";
import {
  useSellerProductPriceOfferArchiveQuery,
  useSellerProductPriceOffersQuery,
} from "@/entities/product-price-offer/model/useSellerProductPriceOffersQuery";
import { AuctionDashboardRowBuyerMeta } from "@/entities/product-price-offer/ui/AuctionDashboardRowBuyerMeta";
import { AuctionDashboardSellerActions } from "@/entities/product-price-offer/ui/AuctionDashboardSellerActions";
import { AUCTION_PAGE_UI, PRODUCT_PRICE_OFFER_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useAuctionDashboardRowStyles } from "@/shared/theme/auctionPageStyles";
import { useProductPriceOfferStyles } from "@/shared/theme/catalogProductStyles";

const PRICE_OFFER_STATUS_PENDING = "pending";
const PRICE_OFFER_STATUS_ACCEPTED = "accepted";

/** Статус ставки словами, а не кодом (web-архив показывает сырой `status`). */
const PRICE_OFFER_STATUS_LABELS: Record<string, string> = {
  pending: PRODUCT_PRICE_OFFER_UI.STATUS_PENDING,
  accepted: PRODUCT_PRICE_OFFER_UI.ACCEPTED_BADGE,
  ordered: PRODUCT_PRICE_OFFER_UI.STATUS_ORDERED,
  rejected: PRODUCT_PRICE_OFFER_UI.STATUS_REJECTED,
};

export const resolveSellerOfferStatusLabel = (status?: string) =>
  status ? (PRICE_OFFER_STATUS_LABELS[status] ?? status) : "";

/** Сервер отдаёт покупателя в `buyer` или populate'нутым `buyerUserId`. */
const resolveBuyer = (
  offer: SellerProductPriceOffer,
): PriceOfferBuyerPreview | null => {
  const buyer = offer.buyer ?? offer.buyerUserId;
  return buyer != null && typeof buyer === "object" ? buyer : null;
};

type SellerOfferRowProps = {
  offer: SellerProductPriceOffer;
  date?: string;
  statusText?: string;
  onBuyerClick: (userId: string) => void;
  children?: React.ReactNode;
};

const SellerOfferRow = ({
  offer,
  date,
  statusText = "",
  onBuyerClick,
  children = null,
}: SellerOfferRowProps) => {
  const rowStyles = useAuctionDashboardRowStyles();
  return (
    <View style={rowStyles.row}>
      <AuctionDashboardRowBuyerMeta
        buyer={resolveBuyer(offer)}
        createdAt={date}
        onBuyerClick={onBuyerClick}
      />
      {statusText ? <Text style={rowStyles.meta}>{statusText}</Text> : null}
      <View style={rowStyles.priceStrip}>
        <Text style={rowStyles.priceLabel}>{AUCTION_PAGE_UI.BID_PRICE_LABEL}</Text>
        <Text style={rowStyles.price}>{formatPriceRub(offer.offerPrice)}</Text>
      </View>
      {children}
    </View>
  );
};

type ProductAuctionSellerSectionProps = {
  productId: string;
  /** Аукцион уже прошёл — показываем историю ставок (web `showSellerArchive`). */
  showArchive: boolean;
};

/**
 * Вкладка «Аукцион» своего товара — паритет web `ProductPriceOfferSellerTab` и
 * `ProductPriceOfferSellerArchive`: ставки с «Принять» / «Отклонить» и архив.
 */
export const ProductAuctionSellerSection = ({
  productId,
  showArchive,
}: ProductAuctionSellerSectionProps) => {
  const styles = useProductPriceOfferStyles();
  const router = useRouter();
  const offersQuery = useSellerProductPriceOffersQuery(productId);
  const archiveQuery = useSellerProductPriceOfferArchiveQuery(productId, showArchive);
  const { acceptMutation, rejectMutation } = usePriceOfferSellerMutations(productId);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const openBuyer = (userId: string) => {
    router.push({ pathname: "/user/[id]", params: { id: userId } });
  };

  const runAction = async (offerId: string, accept: boolean) => {
    setBusyId(offerId);
    setActionError("");
    try {
      if (accept) {
        await acceptMutation.mutateAsync(offerId);
      } else {
        await rejectMutation.mutateAsync(offerId);
      }
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : AUCTION_PAGE_UI.ERROR_GENERIC,
      );
    } finally {
      setBusyId(null);
    }
  };

  const offers = offersQuery.data ?? [];
  const archive = archiveQuery.data ?? [];

  const renderOffers = () => {
    if (offersQuery.isPending) {
      return <Text style={styles.hint}>{PRODUCT_PRICE_OFFER_UI.SELLER_LOADING}</Text>;
    }
    if (offersQuery.isError) {
      return (
        <Text style={styles.error} accessibilityRole="alert">
          {offersQuery.error.message}
        </Text>
      );
    }
    if (offers.length === 0) {
      return <Text style={styles.empty}>{PRODUCT_PRICE_OFFER_UI.SELLER_EMPTY}</Text>;
    }
    return offers.map((offer) => {
      const offerId = String(offer._id);
      const isPending = offer.status === PRICE_OFFER_STATUS_PENDING;
      const isAccepted = offer.status === PRICE_OFFER_STATUS_ACCEPTED;
      return (
        <SellerOfferRow
          key={offerId}
          offer={offer}
          date={offer.createdAt}
          statusText={isAccepted ? PRODUCT_PRICE_OFFER_UI.ACCEPTED_BADGE : ""}
          onBuyerClick={openBuyer}
        >
          {isPending ? (
            <AuctionDashboardSellerActions
              onAccept={() => void runAction(offerId, true)}
              onReject={() => void runAction(offerId, false)}
              disabled={busyId === offerId}
              acceptLabel={PRODUCT_PRICE_OFFER_UI.ACTION_ACCEPT}
              rejectLabel={PRODUCT_PRICE_OFFER_UI.ACTION_REJECT}
              pendingLabel={PRODUCT_PRICE_OFFER_UI.ACTION_PENDING}
            />
          ) : null}
        </SellerOfferRow>
      );
    });
  };

  const renderArchive = () => {
    if (archiveQuery.isPending) {
      return <Text style={styles.hint}>{PRODUCT_PRICE_OFFER_UI.SELLER_LOADING}</Text>;
    }
    if (archiveQuery.isError) {
      return (
        <Text style={styles.error} accessibilityRole="alert">
          {archiveQuery.error.message}
        </Text>
      );
    }
    if (archive.length === 0) {
      return <Text style={styles.empty}>{PRODUCT_PRICE_OFFER_UI.ARCHIVE_EMPTY}</Text>;
    }
    return archive.map((offer) => (
      <SellerOfferRow
        key={String(offer._id)}
        offer={offer}
        date={offer.updatedAt ?? offer.createdAt}
        statusText={resolveSellerOfferStatusLabel(offer.status)}
        onBuyerClick={openBuyer}
      />
    ));
  };

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>{PRODUCT_PRICE_OFFER_UI.SECTION_TOP_TITLE}</Text>
      {actionError ? (
        <Text style={styles.error} accessibilityRole="alert">
          {actionError}
        </Text>
      ) : null}
      {renderOffers()}
      {showArchive ? (
        <>
          <Text style={styles.heading}>
            {PRODUCT_PRICE_OFFER_UI.ARCHIVE_SECTION_TITLE}
          </Text>
          {renderArchive()}
        </>
      ) : null}
    </View>
  );
};
