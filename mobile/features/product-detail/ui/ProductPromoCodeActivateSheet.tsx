import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  activateProductPromoCode,
  fetchMyAppliedProductPromos,
} from "@/entities/product-promo-code/api/productPromoCodeApi";
import { productPromoCodeQueryKeys } from "@/entities/product-promo-code/model/productPromoCodeQueryKeys";
import { PRODUCT_PROMO_CODE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
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
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" }}
        onPress={onClose}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 16,
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.text }}>
            {PRODUCT_PROMO_CODE_UI.SHEET_TITLE}
          </Text>
          <Text style={{ color: theme.colors.textMuted }}>
            {PRODUCT_PROMO_CODE_UI.SHEET_LEAD}
          </Text>
          {applied ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: `${theme.colors.success}48`,
                backgroundColor: theme.colors.successSurface,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  color: theme.colors.successText,
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                {PRODUCT_PROMO_CODE_UI.APPLIED_LABEL}
              </Text>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: theme.colors.success,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.onContrast,
                    fontSize: 16,
                    fontWeight: "800",
                  }}
                >
                  {PRODUCT_PROMO_CODE_UI.APPLIED_PERCENT(applied.discountPercent)}
                </Text>
              </View>
            </View>
          ) : (
            <TextInput
              value={code}
              onChangeText={setCode}
              maxLength={PRODUCT_PROMO_CODE_MAX_LENGTH}
              placeholder={PRODUCT_PROMO_CODE_UI.CODE_PLACEHOLDER}
              autoCapitalize="characters"
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: theme.colors.text,
              }}
            />
          )}
          {error ? <Text style={{ color: theme.colors.danger }}>{error}</Text> : null}
          {success ? <Text style={{ color: theme.colors.text }}>{success}</Text> : null}
          {!applied ? (
            <Pressable
              onPress={() => {
                void handleActivate();
              }}
              disabled={activateMutation.isPending || !code.trim()}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
                opacity: activateMutation.isPending || !code.trim() ? 0.6 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {activateMutation.isPending
                  ? PRODUCT_PROMO_CODE_UI.ACTIVATE_PENDING
                  : PRODUCT_PROMO_CODE_UI.ACTIVATE}
              </Text>
            </Pressable>
          ) : null}
          <Pressable onPress={onClose} style={{ alignItems: "center", paddingVertical: 8 }}>
            <Text style={{ color: theme.colors.textMuted }}>
              {PRODUCT_PROMO_CODE_UI.CLOSE}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
