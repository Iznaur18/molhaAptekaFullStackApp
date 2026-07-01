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

type ProductModerationDetailsFooterProps = ProductModerationActions;

export const ProductModerationDetailsFooter = ({
  rejectComment,
  onRejectCommentChange,
  onApprove,
  onReject,
  isBusy = false,
  errorMessage = "",
}: ProductModerationDetailsFooterProps) => {
  const styles = useProductModerationDetailsFooterStyles();

  return (
    <View style={styles.root}>
      {errorMessage ? (
        <Text style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}
      <View style={styles.rejectLabel}>
        <Text>{PRODUCT_MODERATION_PAGE_UI.REJECT_COMMENT_LABEL}</Text>
        <TextInput
          style={styles.rejectInput}
          value={rejectComment}
          multiline
          numberOfLines={3}
          editable={!isBusy}
          placeholder={PRODUCT_MODERATION_PAGE_UI.REJECT_COMMENT_PLACEHOLDER}
          onChangeText={onRejectCommentChange}
        />
      </View>
      <View style={styles.actions}>
        <Pressable
          style={[styles.approveButton, isBusy && styles.buttonDisabled]}
          onPress={onApprove}
          disabled={isBusy}
        >
          <Text style={styles.approveText}>
            {isBusy ? PRODUCT_MODERATION_PAGE_UI.ACTION_PENDING : PRODUCT_MODERATION_PAGE_UI.APPROVE}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.rejectButton, isBusy && styles.buttonDisabled]}
          onPress={onReject}
          disabled={isBusy}
        >
          <Text style={styles.rejectText}>{PRODUCT_MODERATION_PAGE_UI.REJECT}</Text>
        </Pressable>
      </View>
    </View>
  );
};
