import { Pressable, Text, TextInput, View } from "react-native";

import { PRODUCT_MODERATION_PAGE_UI } from "@/shared/config";
import { useProductModerationDetailsFooterStyles } from "@/shared/theme/productModerationDetailsFooterStyles";

export type ProductModerationActions = {
  rejectComment: string;
  onRejectCommentChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
  isBusy?: boolean;
  errorMessage?: string;
};

type ProductModerationDetailsFooterProps = ProductModerationActions & {
  variant?: "default" | "compact";
};

export const ProductModerationDetailsFooter = ({
  rejectComment,
  onRejectCommentChange,
  onApprove,
  onReject,
  isBusy = false,
  errorMessage = "",
  variant = "default",
}: ProductModerationDetailsFooterProps) => {
  const styles = useProductModerationDetailsFooterStyles();
  const isCompact = variant === "compact";

  return (
    <View style={[styles.root, isCompact && styles.rootCompact]}>
      {errorMessage ? (
        <Text style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}
      <View style={styles.rejectLabel}>
        {isCompact ? null : <Text>{PRODUCT_MODERATION_PAGE_UI.REJECT_COMMENT_LABEL}</Text>}
        <TextInput
          style={[styles.rejectInput, isCompact && styles.rejectInputCompact]}
          value={rejectComment}
          multiline
          numberOfLines={isCompact ? 2 : 3}
          editable={!isBusy}
          placeholder={PRODUCT_MODERATION_PAGE_UI.REJECT_COMMENT_PLACEHOLDER}
          onChangeText={onRejectCommentChange}
        />
      </View>
      <View style={[styles.actions, isCompact && styles.actionsCompact]}>
        <Pressable
          style={[
            styles.rejectButton,
            isCompact && styles.rejectButtonCompact,
            isBusy && styles.buttonDisabled,
          ]}
          onPress={onReject}
          disabled={isBusy}
        >
          <Text style={styles.rejectText}>{PRODUCT_MODERATION_PAGE_UI.REJECT}</Text>
        </Pressable>
        <Pressable
          style={[
            styles.approveButton,
            isCompact && styles.approveButtonCompact,
            isBusy && styles.buttonDisabled,
          ]}
          onPress={onApprove}
          disabled={isBusy}
        >
          <Text style={styles.approveText}>
            {isBusy ? PRODUCT_MODERATION_PAGE_UI.ACTION_PENDING : PRODUCT_MODERATION_PAGE_UI.APPROVE}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
