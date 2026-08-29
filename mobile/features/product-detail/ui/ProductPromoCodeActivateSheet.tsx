import { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";

import {
  activateProductPromoCode,
  fetchMyAppliedProductPromos,
} from "@/entities/product-promo-code/api/productPromoCodeApi";
import { productPromoCodeQueryKeys } from "@/entities/product-promo-code/model/productPromoCodeQueryKeys";
import { WHOLESALE_PRICE_SHEET_LAYOUT as WS } from "@/entities/product/lib/wholesalePriceSheetLayout";
import { useWholesalePriceSheetAnimation } from "@/entities/product/model/useWholesalePriceSheetAnimation";
import { PRODUCT_PROMO_CODE_UI } from "@/shared/config";
import { textInputFocusScrollProps } from "@/shared/lib/scrollTextInputIntoViewOnFocus";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useWholesalePriceSheetStyles } from "@/shared/theme/wholesalePriceSheetStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";
import { PRODUCT_PROMO_CODE_MAX_LENGTH } from "@molha/api-contract";

const appliedMineKey = productPromoCodeQueryKeys.appliedMine();

type ProductPromoCodeActivateSheetProps = {
  isOpen: boolean;
  productId: string;
  isAuthorized: boolean;
  onRequestLogin?: () => void;
  onClose: () => void;
};

export const ProductPromoCodeActivateSheet = ({
  isOpen,
  productId,
  isAuthorized,
  onRequestLogin,
  onClose,
}: ProductPromoCodeActivateSheetProps) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useWholesalePriceSheetStyles();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const sheetSlideDistance = useMemo(() => Dimensions.get("window").height, []);
  const { modalVisible, backdropAnimatedStyle, sheetAnimatedStyle, useCssTransition } =
    useWholesalePriceSheetAnimation(isOpen, sheetSlideDistance);

  const BackdropContainer = useCssTransition ? View : Animated.View;
  const SheetContainer = useCssTransition ? View : Animated.View;

  const appliedQuery = useQuery({
    queryKey: appliedMineKey,
    queryFn: fetchMyAppliedProductPromos,
    enabled: isOpen && isAuthorized,
  });

  const applied = (appliedQuery.data?.appliedPromos ?? []).find(
    (row) => String(row.productId) === String(productId),
  );

  const activateMutation = useMutation({
    mutationFn: () => activateProductPromoCode(productId, code),
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setCode("");
    setError("");
    setSuccess("");
  }, [isOpen, productId]);

  const handleActivate = async () => {
    setError("");
    setSuccess("");
    if (!isAuthorized) {
      onRequestLogin?.();
      setError(PRODUCT_PROMO_CODE_UI.LOGIN_REQUIRED);
      return;
    }
    if (applied) {
      setError(PRODUCT_PROMO_CODE_UI.ALREADY_APPLIED);
      return;
    }
    try {
      const result = await activateMutation.mutateAsync();
      await queryClient.invalidateQueries({ queryKey: appliedMineKey });
      setSuccess(
        result.message || PRODUCT_PROMO_CODE_UI.APPLIED(result.discountPercent),
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : PRODUCT_PROMO_CODE_UI.ACTIVATE_FALLBACK,
      );
    }
  };

  if (!modalVisible) {
    return null;
  }

  const footerPaddingBottom = Math.max(insets.bottom, WS.footerPaddingHorizontal);

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <BackdropContainer
          style={[StyleSheet.absoluteFillObject, backdropAnimatedStyle]}
          pointerEvents="none"
        >
          <ModalSheetGradientBackdrop />
        </BackdropContainer>
        <Pressable
          style={styles.dismiss}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={PRODUCT_PROMO_CODE_UI.CLOSE}
        />
        <SheetContainer style={[styles.panel, sheetAnimatedStyle]}>
          <View style={styles.header}>
            <Text style={styles.title}>{PRODUCT_PROMO_CODE_UI.SHEET_TITLE}</Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
              <Text style={styles.close}>{PRODUCT_PROMO_CODE_UI.CLOSE}</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <Text style={styles.hint}>{PRODUCT_PROMO_CODE_UI.SHEET_LEAD}</Text>

            {applied ? (
              <View style={styles.promoApplied} accessibilityRole="text">
                <Text style={styles.promoAppliedLabel}>
                  {PRODUCT_PROMO_CODE_UI.APPLIED_LABEL}
                </Text>
                <Text style={styles.promoAppliedPercent}>
                  {PRODUCT_PROMO_CODE_UI.APPLIED_PERCENT(applied.discountPercent)}
                </Text>
              </View>
            ) : (
              <View style={styles.field}>
                <Text style={styles.label}>{PRODUCT_PROMO_CODE_UI.CODE_LABEL}</Text>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  maxLength={PRODUCT_PROMO_CODE_MAX_LENGTH}
                  placeholder={PRODUCT_PROMO_CODE_UI.CODE_PLACEHOLDER}
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="characters"
                  editable={!activateMutation.isPending}
                  style={styles.input}
                  {...textInputFocusScrollProps}
                />
              </View>
            )}

            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            {success ? (
              <View style={styles.promoApplied} accessibilityRole="text">
                <Text style={styles.promoAppliedSuccess}>{success}</Text>
              </View>
            ) : null}
          </ScrollView>

          {!applied ? (
            <View style={[styles.footer, { paddingBottom: footerPaddingBottom }]}>
              <AppButton
                label={
                  activateMutation.isPending
                    ? PRODUCT_PROMO_CODE_UI.ACTIVATE_PENDING
                    : PRODUCT_PROMO_CODE_UI.ACTIVATE
                }
                variant="primary"
                disabled={activateMutation.isPending || !code.trim()}
                onPress={() => {
                  void handleActivate();
                }}
                style={styles.footerButton}
              />
            </View>
          ) : null}
        </SheetContainer>
      </View>
    </Modal>
  );
};
