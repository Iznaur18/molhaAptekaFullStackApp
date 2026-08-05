import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  CART_FULFILLMENT_SECTION_DELIVERY,
  CART_FULFILLMENT_SECTION_PICKUP,
  doProductsSupportPickup,
  doProductsSupportSellerDelivery,
} from "@molha/api-contract";

import { buildCheckoutPickupLocations } from "../../../entities/cart/lib/buildCheckoutPickupLocations.js";
import { getCartLineExclusionReason } from "../../../entities/cart/lib/getCartLineExclusionReason.js";
import { groupCartLinesByFulfillment } from "../../../entities/cart/lib/groupCartLinesByFulfillment.js";
import { selectCartCheckoutSummary } from "../../../entities/cart/lib/selectCartCheckoutSummary.js";
import { selectCartLines } from "../../../entities/cart/lib/selectCartLines.js";
import { useCart } from "../../../entities/cart/model/useCart.js";
import { useCartSelection } from "../../../entities/cart/model/useCartSelection.js";
import { useCreateOrderMutation } from "../../../entities/order/model/useCreateOrderMutation.js";
import { useAllProductsQuery } from "../../../entities/product/model/useAllProductsQuery.js";
import { navigateToProductDetails } from "../../../entities/product/lib/navigateToProductDetails.js";
import { invalidatePriceOfferQueries } from "../../../entities/product-price-offer/lib/priceOfferQueryCache.js";
import { useMyAcceptedBidsQuery } from "../../../entities/product-price-offer/model/useMyAcceptedBidsQuery.js";
import { useAuthSession } from "../../../entities/user/model/useAuthSession.js";
import { CheckoutSheetModal } from "../../../features/checkout/ui/CheckoutSheetModal.jsx";
import {
  CART_AUCTION_UI,
  CART_PAGE_UI,
  CHECKOUT_FORM_UI,
} from "../../../shared/config/appUiCopy.js";

import { CartAuctionSection } from "./CartAuctionSection.jsx";
import { CartFulfillmentSection } from "./CartFulfillmentSection.jsx";

import "./CartPage.css";

/**
 * @param {{
 *   isAuthorized: boolean;
 *   currentUserId?: string | null;
 *   onRequestLogin: () => void;
 *   onGoToCatalog: () => void;
 *   onCheckoutSuccess: () => void;
 * }} props
 */
export function CartPage({
  isAuthorized,
  currentUserId = null,
  onRequestLogin,
  onGoToCatalog,
  onCheckoutSuccess,
}) {
  const { items, clearCart, removeItems } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createOrderMutation = useCreateOrderMutation();
  const productsQuery = useAllProductsQuery();
  const acceptedBidsQuery = useMyAcceptedBidsQuery({ enabled: isAuthorized });
  const { user } = useAuthSession();

  const auctionBids = acceptedBidsQuery.data ?? [];
  const phase = productsQuery.isPending
    ? "loading"
    : productsQuery.isError
      ? "error"
      : "success";
  const error =
    productsQuery.error instanceof Error
      ? productsQuery.error.message
      : CART_PAGE_UI.LOADING;

  const defaultAddress = useMemo(() => {
    if (!isAuthorized || !user) {
      return {};
    }
    return {
      userAddress: user.userAddress,
      userAddressFlat: user.userAddressFlat,
      userAddressFiasId: user.userAddressFiasId,
      userAddressGeo: user.userAddressGeo,
    };
  }, [isAuthorized, user]);

  /** @type {"pickup" | "delivery" | null} */
  const [checkoutSection, setCheckoutSection] = useState(
    /** @type {"pickup" | "delivery" | null} */ (null),
  );
  const [auctionCheckoutBid, setAuctionCheckoutBid] = useState(
    /** @type {import('../../../entities/product-price-offer/model/types.js').PriceOfferBuyerBidRow | null} */ (
      null
    ),
  );
  const [submitState, setSubmitState] = useState({
    isSubmitting: false,
    error: "",
    success: "",
  });

  const handleProductClick = useCallback(
    (product) => {
      navigateToProductDetails(navigate, product);
    },
    [navigate],
  );

  const { lines } = useMemo(
    () => selectCartLines(items, productsQuery.data ?? []),
    [items, productsQuery.data],
  );

  const visibleLines = useMemo(
    () =>
      lines.filter(
        (line) => getCartLineExclusionReason(line, currentUserId) == null,
      ),
    [lines, currentUserId],
  );

  const { pickupLines, deliveryLines } = useMemo(
    () => groupCartLinesByFulfillment(visibleLines),
    [visibleLines],
  );

  const purchasableIds = useMemo(
    () => visibleLines.map((line) => line.productId),
    [visibleLines],
  );
  const pickupIds = useMemo(
    () => pickupLines.map((line) => line.productId),
    [pickupLines],
  );
  const deliveryIds = useMemo(
    () => deliveryLines.map((line) => line.productId),
    [deliveryLines],
  );

  const {
    deselectedIds,
    isLineSelected,
    toggleLine,
    toggleAllIn,
    areAllSelectedIn,
    selectedCountIn,
  } = useCartSelection(purchasableIds);

  const pickupSummary = useMemo(
    () => selectCartCheckoutSummary(pickupLines, currentUserId, deselectedIds),
    [pickupLines, currentUserId, deselectedIds],
  );
  const deliverySummary = useMemo(
    () =>
      selectCartCheckoutSummary(deliveryLines, currentUserId, deselectedIds),
    [deliveryLines, currentUserId, deselectedIds],
  );

  const activeSummary =
    checkoutSection === CART_FULFILLMENT_SECTION_DELIVERY
      ? deliverySummary
      : pickupSummary;

  const canCheckoutActive = activeSummary.selectedLines.length > 0;
  const isCartEmpty = lines.length === 0 && auctionBids.length === 0;
  const isCheckoutSheetOpen =
    checkoutSection != null || auctionCheckoutBid != null;

  const pickupLocations = useMemo(() => {
    if (auctionCheckoutBid) {
      const product = (productsQuery.data ?? []).find(
        (item) => String(item._id) === String(auctionCheckoutBid.productId),
      );
      return buildCheckoutPickupLocations([{ product }]);
    }
    return buildCheckoutPickupLocations(activeSummary.selectedLines);
  }, [auctionCheckoutBid, activeSummary.selectedLines, productsQuery.data]);

  const deliveryAvailable = useMemo(() => {
    if (auctionCheckoutBid) {
      const product = (productsQuery.data ?? []).find(
        (item) => String(item._id) === String(auctionCheckoutBid.productId),
      );
      return doProductsSupportSellerDelivery([product]);
    }
    return doProductsSupportSellerDelivery(
      activeSummary.selectedLines.map((line) => line.product),
    );
  }, [auctionCheckoutBid, activeSummary.selectedLines, productsQuery.data]);

  const pickupAvailable = useMemo(() => {
    if (auctionCheckoutBid) {
      const product = (productsQuery.data ?? []).find(
        (item) => String(item._id) === String(auctionCheckoutBid.productId),
      );
      return doProductsSupportPickup([product]);
    }
    return doProductsSupportPickup(
      activeSummary.selectedLines.map((line) => line.product),
    );
  }, [auctionCheckoutBid, activeSummary.selectedLines, productsQuery.data]);

  const closeCheckoutSheet = () => {
    setCheckoutSection(null);
    setAuctionCheckoutBid(null);
    setSubmitState({ isSubmitting: false, error: "", success: "" });
  };

  const openSectionCheckout = (section) => {
    setAuctionCheckoutBid(null);
    setSubmitState({ isSubmitting: false, error: "", success: "" });
    setCheckoutSection(section);
  };

  const handleOpenAuctionCheckout = (bid) => {
    setSubmitState({ isSubmitting: false, error: "", success: "" });
    setCheckoutSection(null);
    setAuctionCheckoutBid(bid);
  };

  const handleCheckoutSubmit = async ({
    fulfillmentMethod,
    deliveryAddress,
    deliveryAddressFlat,
    paymentMethod,
  }) => {
    setSubmitState({ isSubmitting: true, error: "", success: "" });

    if (auctionCheckoutBid) {
      try {
        await createOrderMutation.mutateAsync({
          items: [{ productId: auctionCheckoutBid.productId, quantity: 1 }],
          priceOfferId: auctionCheckoutBid._id,
          fulfillmentMethod,
          deliveryAddress,
          deliveryAddressFlat,
          paymentMethod,
        });
        setAuctionCheckoutBid(null);
        setSubmitState({
          isSubmitting: false,
          error: "",
          success: CART_AUCTION_UI.ORDER_PLACED,
        });
        void invalidatePriceOfferQueries(queryClient);
        onCheckoutSuccess();
      } catch (e) {
        setSubmitState({
          isSubmitting: false,
          error:
            e instanceof Error ? e.message : CHECKOUT_FORM_UI.ERROR_GENERIC,
          success: "",
        });
      }
      return;
    }

    const orderedProductIds = activeSummary.selectedLines.map(
      (line) => line.productId,
    );
    try {
      await createOrderMutation.mutateAsync({
        items: activeSummary.selectedLines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
        fulfillmentMethod,
        deliveryAddress,
        deliveryAddressFlat,
        paymentMethod,
      });
      removeItems(orderedProductIds);
      setCheckoutSection(null);
      setSubmitState({
        isSubmitting: false,
        error: "",
        success: CHECKOUT_FORM_UI.SUCCESS,
      });
      onCheckoutSuccess();
    } catch (e) {
      setSubmitState({
        isSubmitting: false,
        error: e instanceof Error ? e.message : CHECKOUT_FORM_UI.ERROR_GENERIC,
        success: "",
      });
    }
  };

  if (!isAuthorized) {
    return (
      <div className="cart-page cart-page--centered">
        <p className="cart-page__message">{CART_PAGE_UI.AUTH_REQUIRED}</p>
        <button
          type="button"
          className="cart-page__primary-action"
          onClick={onRequestLogin}
        >
          {CART_PAGE_UI.AUTH_LOGIN}
        </button>
      </div>
    );
  }

  if (phase === "loading") {
    return <p className="cart-page__state">{CART_PAGE_UI.LOADING}</p>;
  }
  if (phase === "error") {
    return (
      <p className="cart-page__state cart-page__state_error" role="alert">
        {error}
      </p>
    );
  }

  if (isCartEmpty) {
    return (
      <div className="cart-page cart-page--centered">
        <p className="cart-page__message">{CART_PAGE_UI.EMPTY}</p>
        <button
          type="button"
          className="cart-page__primary-action"
          onClick={onGoToCatalog}
        >
          {CART_PAGE_UI.GO_TO_CATALOG}
        </button>
      </div>
    );
  }

  if (visibleLines.length === 0 && auctionBids.length === 0) {
    return (
      <div className="cart-page cart-page--centered">
        <p className="cart-page__message">
          {CART_PAGE_UI.CHECKOUT_BLOCKED_ALL_UNAVAILABLE}
        </p>
        <button
          type="button"
          className="cart-page__clear-button"
          onClick={clearCart}
        >
          {CART_PAGE_UI.CLEAR_ALL}
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page cart-page--sections">
      <div className="cart-page__content">
        <CartAuctionSection
          bids={auctionBids}
          onCheckout={handleOpenAuctionCheckout}
        />

        <CartFulfillmentSection
          title={CART_PAGE_UI.SECTION_PICKUP}
          lines={pickupLines}
          selectedCount={selectedCountIn(pickupIds)}
          areAllSelected={areAllSelectedIn(pickupIds)}
          onToggleAll={() => toggleAllIn(pickupIds)}
          isLineSelected={isLineSelected}
          onToggleSelected={toggleLine}
          onProductClick={handleProductClick}
          summary={pickupSummary}
          canCheckout={pickupSummary.selectedLines.length > 0}
          onCheckout={() =>
            openSectionCheckout(CART_FULFILLMENT_SECTION_PICKUP)
          }
        />

        <CartFulfillmentSection
          title={CART_PAGE_UI.SECTION_DELIVERY}
          lines={deliveryLines}
          selectedCount={selectedCountIn(deliveryIds)}
          areAllSelected={areAllSelectedIn(deliveryIds)}
          onToggleAll={() => toggleAllIn(deliveryIds)}
          isLineSelected={isLineSelected}
          onToggleSelected={toggleLine}
          onProductClick={handleProductClick}
          summary={deliverySummary}
          canCheckout={deliverySummary.selectedLines.length > 0}
          onCheckout={() =>
            openSectionCheckout(CART_FULFILLMENT_SECTION_DELIVERY)
          }
          showDeliveryFeeNote
        />
      </div>

      <CheckoutSheetModal
        isOpen={isCheckoutSheetOpen}
        onClose={closeCheckoutSheet}
        defaultDeliveryAddress={defaultAddress}
        pickupLocations={pickupLocations}
        deliveryAvailable={deliveryAvailable}
        pickupAvailable={pickupAvailable}
        isSubmitting={submitState.isSubmitting}
        submitError={submitState.error}
        submitSuccess={submitState.success}
        isDisabled={auctionCheckoutBid == null && !canCheckoutActive}
        onSubmit={handleCheckoutSubmit}
      />
    </div>
  );
}
