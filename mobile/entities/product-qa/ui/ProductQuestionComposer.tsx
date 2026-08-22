import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { PRODUCT_QA_UI } from "@/shared/config";
import { textInputFocusScrollProps } from "@/shared/lib/scrollTextInputIntoViewOnFocus";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDetailTabStyles } from "@/shared/theme/catalogProductStyles";
import { AppButton } from "@/shared/ui/AppButton";

type ProductQuestionComposerProps = {
  placeholder: string;
  submitLabel: string;
  maxLength: number;
  initialText?: string;
  onSubmit: (text: string) => Promise<void>;
  isBusy?: boolean;
  errorMessage?: string;
  onCancel?: () => void;
  cancelLabel?: string;
};

/** Универсальный композер для вопроса (покупатель) и ответа (продавец). */
export const ProductQuestionComposer = ({
  placeholder,
  submitLabel,
  maxLength,
  initialText = "",
  onSubmit,
  isBusy = false,
  errorMessage = "",
  onCancel,
  cancelLabel,
}: ProductQuestionComposerProps) => {
  const theme = useAppTheme();
  const styles = useProductDetailTabStyles();
  const [text, setText] = useState(initialText);
  const trimmed = text.trim();

  const handleSubmit = async () => {
    if (!trimmed || isBusy) {
      return;
    }
    try {
      await onSubmit(trimmed);
      setText("");
    } catch {
      /* errorMessage приходит снаружи */
    }
  };

  return (
    <View style={styles.qaComposer}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        maxLength={maxLength}
        editable={!isBusy}
        multiline
        {...textInputFocusScrollProps}
      />
      <View style={styles.qaComposerFooter}>
        <Text style={styles.itemMeta}>
          {PRODUCT_QA_UI.TEXT_CHARS_USED(text.length, maxLength)}
        </Text>
        <View style={styles.actions}>
          {onCancel ? (
            <AppButton
              label={cancelLabel ?? PRODUCT_QA_UI.ANSWER_CANCEL}
              variant="outline"
              onPress={onCancel}
              disabled={isBusy}
            />
          ) : null}
          <AppButton
            label={submitLabel}
            variant="contrast"
            onPress={() => void handleSubmit()}
            disabled={isBusy || !trimmed}
          />
        </View>
      </View>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};
