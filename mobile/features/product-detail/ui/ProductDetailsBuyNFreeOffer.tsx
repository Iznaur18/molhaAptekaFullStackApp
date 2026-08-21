import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { isProductBuyNFreeActive } from "@izibuy/shared-lib";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { ProductBadgeExplainSheet } from "@/entities/product-badge-explain/ui/ProductBadgeExplainSheet";
import { useMyProductBuyNFreeProgressQuery } from "@/entities/product/model/useMyProductBuyNFreeProgressQuery";
import { PRODUCT_BUY_N_FREE_UI } from "@/shared/config";
import { useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type ProductDetailsBuyNFreeOfferProps = {
  product: Record<string, unknown>;
  isAuthorized?: boolean;
  onRequestLogin?: () => void;
};

export const ProductDetailsBuyNFreeOffer = ({
  product,
  isAuthorized = false,
  onRequestLogin,
}: ProductDetailsBuyNFreeOfferProps) => {
  const styles = useProductDetailScreenStyles();
  const theme = useAppTheme();
  const router = useRouter();
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const isActive = isProductBuyNFreeActive(
    product as Parameters<typeof isProductBuyNFreeActive>[0],
  );
  const productId = isActive && product._id != null ? String(product._id) : "";
  const threshold = Math.max(
    2,
    Math.floor(Number(product.productBuyNFreeThreshold) || 0),
  );
  const progressQuery = useMyProductBuyNFreeProgressQuery({
    productId,
    enabled: isActive && isAuthorized && productId.length > 0,
  });

  if (!isActive) {
    return null;
  }

  const bought = isAuthorized
    ? Math.max(0, Math.floor(Number(progressQuery.data?.completedPaidOrderCount) || 0))
    : 0;
  const isReady = isAuthorized && progressQuery.data?.freeEligible === true;
  const isPending = isAuthorized && progressQuery.data?.freeClaimPending === true;
  const filled = isReady || isPending ? threshold : Math.min(bought, threshold);
  const remaining = Math.max(0, threshold - filled);

  let statusText = PRODUCT_BUY_N_FREE_UI.DETAILS_GUEST(threshold);
  let variant: "guest" | "progress" | "ready" | "pending" = "guest";
  if (isAuthorized) {
    if (isPending) {
      statusText = PRODUCT_BUY_N_FREE_UI.DETAILS_PENDING_CLAIM;
      variant = "pending";
    } else if (isReady) {
      statusText = PRODUCT_BUY_N_FREE_UI.DETAILS_READY;
      variant = "ready";
    } else {
      statusText =
        remaining > 0
          ? PRODUCT_BUY_N_FREE_UI.DETAILS_REMAINING(remaining)
          : PRODUCT_BUY_N_FREE_UI.DETAILS_PROGRESS(filled, threshold);
      variant = "progress";
    }
  }

  const progressLabel = PRODUCT_BUY_N_FREE_UI.DETAILS_PROGRESS(
    Math.min(filled, threshold),
    threshold,
  );
  const accessibilityLabel = [PRODUCT_BUY_N_FREE_UI.DETAILS_ARIA, statusText].join(". ");

  const handleLogin = () => {
    if (typeof onRequestLogin === "function") {
      onRequestLogin();
      return;
    }
    router.push("/(auth)/login");
  };

  return (
    <>
      <View
        style={[
          styles.buyNFreeCard,
          variant === "ready" ? styles.buyNFreeCardReady : null,
        ]}
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel}
      >
        <Pressable
          onPress={() => setIsExplainOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={PRODUCT_BUY_N_FREE_UI.DETAILS_INFO_ARIA}
          hitSlop={8}
          style={({ pressed }) => [
            styles.buyNFreeInfo,
            pressed ? { opacity: 0.75 } : null,
          ]}
        >
          <MaterialIcons name="info-outline" size={18} color={theme.colors.textMuted} />
        </Pressable>

        <View style={styles.buyNFreeHead}>
          <View style={styles.buyNFreeCopy}>
            <Text style={styles.buyNFreeTitle}>
              {PRODUCT_BUY_N_FREE_UI.DETAILS_TITLE(threshold)}
            </Text>
            <Text
              style={[
                styles.buyNFreeStatus,
                variant === "ready" ? styles.buyNFreeStatusReady : null,
              ]}
            >
              {statusText}
            </Text>
          </View>
          {variant === "ready" ? (
            <View style={styles.buyNFreeBadge}>
              <Text style={styles.buyNFreeBadgeText}>
                {PRODUCT_BUY_N_FREE_UI.DETAILS_READY_BADGE}
              </Text>
            </View>
          ) : null}
          {!isAuthorized ? (
            <Pressable
              onPress={handleLogin}
              accessibilityRole="button"
              accessibilityLabel={PRODUCT_BUY_N_FREE_UI.DETAILS_LOGIN}
              style={({ pressed }) => [
                styles.buyNFreeLogin,
                pressed ? { opacity: 0.85 } : null,
              ]}
            >
              <Text style={styles.buyNFreeLoginText}>
                {PRODUCT_BUY_N_FREE_UI.DETAILS_LOGIN}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.buyNFreeTrack} importantForAccessibility="no-hide-descendants">
          {Array.from({ length: threshold }, (_, index) => {
            const step = index + 1;
            const done = step <= filled;
            const isCurrent = !isReady && !isPending && step === filled + 1;
            return (
              <View
                key={step}
                style={[
                  styles.buyNFreeStamp,
                  done ? styles.buyNFreeStampDone : null,
                  isCurrent ? styles.buyNFreeStampCurrent : null,
                ]}
              >
                <Text
                  style={[
                    styles.buyNFreeStampText,
                    done ? styles.buyNFreeStampTextDone : null,
                    isCurrent ? styles.buyNFreeStampTextCurrent : null,
                  ]}
                >
                  {done ? "✓" : String(step)}
                </Text>
              </View>
            );
          })}
          <View
            style={[
              styles.buyNFreeGift,
              isReady || isPending ? styles.buyNFreeGiftUnlocked : null,
            ]}
          >
            <Text
              style={[
                styles.buyNFreeGiftLabel,
                isReady || isPending ? styles.buyNFreeGiftLabelUnlocked : null,
              ]}
            >
              {PRODUCT_BUY_N_FREE_UI.DETAILS_STAMP_GIFT}
            </Text>
            <Text
              style={[
                styles.buyNFreeGiftValue,
                isReady || isPending ? styles.buyNFreeGiftValueUnlocked : null,
              ]}
            >
              {PRODUCT_BUY_N_FREE_UI.DETAILS_READY_BADGE}
            </Text>
          </View>
        </View>

        {isAuthorized && variant === "progress" ? (
          <View style={styles.buyNFreeMeter}>
            <View
              style={[
                styles.buyNFreeMeterFill,
                { width: `${Math.round((filled / threshold) * 100)}%` as `${number}%` },
              ]}
            />
            <Text style={styles.buyNFreeMeterLabel}>{progressLabel}</Text>
          </View>
        ) : null}
      </View>

      <ProductBadgeExplainSheet
        visible={isExplainOpen}
        title={PRODUCT_BUY_N_FREE_UI.DETAILS_EXPLAIN_TITLE}
        description={PRODUCT_BUY_N_FREE_UI.DETAILS_EXPLAIN(threshold)}
        onClose={() => setIsExplainOpen(false)}
      />
    </>
  );
};
