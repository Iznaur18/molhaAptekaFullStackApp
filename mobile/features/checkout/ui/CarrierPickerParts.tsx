import { Pressable, Text, TextInput, View } from "react-native";

import { CHECKOUT_FORM_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useCdekPickupPointPickerStyles } from "@/shared/theme/formChromeStyles";

/**
 * Общие части выбора пункта выдачи: две службы рядом — одна система, как и
 * на сайте, где Яндекс переиспользует вёрстку пикера СДЭК.
 */

type CarrierCitySearchProps = {
  city: string;
  onCityChange: (city: string) => void;
  onFind: () => void;
  isLoading: boolean;
  disabled?: boolean;
};

/** Город получения и кнопка «Найти пункты». */
export const CarrierCitySearch = ({
  city,
  onCityChange,
  onFind,
  isLoading,
  disabled = false,
}: CarrierCitySearchProps) => {
  const styles = useCdekPickupPointPickerStyles();
  const theme = useAppTheme();
  const isBusy = disabled || isLoading;
  const canFind = !isBusy && city.trim().length >= 2;

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>{CHECKOUT_FORM_UI.CDEK_CITY_LABEL}</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={onCityChange}
          placeholder={CHECKOUT_FORM_UI.CDEK_CITY_PLACEHOLDER}
          placeholderTextColor={theme.colors.textMuted}
          editable={!isBusy}
          returnKeyType="search"
          onSubmitEditing={onFind}
        />
      </View>
      <Pressable
        style={[styles.findButton, !canFind && styles.disabled]}
        onPress={onFind}
        disabled={!canFind}
        accessibilityRole="button"
      >
        <Text style={styles.findButtonText}>
          {isLoading
            ? CHECKOUT_FORM_UI.CDEK_LOADING
            : CHECKOUT_FORM_UI.CDEK_FIND_POINTS}
        </Text>
      </Pressable>
    </>
  );
};

type CarrierRecipientFieldsProps = {
  name: string;
  phone: string;
  onNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
  /** Зачем службе телефон — у каждой своя причина. */
  phoneLabel: string;
  disabled?: boolean;
};

/** Получатель посылки: имя и телефон, без которого служба заказ не примет. */
export const CarrierRecipientFields = ({
  name,
  phone,
  onNameChange,
  onPhoneChange,
  phoneLabel,
  disabled = false,
}: CarrierRecipientFieldsProps) => {
  const styles = useCdekPickupPointPickerStyles();
  const theme = useAppTheme();

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>{CHECKOUT_FORM_UI.CDEK_RECIPIENT_NAME}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={onNameChange}
          editable={!disabled}
          autoComplete="name"
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{phoneLabel}</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={onPhoneChange}
          editable={!disabled}
          keyboardType="phone-pad"
          autoComplete="tel"
          placeholder={CHECKOUT_FORM_UI.CDEK_RECIPIENT_PHONE_PLACEHOLDER}
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>
    </>
  );
};
