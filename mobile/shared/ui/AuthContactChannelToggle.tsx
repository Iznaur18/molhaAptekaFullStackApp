import { Pressable, Text, View } from "react-native";
import { isEmailAuthEnabled } from "@izibuy/shared-lib";

import { AUTH_UI } from "@/shared/config";
import { useLoginScreenStyles } from "@/shared/theme/formChromeStyles";

type AuthChannel = "email" | "phone";

type AuthContactChannelToggleProps = {
  channel: AuthChannel;
  onChange: (channel: AuthChannel) => void;
  disabled?: boolean;
  accessibilityLabel: string;
};

export const AuthContactChannelToggle = ({
  channel,
  onChange,
  disabled = false,
  accessibilityLabel,
}: AuthContactChannelToggleProps) => {
  const styles = useLoginScreenStyles();

  if (!isEmailAuthEnabled()) {
    return null;
  }

  return (
    <View
      style={styles.channelRow}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      <Pressable
        style={({ pressed }) => [
          styles.channelBtn,
          channel === "email" && styles.channelBtnActive,
          disabled && styles.channelBtnDisabled,
          pressed && !disabled && styles.channelBtnPressed,
        ]}
        onPress={() => onChange("email")}
        disabled={disabled}
        accessibilityRole="tab"
        accessibilityState={{ selected: channel === "email" }}
      >
        <Text
          style={[
            styles.channelBtnLabel,
            channel === "email" && styles.channelBtnLabelActive,
          ]}
        >
          {AUTH_UI.CHANNEL_EMAIL}
        </Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          styles.channelBtn,
          channel === "phone" && styles.channelBtnActive,
          disabled && styles.channelBtnDisabled,
          pressed && !disabled && styles.channelBtnPressed,
        ]}
        onPress={() => onChange("phone")}
        disabled={disabled}
        accessibilityRole="tab"
        accessibilityState={{ selected: channel === "phone" }}
      >
        <Text
          style={[
            styles.channelBtnLabel,
            channel === "phone" && styles.channelBtnLabelActive,
          ]}
        >
          {AUTH_UI.CHANNEL_PHONE}
        </Text>
      </Pressable>
    </View>
  );
};
