import { hasProductCharacteristicsContent } from "@izibuy/shared-lib";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

import {
  resolveProductDetailsBadgeExplainRequest,
  type ProductBadgeExplainRequest,
} from "@/entities/product-badge-explain/lib/resolveProductBadgeExplainSheet";
import { useProductBadgeExplainsQuery } from "@/entities/product-badge-explain/model/useProductBadgeExplainsQuery";
import { ProductBadgeExplainSheet } from "@/entities/product-badge-explain/ui/ProductBadgeExplainSheet";
import {
  getProductFieldReadLayout,
  getProductFieldLabel,
  PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS,
} from "@/entities/product/lib/productFieldRegistry";
import { getProductSellerId } from "@/entities/product/lib/getProductSellerId";
import { ProductCharacteristicsDetails } from "@/entities/product/ui/ProductCharacteristicsDetails";
import { ProductDescriptionContent } from "@/entities/product/ui/ProductDescriptionContent";
import { ProductDetailFieldRows } from "@/entities/product/ui/ProductDetailFieldRows";
import { ProductDetailsBadgeStack } from "@/entities/product/ui/ProductDetailsBadgeStack";
import { ProductAffiliateShareButton } from "@/entities/product/ui/ProductAffiliateShareButton";
import { ProductDetailsSellerPreview } from "@/entities/product/ui/ProductDetailsSellerPreview";
import { ProductPriceDisplay } from "@/entities/product/ui/ProductPriceDisplay";
import { UserProfileProductsList } from "@/entities/user/ui/UserProfileProductsList";
import { ProductDetailsAuctionTeaser } from "@/features/product-detail/ui/ProductDetailsAuctionTeaser";
import { ProductDetailsCompareTeaser } from "@/features/product-detail/ui/ProductDetailsCompareTeaser";
import { ProductDetailsInstallmentTeaser } from "@/features/product-detail/ui/ProductDetailsInstallmentTeaser";
import { ProductDetailsRaffleTeaser } from "@/features/product-detail/ui/ProductDetailsRaffleTeaser";
import { ProductDetailsRentalTeaser } from "@/features/product-detail/ui/ProductDetailsRentalTeaser";
import { ProductDetailsPromoTeaser } from "@/features/product-detail/ui/ProductDetailsPromoTeaser";
import { ProductDetailsQaTeaser } from "@/features/product-detail/ui/ProductDetailsQaTeaser";
import { ProductFlashSaleCountdown } from "@/features/product-detail/ui/ProductFlashSaleCountdown";
import { ProductPromoCodeActivateSheet } from "@/features/product-detail/ui/ProductPromoCodeActivateSheet";
import { ProductDetailsSaleTeaser } from "@/features/product-detail/ui/ProductDetailsSaleTeaser";
import { ProductDetailsWholesaleOffer } from "@/features/product-detail/ui/ProductDetailsWholesaleOffer";
import { ProductDetailsBuyNFreeOffer } from "@/features/product-detail/ui/ProductDetailsBuyNFreeOffer";
import { ProductDetailPurchaseActions } from "@/features/product-detail/ui/ProductDetailPurchaseActions";
import { ProductPickupDetailsPanel } from "@/features/product-detail/ui/ProductPickupDetailsPanel";
import { catalogQueryKeys } from "@/shared/api";
import { PRODUCT_DETAILS_MODAL_UI, PRODUCT_RENTAL_UI, SELLER_PRODUCTS_PAGE_UI } from "@/shared/config";
import { nestedHorizontalScrollProps } from "@/shared/lib/nestedHorizontalScrollProps";
import { useProductDetailScreenStyles, useProductDetailsSellerStackStyles } from "@/shared/theme/catalogProductStyles";

type ContentTabId = "description" | "characteristics" | "returns" | "delivery";

type ProductDetailsDetailsPresentation = "default" | "split-rail" | "split-rest";

type ProductDetailsDetailsTabProps = {
  product: Record<string, unknown>;
  topStatFieldKeys: readonly string[];
  onOpenInstallmentTab?: () => void;
  onOpenCompareTab?: () => void;
  onOpenQaTab?: () => void;
  onOpenAuctionTab?: () => void;
  showQaTab?: boolean;
  showCompareTab?: boolean;
  isOwnProduct?: boolean;
  auctionActive?: boolean;
  canShowAddToCart?: boolean;
  showOutOfStockPurchaseButton?: boolean;
  showBlockedPurchaseButton?: boolean;
  blockedPurchaseLabel?: string;
  showSellerClosedPurchaseButton?: boolean;
  sellerClosedPurchaseLabel?: string;
  showInlinePurchaseActions?: boolean;
  presentation?: ProductDetailsDetailsPresentation;
  isAuthorized?: boolean;
  onRequestLogin?: () => void;
};

export const ProductDetailsDetailsTab = ({
  product,
  topStatFieldKeys,
  onOpenInstallmentTab,
  onOpenCompareTab,
  onOpenQaTab,
  onOpenAuctionTab,
  showQaTab = false,
  showCompareTab = true,
  isOwnProduct = false,
  auctionActive = false,
  canShowAddToCart = true,
  showOutOfStockPurchaseButton = false,
  showBlockedPurchaseButton = false,
  blockedPurchaseLabel = "",
  showSellerClosedPurchaseButton = false,
  sellerClosedPurchaseLabel = "",
  showInlinePurchaseActions = false,
  presentation = "default",
  isAuthorized = false,
  onRequestLogin,
}: ProductDetailsDetailsTabProps) => {
  const styles = useProductDetailScreenStyles();
  const stackStyles = useProductDetailsSellerStackStyles();
  const isSplitRest = presentation === "split-rest";
  const name = String(product.productName ?? "").trim() || "Товар";
  const sellerId = getProductSellerId(product);
  const productId = product._id != null ? String(product._id) : "";
  const installmentEnabled = product.productInstallmentEnabled === true;
  const [contentTab, setContentTab] = useState<ContentTabId>("description");
  const [badgeExplain, setBadgeExplain] = useState<ProductBadgeExplainRequest | null>(
    null,
  );
  const [isPromoSheetOpen, setIsPromoSheetOpen] = useState(false);
  const queryClient = useQueryClient();
  /** Скидка истекла — тянем каталог заново, чтобы цена вернулась к базовой. */
  const handleFlashSaleExpired = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
  }, [queryClient]);

  useProductBadgeExplainsQuery({ enabled: true });

  const openBadgeExplain = (item: {
    kind: string;
    label: string;
    origin?: string | null;
    priceMarketStatus?: string | null;
  }) => {
    const request = resolveProductDetailsBadgeExplainRequest(item);
    if (!request) {
      return;
    }
    setBadgeExplain(request);
  };

  const bottomMetaFieldKeys = PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS.filter(
    (key) => getProductFieldReadLayout(key) === "meta",
  );
  const characteristics = product.productCharacteristics;
  const descriptionText = String(product.productDescription ?? "").trim();
  const hasDescription = descriptionText.length > 0;
  const hasCharacteristics = hasProductCharacteristicsContent({
    productCharacteristics: Array.isArray(characteristics) ? characteristics : [],
  });

  const availableContentTabs: ContentTabId[] = [
    ...(hasDescription ? (["description"] as const) : []),
    "delivery",
    ...(hasCharacteristics ? (["characteristics"] as const) : []),
    "returns",
  ];
  const resolvedContentTab = availableContentTabs.includes(contentTab)
    ? contentTab
    : (availableContentTabs[0] ?? "returns");
  const showContentTabs = true;

  const charItems = Array.isArray(characteristics)
    ? (characteristics as Array<{ key?: string; name?: string; value?: string }>)
    : [];

  const showDescription = hasDescription && resolvedContentTab === "description";
  const showCharacteristics = hasCharacteristics && resolvedContentTab === "characteristics";
  const showReturns = resolvedContentTab === "returns";
  const showDelivery = resolvedContentTab === "delivery";

  const panelAriaLabel = showDelivery
    ? PRODUCT_DETAILS_MODAL_UI.DELIVERY_SECTION_ARIA
    : showReturns
      ? PRODUCT_DETAILS_MODAL_UI.RETURNS_SECTION_ARIA
      : showCharacteristics
        ? PRODUCT_DETAILS_MODAL_UI.CHARACTERISTICS_SECTION_ARIA
        : PRODUCT_DETAILS_MODAL_UI.DESCRIPTION_SECTION_ARIA;

  const featureCardsBlock = (
    <View
      style={[
        styles.featureCards,
        presentation === "split-rest" && styles.featureCardsSplit,
      ]}
    >
      {onOpenQaTab ? (
        <ProductDetailsQaTeaser
          visible={showQaTab && !isOwnProduct}
          onPress={onOpenQaTab}
        />
      ) : null}
      {productId && onOpenCompareTab ? (
        <ProductDetailsCompareTeaser
          productId={productId}
          enabled={showCompareTab}
          onPress={onOpenCompareTab}
        />
      ) : null}
      <ProductDetailsRaffleTeaser product={product} />
      <ProductDetailsPromoTeaser
        product={product}
        onPress={() => setIsPromoSheetOpen(true)}
      />
      <ProductDetailsRentalTeaser
        product={product}
        onPress={() =>
          openBadgeExplain({
            kind: "rental",
            label: PRODUCT_RENTAL_UI.DETAILS_BADGE,
          })
        }
      />
      {typeof onRequestLogin === "function" ? (
        <ProductAffiliateShareButton product={product} onRequestLogin={onRequestLogin} />
      ) : null}
      {productId && onOpenInstallmentTab ? (
        <ProductDetailsInstallmentTeaser
          productId={productId}
          installmentEnabled={installmentEnabled}
          onPress={onOpenInstallmentTab}
        />
      ) : null}
      {onOpenAuctionTab ? (
        <ProductDetailsAuctionTeaser
          productId={productId}
          auctionActive={auctionActive}
          onPress={onOpenAuctionTab}
        />
      ) : null}
      {sellerId ? <ProductDetailsSaleTeaser product={product} sellerId={sellerId} /> : null}
    </View>
  );

  const sellerExtrasBlock = (
    <View style={styles.detailSellerExtras}>
      {sellerId ? (
        <UserProfileProductsList
          targetUserId={sellerId}
          hideWhenEmpty
          heading={SELLER_PRODUCTS_PAGE_UI.TITLE}
          layout="horizontal"
          currentProductId={productId}
          isSelf={isOwnProduct}
        />
      ) : null}
      {featureCardsBlock}
    </View>
  );

  const priceRailBlock = (
    <View style={[styles.priceBlock, presentation !== "default" && styles.priceBlockSplit]}>
      <ProductPriceDisplay
        product={product}
        showLabel={false}
        variant="detail"
        onDiscountBadgePress={openBadgeExplain}
        onLoyaltyBadgePress={openBadgeExplain}
      />
      <ProductFlashSaleCountdown product={product} onExpired={handleFlashSaleExpired} />
      {showInlinePurchaseActions ? (
        <ProductDetailPurchaseActions
          productId={productId}
          product={product}
          canShowAddToCart={canShowAddToCart}
          showOutOfStockPurchaseButton={showOutOfStockPurchaseButton}
          showBlockedPurchaseButton={showBlockedPurchaseButton}
          blockedPurchaseLabel={blockedPurchaseLabel}
          showSellerClosedPurchaseButton={showSellerClosedPurchaseButton}
          sellerClosedPurchaseLabel={sellerClosedPurchaseLabel}
          variant="inline"
        />
      ) : null}
      <ProductDetailsWholesaleOffer product={product} canShowAddToCart={canShowAddToCart} />
      <ProductDetailsBuyNFreeOffer
        product={product}
        isAuthorized={isAuthorized}
        onRequestLogin={onRequestLogin}
      />
      <Text style={styles.productName}>{name}</Text>
    </View>
  );

  const commerceFold = (
    <View style={styles.commerceFold}>
      <ProductDetailsBadgeStack product={product} onBadgePress={openBadgeExplain} />
      {sellerExtrasBlock}
    </View>
  );

  const contentSwitcherPanel = (
    <View
      style={styles.contentSwitcherPanel}
      role={showContentTabs && Platform.OS === "web" ? "tabpanel" : undefined}
      accessibilityLabel={panelAriaLabel}
    >
      {showDescription ? (
        <ProductDescriptionContent
          text={descriptionText}
          paragraphStyle={styles.descriptionText}
        />
      ) : null}

      {showCharacteristics ? (
        <ProductCharacteristicsDetails
          items={charItems}
          showTitle={!showContentTabs}
          embedded
        />
      ) : null}

      {showReturns ? (
        product.productReturnEnabled === true &&
        Array.isArray(product.productReturnTerms) &&
        (product.productReturnTerms as { key?: string; value?: string }[]).length > 0 ? (
          <ProductCharacteristicsDetails
            items={product.productReturnTerms as { key?: string; value?: string }[]}
            showTitle={!showContentTabs}
            embedded
            title={PRODUCT_DETAILS_MODAL_UI.RETURNS_TITLE}
            accessibilityLabel={PRODUCT_DETAILS_MODAL_UI.RETURNS_SECTION_ARIA}
          />
        ) : (
          <Text style={styles.descriptionText}>
            {product.productReturnEnabled === true
              ? PRODUCT_DETAILS_MODAL_UI.RETURNS_PLACEHOLDER
              : PRODUCT_DETAILS_MODAL_UI.RETURNS_NONE}
          </Text>
        )
      ) : null}

      {showDelivery ? <ProductPickupDetailsPanel product={product} /> : null}
    </View>
  );

  const detailsBelow = (
    <>
      <View
        style={[styles.detailsSection, presentation !== "default" && styles.detailsSectionSplit]}
        accessibilityLabel={PRODUCT_DETAILS_MODAL_UI.DETAILS_SECTION_ARIA}
      >
        {showContentTabs ? (
          <View style={styles.contentSwitcher}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.contentSwitcherTabsScroll}
              contentContainerStyle={styles.contentSwitcherTabs}
              {...nestedHorizontalScrollProps}
              keyboardShouldPersistTaps="handled"
            >
              {hasDescription ? (
                <Pressable
                  style={[
                    styles.contentSwitcherTab,
                    resolvedContentTab === "description" && styles.contentSwitcherTabActive,
                  ]}
                  onPress={() => setContentTab("description")}
                >
                  <Text
                    style={[
                      styles.contentSwitcherTabText,
                      resolvedContentTab === "description" && styles.contentSwitcherTabTextActive,
                    ]}
                  >
                    {getProductFieldLabel("productDescription")}
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                style={[
                  styles.contentSwitcherTab,
                  resolvedContentTab === "delivery" && styles.contentSwitcherTabActive,
                ]}
                onPress={() => setContentTab("delivery")}
              >
                <Text
                  style={[
                    styles.contentSwitcherTabText,
                    resolvedContentTab === "delivery" && styles.contentSwitcherTabTextActive,
                  ]}
                >
                  {PRODUCT_DETAILS_MODAL_UI.DELIVERY_TITLE}
                </Text>
              </Pressable>
              {hasCharacteristics ? (
                <Pressable
                  style={[
                    styles.contentSwitcherTab,
                    resolvedContentTab === "characteristics" && styles.contentSwitcherTabActive,
                  ]}
                  onPress={() => setContentTab("characteristics")}
                >
                  <Text
                    style={[
                      styles.contentSwitcherTabText,
                      resolvedContentTab === "characteristics" &&
                        styles.contentSwitcherTabTextActive,
                    ]}
                  >
                    {PRODUCT_DETAILS_MODAL_UI.CHARACTERISTICS_TITLE}
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                style={[
                  styles.contentSwitcherTab,
                  resolvedContentTab === "returns" && styles.contentSwitcherTabActive,
                ]}
                onPress={() => setContentTab("returns")}
              >
                <Text
                  style={[
                    styles.contentSwitcherTabText,
                    resolvedContentTab === "returns" && styles.contentSwitcherTabTextActive,
                  ]}
                >
                  {PRODUCT_DETAILS_MODAL_UI.RETURNS_TITLE}
                </Text>
              </Pressable>
            </ScrollView>
            {contentSwitcherPanel}
          </View>
        ) : (
          contentSwitcherPanel
        )}
      </View>

      <View style={[stackStyles.root, isSplitRest ? stackStyles.rootSplit : null]}>
        <ProductDetailsSellerPreview
          seller={product.productSeller}
          presentation={isSplitRest ? "split-rest" : "stack"}
          showStorefrontButton={Boolean(sellerId)}
        />
      </View>

      {topStatFieldKeys.length > 0 ? (
        <View style={[styles.spec, presentation !== "default" && styles.specSplit]}>
          <ProductDetailFieldRows product={product} fieldKeys={topStatFieldKeys} />
        </View>
      ) : null}

      {bottomMetaFieldKeys.length > 0 ? (
        <View style={[styles.spec, presentation !== "default" && styles.specSplit]}>
          <ProductDetailFieldRows
            product={product}
            fieldKeys={bottomMetaFieldKeys}
            layout="meta"
          />
        </View>
      ) : null}
    </>
  );

  const badgeExplainSheet = (
    <ProductBadgeExplainSheet
      visible={badgeExplain != null}
      title={badgeExplain?.title ?? ""}
      badgeKey={badgeExplain?.badgeKey ?? null}
      fallbackKey={badgeExplain?.fallbackKey ?? "listing_origin_unspecified"}
      contactSellerUserId={badgeExplain?.badgeKey === "rental" ? sellerId || null : null}
      onClose={() => setBadgeExplain(null)}
    />
  );

  const promoSheet =
    productId && presentation !== "split-rail" ? (
      <ProductPromoCodeActivateSheet
        isOpen={isPromoSheetOpen}
        productId={productId}
        isAuthorized={isAuthorized}
        onRequestLogin={onRequestLogin}
        onClose={() => setIsPromoSheetOpen(false)}
      />
    ) : null;

  if (presentation === "split-rail") {
    return (
      <View style={[styles.spec, styles.specSplit]}>
        {priceRailBlock}
        {badgeExplainSheet}
      </View>
    );
  }

  if (presentation === "split-rest") {
    return (
      <View style={styles.pageWideRest}>
        {commerceFold}
        {detailsBelow}
        {badgeExplainSheet}
        {promoSheet}
      </View>
    );
  }

  return (
    <View style={styles.rowTop}>
      <View style={styles.spec}>
        <View style={styles.priceBlock}>
          <ProductPriceDisplay
            product={product}
            showLabel={false}
            variant="detail"
            onDiscountBadgePress={openBadgeExplain}
            onLoyaltyBadgePress={openBadgeExplain}
          />
          <ProductFlashSaleCountdown
            product={product}
            onExpired={handleFlashSaleExpired}
          />
          <ProductDetailsWholesaleOffer
            product={product}
            canShowAddToCart={canShowAddToCart}
          />
          <ProductDetailsBuyNFreeOffer
            product={product}
            isAuthorized={isAuthorized}
            onRequestLogin={onRequestLogin}
          />
          <Text style={styles.productName}>{name}</Text>
          <ProductDetailsBadgeStack product={product} onBadgePress={openBadgeExplain} />
          {sellerExtrasBlock}
        </View>
      </View>

      {detailsBelow}

      {badgeExplainSheet}
      {promoSheet}
    </View>
  );
};
