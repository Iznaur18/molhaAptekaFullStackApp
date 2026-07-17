import { type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type AuthScreenScrollProps = {
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/**
 * На web RN ScrollView + programmatic scroll часто сбрасывают soft keyboard.
 * Используем обычный overflow-scroll контейнер без touch-responder ScrollView.
 */
export const AuthScreenScroll = ({
  style,
  contentContainerStyle,
  children,
}: AuthScreenScrollProps) => {
  if (Platform.OS === "web") {
    return (
      <View style={[style, webScrollStyle]}>
        <View style={contentContainerStyle}>{children}</View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={style}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={style}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const webScrollStyle = {
  flex: 1,
  overflow: "scroll",
  // RN-web: вертикальный скролл без ScrollView responder
  overflowY: "auto",
  overflowX: "hidden",
} as const;
