import { useMutation } from "@tanstack/react-query";
import { Alert, Switch, Text, View } from "react-native";

import { patchSellerProductModerationTrust } from "@/entities/user/api/patchSellerProductModerationTrust";
import { ADMIN_PRODUCT_MODERATION_TRUST_UI } from "@/shared/config";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

type AdminProductModerationTrustControlProps = {
  userId: string;
  isTrusted: boolean;
  onChanged: (patch: { productModerationTrusted: boolean }) => void;
};

const useStyles = createThemedStyles((theme) => ({
  root: {
    marginTop: theme.spacing[4],
    gap: theme.spacing[2],
    padding: theme.spacing[3],
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  status: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.textMuted,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing[2],
  },
  toggleLabel: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },
  error: {
    fontSize: 13,
    color: theme.colors.danger,
  },
}));

export const AdminProductModerationTrustControl = ({
  userId,
  isTrusted,
  onChanged,
}: AdminProductModerationTrustControlProps) => {
  const styles = useStyles();
  const trustMutation = useMutation({
    mutationFn: (trusted: boolean) => patchSellerProductModerationTrust({ userId, trusted }),
    onSuccess: (seller) => onChanged(seller),
  });

  const handleToggle = (nextTrusted: boolean) => {
    Alert.alert(
      ADMIN_PRODUCT_MODERATION_TRUST_UI.TITLE,
      nextTrusted
        ? ADMIN_PRODUCT_MODERATION_TRUST_UI.CONFIRM_GRANT
        : ADMIN_PRODUCT_MODERATION_TRUST_UI.CONFIRM_REVOKE,
      [
        { text: ADMIN_PRODUCT_MODERATION_TRUST_UI.CANCEL, style: "cancel" },
        {
          text: ADMIN_PRODUCT_MODERATION_TRUST_UI.CONFIRM_ACTION,
          onPress: () => trustMutation.mutate(nextTrusted),
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{ADMIN_PRODUCT_MODERATION_TRUST_UI.TITLE}</Text>
      <Text style={styles.status}>
        {isTrusted
          ? ADMIN_PRODUCT_MODERATION_TRUST_UI.STATUS_ON
          : ADMIN_PRODUCT_MODERATION_TRUST_UI.STATUS_OFF}
      </Text>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>
          {ADMIN_PRODUCT_MODERATION_TRUST_UI.TOGGLE_LABEL}
        </Text>
        <Switch
          value={isTrusted}
          onValueChange={handleToggle}
          disabled={trustMutation.isPending}
        />
      </View>

      <Text style={styles.hint}>{ADMIN_PRODUCT_MODERATION_TRUST_UI.HINT}</Text>

      {trustMutation.error instanceof Error ? (
        <Text style={styles.error}>{trustMutation.error.message}</Text>
      ) : null}
    </View>
  );
};
