import { Platform } from "react-native";

/** RN Web (браузер), включая mobile Safari/Chrome на :8081. */
export const isReactNativeWeb = (): boolean => Platform.OS === "web";
