import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";

import { useMyPriceOfferQuery } from "@/entities/product-price-offer/model/useMyPriceOfferQuery";
import { usePriceOfferMutations } from "@/entities/product-price-offer/model/usePriceOfferMutations";
import { useTopPriceOffersQuery } from "@/entities/product-price-offer/model/useTopPriceOffersQuery";
import { ProductPriceOfferTopList } from "@/features/product-detail/ui/ProductPriceOfferTopList";
import { API_CLIENT_UI, PRODUCT_PRICE_OFFER_UI, PRODUCT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import {
  formatRubPriceInput,
  parseRubPriceInput,
  RUB_PRICE_INPUT_MAX_DIGITS,
} from "@/shared/lib/rubPriceInput";
import { textInputFocusScrollProps } from "@/shared/lib/scrollTextInputIntoViewOnFocus";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductPriceOfferStyles } from "@/shared/theme/catalogProductStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const PRICE_OFFER_STATUS_PENDING = "pending";
const PRICE_OFFER_STATUS_ACCEPTED = "accepted";

export type ProductAuctionDockFooter = {
  onSubmit: () => void;
  disabled: boolean;
  label: string;
};

type ProductAuctionTabProps = {
  productId: string;
  auctionActive: boolean;
  completedOnce: boolean;
  isAuthorized: boolean;
  isUserDataConfirmed: boolean;
  isOwnProduct: boolean;
  dockSubmit?: boolean;
  onDockFooterChange?: (footer: ProductAuctionDockFooter | null) => void;
};

export const ProductAuctionTab = ({
  productId,
  auctionActive,
  completedOnce,
  isAuthorized,
  isUserDataConfirmed,
  isOwnProduct,
  dockSubmit = true,
  onDockFooterChange,
}: ProductAuctionTabProps) => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useProductPriceOfferStyles();
  const myOfferQueryEnabled = isAuthorized && !isOwnProduct;
  const offersQuery = useTopPriceOffersQuery(productId, auctionActive);
  const myOfferQuery = useMyPriceOfferQuery(productId, myOfferQueryEnabled);
  const { submitMutation, patchMutation, cancelMutation } = usePriceOfferMutations(productId);
  const [priceInput, setPriceInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const myOffer = myOfferQuery.data ?? null;
  const isBusy =
    submitMutation.isPending || patchMutation.isPending || cancelMutation.isPending;

  const handleSubmitOfferRef = useRef<() => Promise<void>>(async () => {});

  const handleSubmitOffer = useCallback(async () => {
    if (!isAuthorized) {
      router.push("/(auth)/login");
      return;
    }

    const price = parseRubPriceInput(priceInput);
    if (price == null || price < 1) {
      setErrorMessage("Укажите целую цену больше 0");
      return;
    }
    if (price > 10 ** RUB_PRICE_INPUT_MAX_DIGITS - 1) {
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
  }, [
    isAuthorized,
    myOffer?.status,
    myOfferQuery,
    offersQuery,
    patchMutation,
    priceInput,
    router,
    submitMutation,
  ]);

  handleSubmitOfferRef.current = handleSubmitOffer;

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

  useEffect(() => {
    if (myOffer?.offerPrice != null) {
      setPriceInput(formatRubPriceInput(myOffer.offerPrice));
      return;
    }
    if (!myOfferQueryEnabled || !myOfferQuery.isPending) {
      setPriceInput("");
    }
  }, [myOffer?._id, myOffer?.offerPrice, myOfferQuery.isPending, myOfferQueryEnabled]);

  const showForm =
    !isOwnProduct &&
    isAuthorized &&
    isUserDataConfirmed &&
    myOffer?.status !== PRICE_OFFER_STATUS_ACCEPTED;

  const offerSubmitLabel = isBusy
    ? PRODUCT_PRICE_OFFER_UI.SUBMIT_LOADING
    : myOffer?.status === PRICE_OFFER_STATUS_PENDING
      ? PRODUCT_PRICE_OFFER_UI.UPDATE
      : PRODUCT_PRICE_OFFER_UI.SUBMIT;

  const showDockPrimaryAction =
    dockSubmit && !isOwnProduct && (showForm || !isAuthorized);

  const dockLabel = !isAuthorized ? PRODUCT_PRICE_OFFER_UI.SUBMIT : offerSubmitLabel;
  const dockDisabled = isAuthorized ? isBusy : false;

  useEffect(() => {
    if (!onDockFooterChange) {
      return;
    }
    if (!auctionActive || !showDockPrimaryAction) {
      onDockFooterChange(null);
      return;
    }
    onDockFooterChange({
      onSubmit: () => {
        void handleSubmitOfferRef.current();
      },
      disabled: dockDisabled,
      label: dockLabel,
    });
  }, [
    auctionActive,
    dockDisabled,
    dockLabel,
    onDockFooterChange,
    showDockPrimaryAction,
  ]);

  useEffect(
    () => () => {
      onDockFooterChange?.(null);
    },
    [onDockFooterChange],
  );

  if (!auctionActive) {
    return (
      <Text style={styles.inactiveHint}>
        {completedOnce ? PRODUCT_UI.AUCTION_ENDED : PRODUCT_UI.AUCTION_EMPTY}
      </Text>
    );
  }

  if (offersQuery.isLoading || (myOfferQueryEnabled && myOfferQuery.isLoading)) {
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
  const hasLinkedOrder =
    myOffer?.orderId != null && String(myOffer.orderId).trim() !== "";
  const showGoToCartButton =
    myOffer?.status === PRICE_OFFER_STATUS_ACCEPTED && !hasLinkedOrder;

  const statusText =
    myOffer?.status === PRICE_OFFER_STATUS_PENDING
      ? PRODUCT_PRICE_OFFER_UI.STATUS_PENDING
      : myOffer?.status === PRICE_OFFER_STATUS_ACCEPTED
        ? hasLinkedOrder
          ? PRODUCT_PRICE_OFFER_UI.STATUS_ORDERED
          : PRODUCT_PRICE_OFFER_UI.STATUS_ACCEPTED
        : myOffer?.status === "rejected"
          ? PRODUCT_PRICE_OFFER_UI.STATUS_REJECTED
          : null;

  const statusStyle =
    myOffer?.status === PRICE_OFFER_STATUS_PENDING
      ? styles.statusPending
      : myOffer?.status === PRICE_OFFER_STATUS_ACCEPTED
        ? styles.statusAccepted
        : myOffer?.status === "rejected"
          ? styles.statusRejected
          : undefined;

  return (
    <View style={styles.root} accessibilityLabel={PRODUCT_PRICE_OFFER_UI.TAB_AUCTION}>
      <Text style={styles.pageTitle}>{PRODUCT_PRICE_OFFER_UI.TAB_AUCTION}</Text>

      {showForm ? (
        <>
          <Text style={styles.sectionLabel}>{PRODUCT_PRICE_OFFER_UI.SECTION_FORM_TITLE}</Text>
          <TextInput
            style={styles.input}
            value={priceInput}
            onChangeText={(value) => setPriceInput(formatRubPriceInput(value))}
            keyboardType="number-pad"
            editable={!isBusy}
            placeholder={PRODUCT_PRICE_OFFER_UI.INPUT_PLACEHOLDER}
            placeholderTextColor={theme.colors.textMuted}
            accessibilityLabel={PRODUCT_PRICE_OFFER_UI.LABEL_PRICE}
            {...textInputFocusScrollProps}
          />
          {myOffer?.status === PRICE_OFFER_STATUS_PENDING || !showDockPrimaryAction ? (
            <View style={styles.actions}>
              {!showDockPrimaryAction ? (
                <AppButton
                  label={offerSubmitLabel}
                  variant="contrast"
                  onPress={() => void handleSubmitOffer()}
                  disabled={isBusy}
                  style={styles.inlinePrimaryButton}
                />
              ) : null}
              {myOffer?.status === PRICE_OFFER_STATUS_PENDING ? (
                <AppButton
                  label={PRODUCT_PRICE_OFFER_UI.CANCEL}
                  variant="cancel"
                  onPress={() => void handleCancel()}
                  disabled={isBusy}
                  style={styles.inlinePrimaryButton}
                />
              ) : null}
            </View>
          ) : null}
        </>
      ) : null}

      {!isOwnProduct && !isAuthorized && !showDockPrimaryAction ? (
        <AppButton
          label={PRODUCT_PRICE_OFFER_UI.SUBMIT}
          variant="contrast"
          onPress={() => router.push("/(auth)/login")}
          style={styles.inlinePrimaryButton}
        />
      ) : null}

      {!isOwnProduct && isAuthorized && !isUserDataConfirmed ? (
        <Text style={styles.hint}>{PRODUCT_PRICE_OFFER_UI.CONFIRMED_DATA_REQUIRED}</Text>
      ) : null}

      {statusText ? <Text style={[styles.status, statusStyle]}>{statusText}</Text> : null}

      {showGoToCartButton ? (
        <AppButton
          label={PRODUCT_PRICE_OFFER_UI.GO_TO_CART}
          variant="contrast"
          onPress={() => router.push("/(tabs)/cart")}
          style={styles.inlinePrimaryButton}
        />
      ) : null}

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Text style={styles.sectionLabel}>{PRODUCT_PRICE_OFFER_UI.SECTION_TOP_TITLE}</Text>
      <ProductPriceOfferTopList
        top={offers}
        highlightedOfferId={myOffer?._id ?? null}
      />
    </View>
  );
};
