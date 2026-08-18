import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { PRODUCT_CARD_UI, PRODUCT_MODERATION_PAGE_UI } from "@/shared/config";
import { useProductModerationDetailsFooterStyles } from "@/shared/theme/productModerationDetailsFooterStyles";

export type ProductModerationActions = {
  rejectComment: string;
  onRejectCommentChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  hasOpenSales?: boolean;
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
  onDelete,
  canDelete = false,
  hasOpenSales = false,
  isBusy = false,
  errorMessage = "",
  variant = "default",
}: ProductModerationDetailsFooterProps) => {
  const styles = useProductModerationDetailsFooterStyles();
  const isCompact = variant === "compact";
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    setIsDeleteConfirmOpen(false);
  }, [onDelete]);

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
          editable={!isBusy && !isDeleteConfirmOpen}
          placeholder={PRODUCT_MODERATION_PAGE_UI.REJECT_COMMENT_PLACEHOLDER}
          onChangeText={onRejectCommentChange}
        />
      </View>
      {canDelete && typeof onDelete === "function" ? (
        hasOpenSales ? (
          <Text style={styles.openSalesHint}>{PRODUCT_CARD_UI.OPEN_SALES_LOCKED_HINT}</Text>
        ) : isDeleteConfirmOpen ? (
          <View style={styles.deleteConfirm}>
            <Text style={styles.deleteConfirmQuestion}>
              {PRODUCT_CARD_UI.DELETE_CONFIRM_QUESTION}
            </Text>
            <View style={[styles.actions, isCompact && styles.actionsCompact]}>
              <Pressable
                style={[styles.deleteButton, styles.rowButton, isBusy && styles.buttonDisabled]}
                onPress={() => {
                  setIsDeleteConfirmOpen(false);
                  onDelete();
                }}
                disabled={isBusy}
              >
                <Text style={styles.deleteText}>{PRODUCT_CARD_UI.DELETE_CONFIRM_YES}</Text>
              </Pressable>
              <Pressable
                style={[styles.rejectButton, styles.rowButton, isBusy && styles.buttonDisabled]}
                onPress={() => setIsDeleteConfirmOpen(false)}
                disabled={isBusy}
              >
                <Text style={styles.rejectText}>{PRODUCT_CARD_UI.DELETE_CONFIRM_CANCEL}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={[styles.actions, isCompact && styles.actionsCompact]}>
            <Pressable
              style={[styles.deleteButton, styles.rowButton, isBusy && styles.buttonDisabled]}
              onPress={() => setIsDeleteConfirmOpen(true)}
              disabled={isBusy}
            >
              <Text style={styles.deleteText}>{PRODUCT_CARD_UI.DELETE_PRODUCT}</Text>
            </Pressable>
            <Pressable
              style={[
                styles.rejectButton,
                styles.rowButton,
                (isBusy || isDeleteConfirmOpen) && styles.buttonDisabled,
              ]}
              onPress={onReject}
              disabled={isBusy || isDeleteConfirmOpen}
            >
              <Text style={styles.rejectText}>{PRODUCT_MODERATION_PAGE_UI.REJECT}</Text>
            </Pressable>
          </View>
        )
      ) : (
        <View style={[styles.actions, isCompact && styles.actionsCompact]}>
          <Pressable
            style={[
              styles.approveButton,
              styles.rowButton,
              isBusy && styles.buttonDisabled,
            ]}
            onPress={onApprove}
            disabled={isBusy}
          >
            <Text style={styles.approveText}>
              {isBusy ? PRODUCT_MODERATION_PAGE_UI.ACTION_PENDING : PRODUCT_MODERATION_PAGE_UI.APPROVE}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.rejectButton,
              styles.rowButton,
              isBusy && styles.buttonDisabled,
            ]}
            onPress={onReject}
            disabled={isBusy}
          >
            <Text style={styles.rejectText}>{PRODUCT_MODERATION_PAGE_UI.REJECT}</Text>
          </Pressable>
        </View>
      )}
      {canDelete && typeof onDelete === "function" ? (
        <Pressable
          style={[
            styles.approveButton,
            styles.approveButtonWide,
            (isBusy || isDeleteConfirmOpen) && styles.buttonDisabled,
          ]}
          onPress={onApprove}
          disabled={isBusy || isDeleteConfirmOpen}
        >
          <Text style={styles.approveText}>
            {isBusy ? PRODUCT_MODERATION_PAGE_UI.ACTION_PENDING : PRODUCT_MODERATION_PAGE_UI.APPROVE}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};
