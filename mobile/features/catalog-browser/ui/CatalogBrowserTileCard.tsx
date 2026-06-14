import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type CatalogBrowserTileCardProps = {
  label: string;
  imageUrl?: string | null;
  onPress: () => void;
  onEditPress?: () => void;
  editAriaLabel?: string;
};

export const CatalogBrowserTileCard = ({
  label,
  imageUrl,
  onPress,
  onEditPress,
  editAriaLabel,
}: CatalogBrowserTileCardProps) => {
  const theme = useAppTheme();
  const resolvedImageUrl = imageUrl ? resolveUploadedMediaUrl(imageUrl) : "";

  return (
    <View style={styles.wrap}>
      <Pressable
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
        onPress={onPress}
      >
        <View
          style={[styles.imageWrap, { backgroundColor: theme.colors.surfaceMuted }]}
        >
          {resolvedImageUrl ? (
            <Image source={{ uri: resolvedImageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <Text style={[styles.placeholder, { color: theme.colors.textMuted }]}>
              {label.slice(0, 1).toUpperCase()}
            </Text>
          )}
        </View>
        <Text style={[styles.label, { color: theme.colors.text }]} numberOfLines={2}>
          {label}
        </Text>
      </Pressable>
      {onEditPress ? (
        <Pressable
          style={[styles.editButton, { backgroundColor: theme.colors.nearBlack }]}
          onPress={onEditPress}
          accessibilityLabel={editAriaLabel}
        >
          <Text style={styles.editButtonText}>✎</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    minWidth: "47%",
    flexGrow: 1,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: "hidden",
  },
  imageWrap: {
    aspectRatio: 1.2,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    fontSize: 28,
    fontWeight: "700",
  },
  label: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  editButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 16,
  },
});
