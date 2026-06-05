import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AddToCartButton } from "../../../features/cart-add/ui/AddToCartButton.jsx";
import { recordProductView } from "../api/recordProductView.js";
import { COMMON_UI, PRODUCT_DETAILS_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { formatProductFieldForDisplay } from "../lib/formatProductFieldForDisplay.js";
import { resolveProductImageUrls } from "../lib/resolveProductImageUrls.js";
import { resolveProductPreviewVideoUrl } from "../lib/resolveProductPreviewVideoUrl.js";
import {
  PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS,
  PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS_STAFF,
  PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS,
  PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS_ADMIN,
} from "../model/productConstants.js";
import {
  getProductDetailsModalRowClassName,
  getProductDetailsModalValueClassName,
  getProductFieldLabel,
  getProductFieldReadLayout,
} from "../lib/productFieldRegistry.js";
import { ProductMediaGalleryReadonly } from "./ProductMediaGalleryReadonly.jsx";
import { ProductDetailsSellerPreview } from "./ProductDetailsSellerPreview.jsx";
import { ProductCharacteristicsDetails } from "./ProductCharacteristicsDetails.jsx";
import { ProductPriceDisplay } from "./ProductPriceDisplay.jsx";
import { fetchCurrentUserProfile } from "../../user/api/fetchCurrentUserProfile.js";
import { isCurrentUserProductSeller } from "../lib/isCurrentUserProductSeller.js";
import { fetchTopPriceOffers } from "../../product-price-offer/api/fetchTopPriceOffers.js";
import { ProductPriceOfferBuyerBlock } from "../../product-price-offer/ui/ProductPriceOfferBuyerBlock.jsx";
import { ProductPriceOfferHintMessage } from "../../product-price-offer/ui/ProductPriceOfferHintMessage.jsx";
import { ProductPriceOfferSellerTab } from "../../product-price-offer/ui/ProductPriceOfferSellerTab.jsx";
import { ProductPriceOfferSellerArchive } from "../../product-price-offer/ui/ProductPriceOfferSellerArchive.jsx";
import { resolveAuctionUiState } from "../lib/resolveAuctionUiState.js";
import { resolveInstallmentUiState } from "../../installment/lib/resolveInstallmentUiState.js";
import { fetchProductInstallmentProgram } from "../../installment/api/installmentApi.js";
import { InstallmentBuyerBlock } from "../../installment/ui/InstallmentBuyerBlock.jsx";
import {
  INSTALLMENT_MODERATION_PENDING,
  INSTALLMENT_MODERATION_REJECTED,
} from "../../installment/model/constants.js";
import { getProductPurchaseLimit } from "../lib/getProductPurchaseLimit.js";
import { PRODUCT_MODERATION_APPROVED } from "../model/productModerationConstants.js";
import { ProductReviewsSection } from "../../product-review/ui/ProductReviewsSection.jsx";
import {
  PRODUCT_PRICE_OFFER_UI,
  PRODUCT_REVIEW_UI,
  INSTALLMENT_UI,
} from "../../../shared/config/appUiCopy.js";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";

import "./ProductDetailsModal.css";
import "../../product-price-offer/ui/ProductPriceOffer.css";

/**
 * @param {import("../model/types.js").ProductFromApi} product
 * @param {readonly string[]} keys
 * @param {{ onClose: () => void; onSellerNameClick?: (userId: string) => void }} handlers
 */
function renderFieldRows(product, keys, handlers) {
  const { onClose, onSellerNameClick } = handlers;
  const imageUrls = resolveProductImageUrls(product);

  return keys.map((key) => {
    const raw = product[key];
    const display = formatProductFieldForDisplay(key, product);
    const canOpenSellerProfile =
      key === "productSeller" &&
      typeof onSellerNameClick === "function" &&
      raw != null &&
      typeof raw === "object" &&
      raw._id != null &&
      display !== COMMON_UI.EM_DASH;

    const ddClass = getProductDetailsModalValueClassName(key);

    let valueNode;
    if (canOpenSellerProfile) {
      valueNode = (
        <button
          type="button"
          className="product-details-modal__seller-link"
          onClick={() => {
            onClose();
            onSellerNameClick(String(raw._id));
          }}
        >
          {display}
        </button>
      );
    } else if (key === "productImageUrls" && imageUrls.length > 0) {
      valueNode = (
        <ul className="product-details-modal__image-url-list">
          {imageUrls.map((url, index) => (
            <li key={`${index}-${url}`}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="product-details-modal__image-url-link"
              >
                {url}
              </a>
            </li>
          ))}
        </ul>
      );
    } else {
      valueNode = display;
    }

    return (
      <div key={key} className={getProductDetailsModalRowClassName(key)}>
        <dt className="product-details-modal__key">{getProductFieldLabel(key)}</dt>
        <dd className={ddClass}>{valueNode}</dd>
      </div>
    );
  });
}

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   product: import("../model/types.js").ProductFromApi | null;
 *   onSellerNameClick?: (userId: string) => void;
 *   isAuthorized?: boolean;
 *   onProductStatsUpdate?: (
 *     productId: string,
 *     stats: {
 *       uniqueViewerCount?: number;
 *       averageRating?: number;
 *       reviewCount?: number;
 *     },
 *   ) => void;
 *   adminFooter?: import('react').ReactNode;
 *   showStaffDetails?: boolean;
 *   showAddToCart?: boolean;
 *   onRequestLogin?: () => void;
 *   secondaryFooter?: import('react').ReactNode;
 *   currentUserId?: string | null;
 *   initialDetailsTab?: 'details' | 'auction' | 'reviews' | 'installment';
 *   isPremiumUser?: boolean;
 *   onProfileActionBadgesChanged?: () => void;
 * }} props
 */
export function ProductDetailsModal({
  isOpen,
  onClose,
  product,
  onSellerNameClick,
  isAuthorized = false,
  onProductStatsUpdate,
  adminFooter = null,
  secondaryFooter = null,
  showStaffDetails = false,
  showAddToCart = false,
  onRequestLogin = () => {},
  currentUserId = null,
  initialDetailsTab = "details",
  isPremiumUser = false,
  onProfileActionBadgesChanged,
}) {
  const imageUrls = useMemo(
    () => (product ? resolveProductImageUrls(product) : []),
    [product],
  );
  const previewVideoUrl = useMemo(
    () => (product ? resolveProductPreviewVideoUrl(product) : null),
    [product],
  );
  const [galleryLightboxOpen, setGalleryLightboxOpen] = useState(false);
  const [detailsTab, setDetailsTab] = useState(
    /** @type {'details' | 'auction' | 'reviews' | 'installment'} */ (
      initialDetailsTab
    ),
  );
  const [installmentProgram, setInstallmentProgram] = useState(
    /** @type {import('../../installment/model/types.js').InstallmentProgramFromApi | null} */ (
      null
    ),
  );
  const [isInstallmentProgramLoading, setIsInstallmentProgramLoading] = useState(false);
  const [topOffers, setTopOffers] = useState(
    /** @type {import('../../product-price-offer/model/types.js').PriceOfferTopEntry[]} */ ([]),
  );
  const [isUserDataConfirmed, setIsUserDataConfirmed] = useState(false);
  const modalBodyRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const tabPanelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [tabPanelMinHeight, setTabPanelMinHeight] = useState(0);

  const isOwnProduct =
    product != null && isCurrentUserProductSeller(product, currentUserId);
  const isSellerView = isOwnProduct;

  const auctionUi = useMemo(() => resolveAuctionUiState(product), [product]);
  const installmentUi = useMemo(
    () => resolveInstallmentUiState(product, installmentProgram),
    [product, installmentProgram],
  );
  const showReviewsTab =
    product?._id != null &&
    (product.productModerationStatus === PRODUCT_MODERATION_APPROVED || isSellerView);
  const showAuctionTab =
    product?._id != null &&
    (isSellerView
      ? auctionUi.showSellerAuctionTab
      : product.productAuctionEnabled === true);
  const showInstallmentTab =
    product?._id != null &&
    (isSellerView
      ? installmentUi.showInstallmentTab
      : product.productInstallmentEnabled === true || installmentUi.installmentActive);
  const showProductDetailsTabs = showAuctionTab || showReviewsTab || showInstallmentTab;

  const reloadTopOffers = useCallback(async () => {
    if (!product?._id || !auctionUi.auctionActive) {
      setTopOffers([]);
      return;
    }
    try {
      const top = await fetchTopPriceOffers(String(product._id));
      setTopOffers(top);
    } catch {
      setTopOffers([]);
    }
  }, [product?._id, auctionUi.auctionActive]);

  const handleReviewStatsChange = useCallback(
    (stats) => {
      if (!product?._id) {
        return;
      }
      onProductStatsUpdate?.(String(product._id), stats);
    },
    [onProductStatsUpdate, product?._id],
  );

  const handleAuctionShortcutClick = useCallback(() => {
    if (!auctionUi.auctionActive) {
      return;
    }
    setDetailsTab("auction");
  }, [auctionUi.auctionActive]);

  const handleInstallmentShortcutClick = useCallback(() => {
    if (!installmentUi.installmentActive) {
      return;
    }
    setDetailsTab("installment");
  }, [installmentUi.installmentActive]);

  const reloadInstallmentProgram = useCallback(async () => {
    if (!product?._id) {
      setInstallmentProgram(null);
      return;
    }
    setIsInstallmentProgramLoading(true);
    try {
      const program = await fetchProductInstallmentProgram(String(product._id));
      setInstallmentProgram(program);
    } catch {
      setInstallmentProgram(null);
    } finally {
      setIsInstallmentProgramLoading(false);
    }
  }, [product?._id]);

  useEffect(() => {
    setGalleryLightboxOpen(false);
    setDetailsTab(initialDetailsTab);
    setTabPanelMinHeight(0);
    setInstallmentProgram(null);
  }, [product?._id, initialDetailsTab]);

  useEffect(() => {
    if (!isOpen || !product) {
      return;
    }
    const showReviews =
      product._id != null &&
      (product.productModerationStatus === PRODUCT_MODERATION_APPROVED || isOwnProduct);
    const showAuction = product._id != null && product.productAuctionEnabled === true;
    const showInstallment =
      product._id != null &&
      (product.productInstallmentEnabled === true || installmentUi.installmentActive);
    if (detailsTab === "reviews" && !showReviews) {
      setDetailsTab("details");
    }
    if (detailsTab === "auction" && !showAuction) {
      setDetailsTab("details");
    }
    if (detailsTab === "installment" && !showInstallment) {
      setDetailsTab("details");
    }
  }, [
    detailsTab,
    isOpen,
    isOwnProduct,
    product,
    product?.productAuctionEnabled,
    product?.productInstallmentEnabled,
    product?.productModerationStatus,
    product?._id,
    installmentUi.installmentActive,
  ]);

  useEffect(() => {
    if (!isOpen || !product?._id || !showInstallmentTab) {
      setInstallmentProgram(null);
      return undefined;
    }
    void reloadInstallmentProgram();
    return undefined;
  }, [isOpen, product?._id, showInstallmentTab, reloadInstallmentProgram]);

  useEffect(() => {
    if (!isOpen || !product?._id || !auctionUi.auctionActive) {
      setTopOffers([]);
      return undefined;
    }
    void reloadTopOffers();
    return undefined;
  }, [isOpen, product?._id, auctionUi.auctionActive, reloadTopOffers]);

  useEffect(() => {
    if (!isOpen || !isAuthorized) {
      setIsUserDataConfirmed(false);
      return undefined;
    }
    let isCancelled = false;
    void (async () => {
      try {
        const { user } = await fetchCurrentUserProfile();
        if (!isCancelled) {
          setIsUserDataConfirmed(user?.isUserDataConfirmed === true);
        }
      } catch {
        if (!isCancelled) setIsUserDataConfirmed(false);
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, isAuthorized]);

  useEffect(() => {
    if (!isOpen || !product?._id || !isAuthorized) return undefined;
    let cancelled = false;
    void (async () => {
      try {
        const { uniqueViewerCount } = await recordProductView(String(product._id));
        if (cancelled) return;
        onProductStatsUpdate?.(String(product._id), { uniqueViewerCount });
      } catch {
        // метрика не должна ломать модалку
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, product?._id, isAuthorized, onProductStatsUpdate]);

  useEffect(() => {
    if (!isOpen || galleryLightboxOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [galleryLightboxOpen, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !showProductDetailsTabs) return undefined;
    const panel = tabPanelRef.current;
    if (!panel) return undefined;
    const nextHeight = panel.scrollHeight;
    if (nextHeight > tabPanelMinHeight) {
      setTabPanelMinHeight(nextHeight);
    }
    return undefined;
  }, [isOpen, showProductDetailsTabs, detailsTab, tabPanelMinHeight, product?._id]);

  if (!isOpen || !product) return null;

  const topRowFieldKeys = showStaffDetails
    ? PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS_ADMIN
    : PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS;
  const bottomRowFieldKeys = showStaffDetails
    ? PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS_STAFF
    : PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS;
  const fieldHandlers = { onClose, onSellerNameClick };
  const handleOpenSellerProfile =
    typeof onSellerNameClick === "function"
      ? (userId) => {
          onClose();
          onSellerNameClick(userId);
        }
      : undefined;
  const topStatFieldKeys = topRowFieldKeys.filter((key) => key !== "productPrice");
  const bottomBlockFieldKeys = bottomRowFieldKeys.filter(
    (key) => getProductFieldReadLayout(key) === "block",
  );
  const bottomMetaFieldKeys = bottomRowFieldKeys.filter(
    (key) => getProductFieldReadLayout(key) === "meta",
  );
  const purchaseLimit = getProductPurchaseLimit(product);
  const canShowAddToCart =
    showAddToCart && product._id != null && !isOwnProduct && purchaseLimit > 0;

  const reviewCount = Number(product.reviewCount) || 0;
  const reviewsTabLabel =
    reviewCount > 0
      ? PRODUCT_REVIEW_UI.TAB_REVIEWS_WITH_COUNT(reviewCount)
      : PRODUCT_REVIEW_UI.TAB_REVIEWS;

  const title = product.productName?.trim() || "Товар";

  const modalFooter =
    secondaryFooter || adminFooter ? (
      <>
        {secondaryFooter}
        {adminFooter}
      </>
    ) : null;

  return (
    <>
      <ProductModalShell
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        titleId="product-details-modal-title"
        size="lg"
        panelClassName="product-details-modal"
        bodyClassName="product-details-modal__body"
        bodyRef={modalBodyRef}
        footer={modalFooter}
        footerClassName="product-details-modal__footer"
        closeOnEscape={false}
      >
            {showProductDetailsTabs ? (
              <div className="product-details-modal__tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={detailsTab === "details"}
                  className={
                    detailsTab === "details"
                      ? "product-details-modal__tab product-details-modal__tab_active"
                      : "product-details-modal__tab"
                  }
                  onClick={() => setDetailsTab("details")}
                >
                  {PRODUCT_PRICE_OFFER_UI.TAB_DETAILS}
                </button>
                {showAuctionTab ? (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={detailsTab === "auction"}
                    className={
                      detailsTab === "auction"
                        ? "product-details-modal__tab product-details-modal__tab_active"
                        : "product-details-modal__tab"
                    }
                    onClick={() => setDetailsTab("auction")}
                  >
                    {PRODUCT_PRICE_OFFER_UI.TAB_AUCTION}
                  </button>
                ) : null}
                {showInstallmentTab ? (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={detailsTab === "installment"}
                    className={
                      detailsTab === "installment"
                        ? "product-details-modal__tab product-details-modal__tab_active"
                        : "product-details-modal__tab"
                    }
                    onClick={() => setDetailsTab("installment")}
                  >
                    {INSTALLMENT_UI.TAB}
                  </button>
                ) : null}
                {showReviewsTab ? (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={detailsTab === "reviews"}
                    className={
                      detailsTab === "reviews"
                        ? "product-details-modal__tab product-details-modal__tab_active"
                        : "product-details-modal__tab"
                    }
                    onClick={() => setDetailsTab("reviews")}
                  >
                    {reviewsTabLabel}
                  </button>
                ) : null}
              </div>
            ) : null}

            <div
              ref={tabPanelRef}
              className="product-details-modal__tab-panel"
              style={
                showProductDetailsTabs && tabPanelMinHeight > 0
                  ? { minHeight: `${tabPanelMinHeight}px` }
                  : undefined
              }
            >
              {detailsTab === "reviews" && showReviewsTab ? (
                <ProductReviewsSection
                  productId={String(product._id)}
                  isAuthorized={isAuthorized}
                  isUserDataConfirmed={isUserDataConfirmed}
                  isOwnProduct={isOwnProduct}
                  embeddedInTab
                  onRequestLogin={onRequestLogin}
                  onStatsChange={handleReviewStatsChange}
                />
              ) : detailsTab === "auction" && showAuctionTab ? (
                isSellerView ? (
                  <ProductPriceOfferSellerTab
                    productId={String(product._id)}
                    onOpenBuyer={handleOpenSellerProfile}
                    onChanged={() => {
                      void reloadTopOffers();
                      onProfileActionBadgesChanged?.();
                    }}
                  />
                ) : (
                  <section
                    id="product-details-auction"
                    className="product-details-modal__auction-section"
                    aria-label={PRODUCT_PRICE_OFFER_UI.TAB_AUCTION}
                  >
                    {auctionUi.auctionActive ? (
                      <ProductPriceOfferBuyerBlock
                        productId={String(product._id)}
                        isAuthorized={isAuthorized}
                        isUserDataConfirmed={isUserDataConfirmed}
                        isOwnProduct={isOwnProduct}
                        top={topOffers}
                        onOpenBuyer={handleOpenSellerProfile}
                        onRequestLogin={onRequestLogin}
                        onOffersChanged={() => {
                          void reloadTopOffers();
                          onProfileActionBadgesChanged?.();
                        }}
                      />
                    ) : auctionUi.buyerMessage === "ended" ? (
                      <p className="product-price-offer__hint">
                        {PRODUCT_PRICE_OFFER_UI.AUCTION_ENDED}
                      </p>
                    ) : auctionUi.buyerMessage === "notHeld" ? (
                      <ProductPriceOfferHintMessage>
                        {PRODUCT_PRICE_OFFER_UI.AUCTION_NOT_HELD}
                      </ProductPriceOfferHintMessage>
                    ) : null}
                  </section>
                )
              ) : detailsTab === "installment" && showInstallmentTab ? (
                isSellerView ? (
                  <section className="product-details-modal__installment-section">
                    {isInstallmentProgramLoading ? (
                      <p>{INSTALLMENT_UI.ACTION_PENDING}</p>
                    ) : installmentProgram?.moderationStatus ===
                      INSTALLMENT_MODERATION_PENDING ? (
                      <p>{INSTALLMENT_UI.MODERATION_PENDING}</p>
                    ) : installmentProgram?.moderationStatus ===
                      INSTALLMENT_MODERATION_REJECTED ? (
                      <p>{INSTALLMENT_UI.MODERATION_REJECTED}</p>
                    ) : installmentUi.installmentActive ? (
                      <p>{INSTALLMENT_UI.MODERATION_APPROVED}</p>
                    ) : (
                      <p>{INSTALLMENT_UI.SELLER_TAB_HINT}</p>
                    )}
                  </section>
                ) : installmentUi.installmentActive && installmentProgram ? (
                  <InstallmentBuyerBlock
                    product={product}
                    program={installmentProgram}
                    isAuthorized={isAuthorized}
                    isUserDataConfirmed={isUserDataConfirmed}
                    onRequestLogin={onRequestLogin}
                    onSuccess={() => {
                      void reloadInstallmentProgram();
                      onProfileActionBadgesChanged?.();
                    }}
                  />
                ) : isInstallmentProgramLoading ? (
                  <p>{INSTALLMENT_UI.ACTION_PENDING}</p>
                ) : (
                  <p>{INSTALLMENT_UI.MODERATION_PENDING}</p>
                )
              ) : (
                <>
                  <div className="product-details-modal__row-top">
                    <ProductMediaGalleryReadonly
                      imageUrls={imageUrls}
                      previewVideoUrl={previewVideoUrl}
                      isActive={isOpen}
                      resetToken={product._id}
                      onLightboxOpenChange={setGalleryLightboxOpen}
                    />
                    <div className="product-details-modal__spec">
                      {topRowFieldKeys.includes("productPrice") ? (
                        <div className="product-details-modal__price-block">
                          <ProductPriceDisplay
                            product={product}
                            className="product-details-modal__price-display"
                          />
                          <div
                            className={
                              canShowAddToCart
                                ? "product-details-modal__price-actions"
                                : "product-details-modal__price-actions product-details-modal__price-actions--no-cart"
                            }
                          >
                            {canShowAddToCart ? (
                              <div className="product-details-modal__price-actions-cart">
                                <AddToCartButton
                                  productId={String(product._id)}
                                  isAuthorized={isAuthorized}
                                  onRequestLogin={onRequestLogin}
                                  maxQuantity={purchaseLimit}
                                />
                              </div>
                            ) : null}
                            <button
                              type="button"
                              className={
                                auctionUi.auctionActive
                                  ? "product-details-modal__auction-btn"
                                  : "product-details-modal__auction-btn product-details-modal__auction-btn--inactive"
                              }
                              disabled={!auctionUi.auctionActive}
                              aria-disabled={!auctionUi.auctionActive}
                              onClick={handleAuctionShortcutClick}
                            >
                              {PRODUCT_PRICE_OFFER_UI.AUCTION_SHORTCUT}
                            </button>
                            <button
                              type="button"
                              className={
                                installmentUi.installmentActive
                                  ? "product-details-modal__auction-btn"
                                  : "product-details-modal__auction-btn product-details-modal__auction-btn--inactive"
                              }
                              disabled={!installmentUi.installmentActive}
                              aria-disabled={!installmentUi.installmentActive}
                              onClick={handleInstallmentShortcutClick}
                            >
                              {INSTALLMENT_UI.SHORTCUT}
                            </button>
                          </div>
                        </div>
                      ) : null}
                      {topStatFieldKeys.length > 0 ? (
                        <dl className="product-details-modal__stats-grid">
                          {renderFieldRows(product, topStatFieldKeys, fieldHandlers)}
                        </dl>
                      ) : null}
                    </div>
                  </div>

                  <ProductDetailsSellerPreview
                    seller={product.productSeller}
                    onOpenProfile={handleOpenSellerProfile}
                  />

                  {(bottomBlockFieldKeys.length > 0 ||
                    bottomMetaFieldKeys.length > 0 ||
                    (Array.isArray(product.productCharacteristics) &&
                      product.productCharacteristics.length > 0)) && (
                    <section
                      className="product-details-modal__details"
                      aria-label={PRODUCT_DETAILS_MODAL_UI.DETAILS_SECTION_ARIA}
                    >
                      {bottomBlockFieldKeys.length > 0 ? (
                        <dl className="product-details-modal__blocks">
                          {renderFieldRows(
                            product,
                            bottomBlockFieldKeys,
                            fieldHandlers,
                          )}
                        </dl>
                      ) : null}
                      <ProductCharacteristicsDetails
                        items={product.productCharacteristics}
                      />
                      {bottomMetaFieldKeys.length > 0 ? (
                        <dl className="product-details-modal__meta-grid">
                          {renderFieldRows(product, bottomMetaFieldKeys, fieldHandlers)}
                        </dl>
                      ) : null}
                    </section>
                  )}

                  {isSellerView && auctionUi.showSellerArchive ? (
                    <ProductPriceOfferSellerArchive
                      productId={String(product._id)}
                      onOpenBuyer={handleOpenSellerProfile}
                    />
                  ) : null}
                </>
              )}
            </div>
      </ProductModalShell>
    </>
  );
}
