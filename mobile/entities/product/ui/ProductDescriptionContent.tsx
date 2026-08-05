import { parseProductDescriptionBlocks } from "@izibuy/shared-lib";
import { Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";

import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type ProductDescriptionContentProps = {
  text: string;
  style?: StyleProp<ViewStyle>;
  paragraphStyle?: StyleProp<TextStyle>;
  headingStyle?: StyleProp<TextStyle>;
};

export function ProductDescriptionContent({
  text,
  style,
  paragraphStyle,
  headingStyle,
}: ProductDescriptionContentProps) {
  const theme = useAppTheme();
  const blocks = parseProductDescriptionBlocks(text);
  if (blocks.length === 0) {
    return null;
  }

  return (
    <View style={[{ gap: 12 }, style]}>
      {blocks.map((block, index) =>
        block.type === "h1" ? (
          <Text
            key={`h1-${index}`}
            style={[
              {
                color: theme.colors.text,
                fontSize: 22,
                fontWeight: "700",
                lineHeight: 28,
              },
              headingStyle,
            ]}
          >
            {block.text}
          </Text>
        ) : (
          <Text
            key={`p-${index}`}
            style={[
              {
                color: theme.colors.text,
                fontSize: 15,
                fontWeight: "500",
                lineHeight: 22,
              },
              paragraphStyle,
            ]}
          >
            {block.text}
          </Text>
        ),
      )}
    </View>
  );
}
