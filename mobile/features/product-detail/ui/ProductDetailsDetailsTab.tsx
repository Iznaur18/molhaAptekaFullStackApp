import { hasProductCharacteristicsContent } from "@izibuy/shared-lib";
import { useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

import {
  getProductFieldReadLayout,
  getProductFieldLabel,
  PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS,
} from "@/entities/product/lib/productFieldRegistry";
import { getProductSellerId } from "@/entities/product/lib/getProductSellerId";
import { ProductCharacteristicsDetails } from "@/entities/product/ui/ProductCharacteristicsDetails";
import { ProductDetailFieldRows } from "@/entities/product/ui/ProductDetailFieldRows";
import { ProductDetailsAboveNameChips } from "@/entities/product/ui/ProductDetailsAboveNameChips";
import { ProductDetailsBadgeStack } from "@/entities/product/ui/ProductDetailsBadgeStack";
import { ProductDetailsSellerPreview } from "@/entities/product/ui/ProductDetailsSellerPreview";
import { ProductPriceDisplay } from "@/entities/product/ui/ProductPriceDisplay";
import { UserProfileProductsList } from "@/entities/user/ui/UserProfileProductsList";
import { ProductDetailsAuctionTeaser } from "@/features/product-detail/ui/ProductDetailsAuctionTeaser";
import { ProductDetailsInstallmentTeaser } from "@/features/product-detail/ui/ProductDetailsInstallmentTeaser";
import { ProductDetailsSaleTeaser } from "@/features/product-detail/ui/ProductDetailsSaleTeaser";
import { PRODUCT_DETAILS_MODAL_UI, SELLER_PRODUCTS_PAGE_UI } from "@/shared/config";
import { nestedHorizontalScrollProps } from "@/shared/lib/nestedHorizontalScrollProps";
import { useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";

type ContentTabId = "description" | "characteristics" | "returns" | "delivery";

type ProductDetailsDetailsTabProps = {
  product: Record<string, unknown>;
  topStatFieldKeys: readonly string[];
  onOpenInstallmentTab?: () => void;
  onOpenAuctionTab?: () => void;
  auctionActive?: boolean;
};

export const ProductDetailsDetailsTab = ({
  product,
  topStatFieldKeys,
  onOpenInstallmentTab,
  onOpenAuctionTab,
  auctionActive = false,
}: ProductDetailsDetailsTabProps) => {
  const styles = useProductDetailScreenStyles();
  const name = String(product.productName ?? "").trim() || "Товар";
  const sellerId = getProductSellerId(product);
  const productId = product._id != null ? String(product._id) : "";
  const installmentEnabled = product.productInstallmentEnabled === true;
  const [contentTab, setContentTab] = useState<ContentTabId>("description");

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
    ...(hasCharacteristics ? (["characteristics"] as const) : []),
    "returns",
    "delivery",
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

  return (
    <View style={styles.rowTop}>
      <View style={styles.spec}>
        <View style={styles.priceBlock}>
          <ProductPriceDisplay product={product} showLabel={false} variant="detail" />
          <ProductDetailsAboveNameChips product={product} />
          <Text style={styles.productName}>{name}</Text>
          <ProductDetailsBadgeStack product={product} />
          {(sellerId ||
            (productId && onOpenInstallmentTab) ||
            (auctionActive && onOpenAuctionTab)) ? (
            <View style={styles.detailSellerExtras}>
              {sellerId ? (
                <UserProfileProductsList
                  targetUserId={sellerId}
                  hideWhenEmpty
                  heading={SELLER_PRODUCTS_PAGE_UI.TITLE}
                  layout="horizontal"
                />
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
              {sellerId ? (
                <ProductDetailsSaleTeaser product={product} sellerId={sellerId} />
              ) : null}
            </View>
          ) : null}
        </View>
      </View>

      <View
        style={styles.detailsSection}
        accessibilityLabel={PRODUCT_DETAILS_MODAL_UI.DETAILS_SECTION_ARIA}
      >
        {showContentTabs ? (
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
          </ScrollView>
        ) : null}

        <View
          style={styles.contentSwitcherPanel}
          role={showContentTabs && Platform.OS === "web" ? "tabpanel" : undefined}
          accessibilityLabel={panelAriaLabel}
        >
          {showDescription ? (
            <Text style={styles.descriptionText}>{descriptionText}</Text>
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

          {showDelivery ? (
            <Text style={styles.descriptionText}>
              {PRODUCT_DETAILS_MODAL_UI.DELIVERY_IN_DEVELOPMENT}
            </Text>
          ) : null}
        </View>
      </View>

      <ProductDetailsSellerPreview seller={product.productSeller} />

      {topStatFieldKeys.length > 0 ? (
        <View style={styles.spec}>
          <ProductDetailFieldRows product={product} fieldKeys={topStatFieldKeys} />
        </View>
      ) : null}

      {bottomMetaFieldKeys.length > 0 ? (
        <View style={[styles.spec, styles.metaGrid]}>
          <ProductDetailFieldRows product={product} fieldKeys={bottomMetaFieldKeys} />
        </View>
      ) : null}
    </View>
  );
};
