import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { formatOfferPrice } from "@/entities/product-price-offer/api/fetchTopPriceOffers";
import { useMyPriceOfferQuery } from "@/entities/product-price-offer/model/useMyPriceOfferQuery";
import { usePriceOfferMutations } from "@/entities/product-price-offer/model/usePriceOfferMutations";
import { useTopPriceOffersQuery } from "@/entities/product-price-offer/model/useTopPriceOffersQuery";
import { API_CLIENT_UI, PRODUCT_PRICE_OFFER_UI, PRODUCT_UI } from "@/shared/config";
import { formatApiErrorMessage, formatPriceRub } from "@/shared/lib";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const PRICE_OFFER_STATUS_PENDING = "pending";
const PRICE_OFFER_STATUS_ACCEPTED = "accepted";
const PRICE_MAX = 999_999_999;

type ProductAuctionTabProps = {
  productId: string;
  auctionActive: boolean;
  completedOnce: boolean;
  productPrice?: number;
  isAuthorized: boolean;
  isUserDataConfirmed: boolean;
  isOwnProduct: boolean;
};

const parseOfferPrice = (value: string): number | null => {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return null;
  }
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

export const ProductAuctionTab = ({
  productId,
  auctionActive,
  completedOnce,
  productPrice,
  isAuthorized,
  isUserDataConfirmed,
  isOwnProduct,
}: ProductAuctionTabProps) => {
  const router = useRouter();
  const offersQuery = useTopPriceOffersQuery(productId, auctionActive);
  const myOfferQuery = useMyPriceOfferQuery(productId, isAuthorized && !isOwnProduct);
  const { submitMutation, patchMutation, cancelMutation } = usePriceOfferMutations(productId);
  const [priceInput, setPriceInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!auctionActive) {
    return (
      <Text style={styles.message}>
        {completedOnce ? PRODUCT_UI.AUCTION_ENDED : PRODUCT_UI.AUCTION_EMPTY}
      </Text>
    );
  }

  if (offersQuery.isPending || (isAuthorized && myOfferQuery.isPending)) {
    return <ScreenLoadingState />;
  }

  if (offersQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(
          offersQuery.error,
          API_CLIENT_UI.FETCH_TOP_PRICE_OFFERS_FALLBACK,
        )}
        onRetry={() => offersQuery.refetch()}
      />
    );
  }

  const offers = offersQuery.data ?? [];
  const myOffer = myOfferQuery.data ?? null;
  const isBusy =
    submitMutation.isPending || patchMutation.isPending || cancelMutation.isPending;

  const handleSubmitOffer = async () => {
    const price = parseOfferPrice(priceInput);
    if (price == null || price < 1) {
      setErrorMessage("Укажите целую цену больше 0");
      return;
    }
    if (price > PRICE_MAX) {
      setErrorMessage(PRODUCT_PRICE_OFFER_UI.ERROR_PRICE_MAX);
      return;
    }

    setErrorMessage("");
    try {
      if (myOffer?.status === PRICE_OFFER_STATUS_PENDING) {
        await patchMutation.mutateAsync(price);
      } else {
        await submitMutation.mutateAsync(price);
      }
      void offersQuery.refetch();
      void myOfferQuery.refetch();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : PRODUCT_PRICE_OFFER_UI.SUBMIT,
      );
    }
  };

  const handleCancel = async () => {
    setErrorMessage("");
    try {
      await cancelMutation.mutateAsync();
      setPriceInput("");
      void offersQuery.refetch();
      void myOfferQuery.refetch();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : PRODUCT_PRICE_OFFER_UI.CANCEL,
      );
    }
  };

  const showForm =
    !isOwnProduct &&
    isAuthorized &&
    isUserDataConfirmed &&
    myOffer?.status !== PRICE_OFFER_STATUS_ACCEPTED;

  const statusText =
    myOffer?.status === PRICE_OFFER_STATUS_PENDING
      ? PRODUCT_PRICE_OFFER_UI.STATUS_PENDING
      : myOffer?.status === PRICE_OFFER_STATUS_ACCEPTED
        ? PRODUCT_PRICE_OFFER_UI.STATUS_ACCEPTED
        : myOffer?.status === "rejected"
          ? PRODUCT_PRICE_OFFER_UI.STATUS_REJECTED
          : null;

  return (
    <View style={styles.root}>
      {productPrice != null ? (
        <Text style={styles.currentPrice}>Текущая цена: {formatPriceRub(productPrice)}</Text>
      ) : null}
      {offers.length === 0 ? (
        <Text style={styles.message}>Предложений пока нет</Text>
      ) : (
        offers.map((offer) => (
          <View key={offer._id} style={styles.offer}>
            <Text style={styles.offerPrice}>{formatOfferPrice(offer.offerPriceRub)}</Text>
            {offer.buyerUserName ? (
              <Text style={styles.offerBuyer}>{offer.buyerUserName}</Text>
            ) : null}
          </View>
        ))
      )}

      {!isOwnProduct ? (
        <>
          {showForm ? (
            <View style={styles.form}>
              <Text style={styles.formTitle}>{PRODUCT_PRICE_OFFER_UI.SECTION_FORM_TITLE}</Text>
              <Text style={styles.label}>{PRODUCT_PRICE_OFFER_UI.LABEL_PRICE}</Text>
              <TextInput
                style={styles.input}
                value={priceInput}
                onChangeText={setPriceInput}
                keyboardType="number-pad"
                editable={!isBusy}
              />
              <View style={styles.actions}>
                <Pressable
                  style={[styles.primaryButton, isBusy && styles.disabled]}
                  onPress={() => {
                    void handleSubmitOffer();
                  }}
                  disabled={isBusy}
                >
                  {isBusy ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {myOffer?.status === PRICE_OFFER_STATUS_PENDING
                        ? PRODUCT_PRICE_OFFER_UI.UPDATE
                        : PRODUCT_PRICE_OFFER_UI.SUBMIT}
                    </Text>
                  )}
                </Pressable>
                {myOffer?.status === PRICE_OFFER_STATUS_PENDING ? (
                  <Pressable
                    style={[styles.secondaryButton, isBusy && styles.disabled]}
                    onPress={() => {
                      void handleCancel();
                    }}
                    disabled={isBusy}
                  >
                    <Text style={styles.secondaryButtonText}>
                      {PRODUCT_PRICE_OFFER_UI.CANCEL}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : null}

          {!isAuthorized ? (
            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.primaryButtonText}>
                {PRODUCT_PRICE_OFFER_UI.LOGIN_TO_BID}
              </Text>
            </Pressable>
          ) : null}

          {isAuthorized && !isUserDataConfirmed && !isOwnProduct ? (
            <Text style={styles.hint}>{PRODUCT_PRICE_OFFER_UI.CONFIRMED_DATA_REQUIRED}</Text>
          ) : null}

          {statusText ? <Text style={styles.status}>{statusText}</Text> : null}
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: 10,
    paddingTop: 8,
  },
  currentPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  message: {
    fontSize: 15,
    color: "#666",
    paddingTop: 8,
  },
  offer: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    gap: 4,
  },
  offerPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  offerBuyer: {
    fontSize: 13,
    color: "#666",
  },
  form: {
    marginTop: 8,
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#111",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 40,
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#111",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: "#111",
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.6,
  },
  hint: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  status: {
    fontSize: 14,
    color: "#2e7d32",
    fontWeight: "600",
  },
  error: {
    fontSize: 13,
    color: "#c62828",
  },
});
