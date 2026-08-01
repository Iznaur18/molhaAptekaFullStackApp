import {
  AFFILIATE_MANAGE_DEFAULT_PERCENT,
  AFFILIATE_PERCENT_MIN,
  isProductAffiliateConfigured,
  resolveAffiliateEnableLoyaltyGate,
} from "@izibuy/shared-lib";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useMyProductMutations } from "@/entities/product/model/useMyProductMutations";
import { useMyLoyaltyPointsStatusQuery } from "@/entities/user/model/useMyLoyaltyPointsStatusQuery";
import { CREATE_PRODUCT_UI } from "@/shared/config";
import { keepDigitsOnly } from "@/shared/lib/rubPriceInput";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useInstallmentProgramModalStyles } from "@/shared/theme/sellerFlowStyles";

type CatalogProduct = Record<string, unknown> & { _id: string };

type AffiliatePercentModalProps = {
  visible: boolean;
  product: CatalogProduct | null;
  onClose: () => void;
  onSaved?: (product: CatalogProduct) => void;
  /** Внутри другого Modal на iOS — отдельный RN Modal не открывается. */
  embedded?: boolean;
};

export const AffiliatePercentModal = ({
  visible,
  product,
  onClose,
  onSaved,
  embedded = false,
}: AffiliatePercentModalProps) => {
  const styles = useInstallmentProgramModalStyles();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const headerInsetTop = Math.max(insets.top, 16);
  const footerInsetBottom = Math.max(insets.bottom, 12);
  const { patchMutation } = useMyProductMutations();
  const loyaltyStatusQuery = useMyLoyaltyPointsStatusQuery(visible);

  const [percent, setPercent] = useState(String(AFFILIATE_MANAGE_DEFAULT_PERCENT));
  const [error, setError] = useState("");

  const productId = product?._id != null ? String(product._id) : "";
  const isSubmitting = patchMutation.isPending;

  useEffect(() => {
    if (!visible || !product) {
      return;
    }
    setError("");
    const existing = Math.floor(Number(product.affiliatePercent) || 0);
    setPercent(
      String(
        existing >= AFFILIATE_PERCENT_MIN
          ? existing
          : AFFILIATE_MANAGE_DEFAULT_PERCENT,
      ),
    );
  }, [product, visible]);

  const handleSave = async () => {
    setError("");
    const nextPercent = Math.floor(Number(percent));
    if (
      !Number.isFinite(nextPercent) ||
      !isProductAffiliateConfigured({ affiliatePercent: nextPercent })
    ) {
      setError(CREATE_PRODUCT_UI.AFFILIATE_MODAL_ERROR_REQUIRED);
      return;
    }

    if (product?.affiliateEnabled !== true) {
      const gate = resolveAffiliateEnableLoyaltyGate({
        productPrice: product?.productPrice,
        affiliatePercent: nextPercent,
        loyaltyPointsBalance: loyaltyStatusQuery.data?.loyaltyPointsBalance ?? 0,
        loyaltyPointsReserved: loyaltyStatusQuery.data?.loyaltyPointsReserved ?? 0,
      });
      if (!gate.ok) {
        setError(gate.message);
        return;
      }
    }

    try {
      const updated = await patchMutation.mutateAsync({
        productId,
        body: {
          affiliatePercent: nextPercent,
          affiliateEnabled: true,
        },
      });
      onSaved?.(updated as CatalogProduct);
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : CREATE_PRODUCT_UI.AFFILIATE_MODAL_ERROR_REQUIRED,
      );
    }
  };

  if (!visible) {
    return null;
  }

  const sheet = (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={[styles.header, { paddingTop: headerInsetTop }]}>
          <Text style={styles.title}>{CREATE_PRODUCT_UI.AFFILIATE_MODAL_TITLE}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={CREATE_PRODUCT_UI.AFFILIATE_MODAL_CLOSE}
            onPress={onClose}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.info}>{CREATE_PRODUCT_UI.AFFILIATE_MODAL_HINT}</Text>
          <Text style={styles.info}>{CREATE_PRODUCT_UI.AFFILIATE_MODAL_BUDGET_HINT}</Text>

          <View style={styles.rowField}>
            <Text style={styles.fieldLabel}>
              {CREATE_PRODUCT_UI.AFFILIATE_MODAL_PERCENT_LABEL}
            </Text>
            <TextInput
              style={styles.input}
              value={percent}
              keyboardType="number-pad"
              editable={!isSubmitting}
              maxLength={2}
              onChangeText={(text) => setPercent(keepDigitsOnly(text))}
            />
          </View>

          {error ? (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: footerInsetBottom }]}>
          <Pressable
            style={[styles.saveButton, (isSubmitting || !productId) && styles.buttonDisabled]}
            accessibilityRole="button"
            disabled={isSubmitting || !productId}
            onPress={() => void handleSave()}
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.onContrast} />
            ) : (
              <Text style={styles.saveButtonText}>{CREATE_PRODUCT_UI.AFFILIATE_MODAL_SAVE}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );

  if (embedded) {
    return (
      <View style={styles.embeddedRoot} pointerEvents="box-none">
        {sheet}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType={Platform.OS === "web" ? "none" : "slide"}
      transparent
      onRequestClose={onClose}
    >
      {sheet}
    </Modal>
  );
};
