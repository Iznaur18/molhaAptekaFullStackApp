import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable } from "react-native";

import { PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";
import { copyTextToClipboard } from "@/shared/lib/copyTextToClipboard";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDetailFieldStyles } from "@/shared/theme/catalogProductStyles";

const COPY_ICON_SIZE = 16;
const COPY_FEEDBACK_MS = 2000;

type ProductDetailIdCopyButtonProps = {
  productId: string;
};

export const ProductDetailIdCopyButton = ({ productId }: ProductDetailIdCopyButtonProps) => {
  const styles = useProductDetailFieldStyles();
  const theme = useAppTheme();
  const [isCopied, setIsCopied] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current != null) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const handlePress = async () => {
    try {
      await copyTextToClipboard(productId);
      setIsCopied(true);
      if (feedbackTimerRef.current != null) {
        clearTimeout(feedbackTimerRef.current);
      }
      feedbackTimerRef.current = setTimeout(() => {
        setIsCopied(false);
        feedbackTimerRef.current = null;
      }, COPY_FEEDBACK_MS);
    } catch {
      Alert.alert(PRODUCT_DETAILS_MODAL_UI.COPY_ID_FAILED);
    }
  };

  return (
    <Pressable
      onPress={() => {
        void handlePress();
      }}
      style={({ pressed }) => [styles.copyButton, pressed && styles.copyButtonPressed]}
      accessibilityRole="button"
      accessibilityLabel={
        isCopied
          ? PRODUCT_DETAILS_MODAL_UI.COPY_ID_DONE_ARIA
          : PRODUCT_DETAILS_MODAL_UI.COPY_ID_ARIA
      }
      hitSlop={8}
    >
      <Feather
        name={isCopied ? "check" : "copy"}
        size={COPY_ICON_SIZE}
        color={isCopied ? theme.colors.success : theme.colors.textMuted}
      />
    </Pressable>
  );
};
