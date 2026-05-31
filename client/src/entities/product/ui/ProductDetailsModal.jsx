import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { AddToCartButton } from "../../../features/cart-add/ui/AddToCartButton.jsx";
import { recordProductView } from "../api/recordProductView.js";
import {
  COMMON_UI,
  PRODUCT_CARD_UI,
  PRODUCT_DETAILS_MODAL_UI,
  USER_DETAILS_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";
import { formatProductFieldForDisplay } from "../lib/formatProductFieldForDisplay.js";
import { resolveProductImageUrls } from "../lib/resolveProductImageUrls.js";
import {
  buildProductMediaSlides,
  resolveProductImageIndexForLightbox,
} from "../lib/buildProductMediaSlides.js";
import { resolveProductPreviewVideoUrl } from "../lib/resolveProductPreviewVideoUrl.js";
import { ProductMediaSlideContent } from "./ProductMediaSlideContent.jsx";
import {
  PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS,
  PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS_STAFF,
  PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS,
  PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS_ADMIN,
  PRODUCT_FIELD_LABEL_RU,
  PRODUCT_IMAGE_PLACEHOLDER_URL,
} from "../model/productConstants.js";
import { ProductImageLightbox } from "./ProductImageLightbox.jsx";
import { ProductDetailsSellerPreview } from "./ProductDetailsSellerPreview.jsx";
import { ProductPriceDisplay } from "./ProductPriceDisplay.jsx";
import { fetchCurrentUserProfile } from "../../user/api/fetchCurrentUserProfile.js";
import { isCurrentUserProductSeller } from "../lib/isCurrentUserProductSeller.js";
import { fetchTopPriceOffers } from "../../product-price-offer/api/fetchTopPriceOffers.js";
import { ProductPriceOfferBuyerBlock } from "../../product-price-offer/ui/ProductPriceOfferBuyerBlock.jsx";
import { ProductPriceOfferHintMessage } from "../../product-price-offer/ui/ProductPriceOfferHintMessage.jsx";
import { ProductPriceOfferSellerTab } from "../../product-price-offer/ui/ProductPriceOfferSellerTab.jsx";
import { ProductPriceOfferSellerArchive } from "../../product-price-offer/ui/ProductPriceOfferSellerArchive.jsx";
import { resolveAuctionUiState } from "../lib/resolveAuctionUiState.js";
import { getProductPurchaseLimit } from "../lib/getProductPurchaseLimit.js";
import { PRODUCT_MODERATION_APPROVED } from "../model/productModerationConstants.js";
import { ProductReviewsSection } from "../../product-review/ui/ProductReviewsSection.jsx";
import {
  PRODUCT_PRICE_OFFER_UI,
  PRODUCT_REVIEW_UI,
} from "../../../shared/config/appUiCopy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { ModalCloseIcon } from "../../../shared/ui/icon/index.js";

import "./ProductDetailsModal.css";
import "../../product-price-offer/ui/ProductPriceOffer.css";

const PRODUCT_DETAILS_STAT_FIELD_KEYS = new Set([
  "productCategory",
  "productStockQuantity",
  "soldQuantity",
  "uniqueViewerCount",
]);

const PRODUCT_DETAILS_BLOCK_FIELD_KEYS = new Set([
  "productDescription",
  "productModerationComment",
  "productImageUrls",
]);

const PRODUCT_DETAILS_META_FIELD_KEYS = new Set([
  "_id",
  "createdAt",
  "updatedAt",
]);

/**
 * @param {string} key
 */
function getProductDetailsRowClassName(key) {
  const classes = ["product-details-modal__row"];
  if (key === "productPrice") {
    classes.push("product-details-modal__row--price");
  } else if (PRODUCT_DETAILS_STAT_FIELD_KEYS.has(key)) {
    classes.push("product-details-modal__row--stat");
  } else if (PRODUCT_DETAILS_BLOCK_FIELD_KEYS.has(key)) {
    classes.push("product-details-modal__row--block");
  } else if (PRODUCT_DETAILS_META_FIELD_KEYS.has(key)) {
    classes.push("product-details-modal__row--meta");
  }
  return classes.join(" ");
}

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

    const ddClass =
      key === "productDescription" ||
      key === "productModerationComment" ||
      key === "productImageUrls"
        ? "product-details-modal__value product-details-modal__value--multiline"
        : "product-details-modal__value";

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
      <div key={key} className={getProductDetailsRowClassName(key)}>
        <dt className="product-details-modal__key">
          {PRODUCT_FIELD_LABEL_RU[key] ?? key}
        </dt>
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
}) {
  const imageUrls = useMemo(
    () => (product ? resolveProductImageUrls(product) : []),
    [product],
  );
  const previewVideoUrl = useMemo(
    () => (product ? resolveProductPreviewVideoUrl(product) : null),
    [product],
  );
  const [previewVideoFailed, setPreviewVideoFailed] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [detailsTab, setDetailsTab] = useState(
    /** @type {'details' | 'auction' | 'reviews'} */ ("details"),
  );
  const [topOffers, setTopOffers] = useState(
    /** @type {import('../../product-price-offer/model/types.js').PriceOfferTopEntry[]} */ ([]),
  );
  const [isUserDataConfirmed, setIsUserDataConfirmed] = useState(false);
  const modalBodyRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const tabPanelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [tabPanelMinHeight, setTabPanelMinHeight] = useState(0);

  useScrollLock(isOpen);

  const isOwnProduct =
    product != null && isCurrentUserProductSeller(product, currentUserId);
  const isSellerView = isOwnProduct;

  const auctionUi = useMemo(
    () => resolveAuctionUiState(product),
    [product],
  );
  const showReviewsTab =
    product?._id != null &&
    (product.productModerationStatus === PRODUCT_MODERATION_APPROVED ||
      isSellerView);
  const showAuctionTab =
    product?._id != null &&
    (isSellerView
      ? auctionUi.showSellerAuctionTab
      : product.productAuctionEnabled === true);
  const showProductDetailsTabs = showAuctionTab || showReviewsTab;

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

  const mediaSlides = useMemo(() => {
    const videoUrl =
      previewVideoUrl != null && !previewVideoFailed ? previewVideoUrl : null;
    const slides = buildProductMediaSlides({
      previewVideoUrl: videoUrl,
      imageUrls,
    });
    return slides.length > 0
      ? slides
      : [{ type: "image", url: PRODUCT_IMAGE_PLACEHOLDER_URL }];
  }, [imageUrls, previewVideoUrl, previewVideoFailed]);

  useEffect(() => {
    setActiveSlideIndex(0);
    setLightboxOpen(false);
    setDetailsTab("details");
    setTabPanelMinHeight(0);
    setPreviewVideoFailed(false);
  }, [product?._id]);

  useEffect(() => {
    setActiveSlideIndex((i) =>
      Math.min(i, Math.max(0, mediaSlides.length - 1)),
    );
  }, [mediaSlides.length]);

  useEffect(() => {
    setPreviewVideoFailed(false);
  }, [previewVideoUrl]);

  useEffect(() => {
    if (!isOpen || !product) {
      return;
    }
    const showReviews =
      product._id != null &&
      (product.productModerationStatus === PRODUCT_MODERATION_APPROVED ||
        isOwnProduct);
    const showAuction =
      product._id != null && product.productAuctionEnabled === true;
    if (detailsTab === "reviews" && !showReviews) {
      setDetailsTab("details");
    }
    if (detailsTab === "auction" && !showAuction) {
      setDetailsTab("details");
    }
  }, [
    detailsTab,
    isOpen,
    isOwnProduct,
    product,
    product?.productAuctionEnabled,
    product?.productModerationStatus,
    product?._id,
  ]);

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
        const { uniqueViewerCount } = await recordProductView(
          String(product._id),
        );
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
    if (!isOpen) return undefined;

    const len = mediaSlides.length;
    const onKeyDown = (event) => {
      if (lightboxOpen) return;
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (len <= 1) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveSlideIndex((i) => (i - 1 + len) % len);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveSlideIndex((i) => (i + 1) % len);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose, lightboxOpen, mediaSlides.length]);

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

  const handleSliderPrev = (event) => {
    event.stopPropagation();
    const len = mediaSlides.length;
    if (len <= 1) return;
    setActiveSlideIndex((i) => (i - 1 + len) % len);
  };

  const handleSliderNext = (event) => {
    event.stopPropagation();
    const len = mediaSlides.length;
    if (len <= 1) return;
    setActiveSlideIndex((i) => (i + 1) % len);
  };

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
  const topStatFieldKeys = topRowFieldKeys.filter(
    (key) => key !== "productPrice",
  );
  const bottomBlockFieldKeys = bottomRowFieldKeys.filter((key) =>
    PRODUCT_DETAILS_BLOCK_FIELD_KEYS.has(key),
  );
  const bottomMetaFieldKeys = bottomRowFieldKeys.filter((key) =>
    PRODUCT_DETAILS_META_FIELD_KEYS.has(key),
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
  const safeSlideIndex = Math.min(
    activeSlideIndex,
    Math.max(0, mediaSlides.length - 1),
  );
  const activeSlide = mediaSlides[safeSlideIndex] ?? null;
  const lightboxStartIndex =
    activeSlide?.type === "image"
      ? resolveProductImageIndexForLightbox(mediaSlides, safeSlideIndex)
      : 0;

  return createPortal(
    <>
      <div
        className="product-details-modal__backdrop"
        role="presentation"
        onClick={onClose}
      >
        <div
          className="product-details-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-details-modal-title"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="product-details-modal__header">
            <h2
              id="product-details-modal-title"
              className="product-details-modal__title"
            >
              {title}
            </h2>
            <button
              type="button"
              className="product-details-modal__close"
              onClick={onClose}
              aria-label={USER_DETAILS_MODAL_UI.ARIA_CLOSE}
            >
              <ModalCloseIcon />
            </button>
          </header>

          <div ref={modalBodyRef} className="product-details-modal__body">
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
                    onChanged={() => void reloadTopOffers()}
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
                        onOffersChanged={() => void reloadTopOffers()}
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
              ) : (
                <>
            <div className="product-details-modal__row-top">
              <div className="product-details-modal__image-aside">
                <div
                  className={
                    mediaSlides.length > 1
                      ? "product-details-modal__hero product-details-modal__hero--multi"
                      : "product-details-modal__hero"
                  }
                  {...(mediaSlides.length > 1
                    ? {
                        role: "region",
                        "aria-label":
                          PRODUCT_DETAILS_MODAL_UI.SLIDER_REGION_ARIA,
                      }
                    : {})}
                >
                  {mediaSlides.length > 1 ? (
                    <>
                      <div className="product-details-modal__slider-nav">
                        <button
                          type="button"
                          className="product-details-modal__slider-btn"
                          aria-label={PRODUCT_CARD_UI.GALLERY_PREV}
                          onClick={handleSliderPrev}
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          className="product-details-modal__slider-btn"
                          aria-label={PRODUCT_CARD_UI.GALLERY_NEXT}
                          onClick={handleSliderNext}
                        >
                          ›
                        </button>
                      </div>
                      <span
                        className="product-details-modal__slider-counter"
                        aria-live="polite"
                      >
                        {safeSlideIndex + 1} / {mediaSlides.length}
                      </span>
                    </>
                  ) : null}
                  {activeSlide?.type === "image" ? (
                    <button
                      type="button"
                      className="product-details-modal__image-zoom"
                      onClick={(event) => {
                        event.stopPropagation();
                        setLightboxOpen(true);
                      }}
                      aria-label={
                        PRODUCT_DETAILS_MODAL_UI.OPEN_GALLERY_FULLSCREEN
                      }
                    >
                      <ProductMediaSlideContent
                        slide={activeSlide}
                        playVideoWhenVisible={false}
                        imageClassName="product-details-modal__image"
                        onVideoFailed={() => setPreviewVideoFailed(true)}
                      />
                    </button>
                  ) : (
                    <ProductMediaSlideContent
                      slide={activeSlide}
                      playVideoWhenVisible={false}
                      imageClassName="product-details-modal__image product-details-modal__image--fill-hero"
                      onVideoFailed={() => setPreviewVideoFailed(true)}
                    />
                  )}
                </div>
                {mediaSlides.length > 1 ? (
                  <div
                    className="product-details-modal__thumbs"
                    role="tablist"
                    aria-label={PRODUCT_DETAILS_MODAL_UI.GALLERY_THUMBS_ARIA}
                  >
                    {mediaSlides.map((slide, index) => (
                      <button
                        key={`${slide.type}-${index}-${slide.url}`}
                        type="button"
                        role="tab"
                        aria-selected={index === safeSlideIndex}
                        className={
                          index === safeSlideIndex
                            ? "product-details-modal__thumb product-details-modal__thumb--active"
                            : "product-details-modal__thumb"
                        }
                        onClick={() => setActiveSlideIndex(index)}
                      >
                        {slide.type === "video" ? (
                          <span
                            className="product-details-modal__thumb-video"
                            aria-hidden="true"
                          >
                            ▶
                          </span>
                        ) : (
                          <img
                            src={slide.url}
                            alt=""
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
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
                    </div>
                  </div>
                ) : null}
                {topStatFieldKeys.length > 0 ? (
                  <dl className="product-details-modal__stats-grid">
                    {renderFieldRows(
                      product,
                      topStatFieldKeys,
                      fieldHandlers,
                    )}
                  </dl>
                ) : null}
              </div>
            </div>

            <ProductDetailsSellerPreview
              seller={product.productSeller}
              onOpenProfile={handleOpenSellerProfile}
            />

            {(bottomBlockFieldKeys.length > 0 ||
              bottomMetaFieldKeys.length > 0) && (
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
                {bottomMetaFieldKeys.length > 0 ? (
                  <dl className="product-details-modal__meta-grid">
                    {renderFieldRows(
                      product,
                      bottomMetaFieldKeys,
                      fieldHandlers,
                    )}
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
          </div>
          {secondaryFooter ? (
            <footer className="product-details-modal__footer">
              {secondaryFooter}
            </footer>
          ) : null}
          {adminFooter ? (
            <footer className="product-details-modal__footer">{adminFooter}</footer>
          ) : null}
        </div>
      </div>
      {lightboxOpen && imageUrls.length > 0 ? (
        <ProductImageLightbox
          imageUrls={imageUrls}
          startIndex={lightboxStartIndex}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </>,
    document.body,
  );
}
